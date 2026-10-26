import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
import { ORDER_STATUSES, STATUS_DB_VALUES, type OrderStatusValue } from "@/lib/site";
import { cleanText, isUuid, toInt } from "@/lib/validate";
import { sendOrderStatusUpdate } from "@/lib/mail";

const ORDER_INCLUDE = {
  items: true,
  user: { select: { id: true, name: true, email: true, createdAt: true, kyc: { select: { status: true } } } },
} satisfies Prisma.OrderInclude;

/**
 * GET /api/dashboard/orders — admin only.
 *   ?status=PENDING|PROCESSING|COMPLETED|CANCELLED (tab)
 *   ?q=<order id / name / email / phone>   ?from=YYYY-MM-DD  ?to=YYYY-MM-DD
 *   ?payment=cod|bank_transfer   ?page=1  ?pageSize=25
 */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return FORBIDDEN();

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") as OrderStatusValue | null;
  const q = cleanText(sp.get("q"), 80);
  const payment = cleanText(sp.get("payment"), 30);
  const from = sp.get("from");
  const to = sp.get("to");
  const page = Math.max(1, toInt(sp.get("page"), 1));
  const pageSize = Math.min(100, Math.max(5, toInt(sp.get("pageSize"), 25)));

  const where: Prisma.OrderWhereInput = {};
  if (status && ORDER_STATUSES.includes(status)) {
    where.status = { in: STATUS_DB_VALUES[status] as Prisma.EnumOrderStatusFilter["in"] };
  }
  if (payment) where.paymentMethod = payment;
  if (from || to) {
    where.createdAt = {};
    if (from && !Number.isNaN(Date.parse(from))) where.createdAt.gte = new Date(from);
    if (to && !Number.isNaN(Date.parse(to))) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }
  if (q) {
    where.OR = [
      { id: { startsWith: q.toLowerCase() } },
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { city: { contains: q, mode: "insensitive" } },
      { items: { some: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

  const [orders, total, counts, revenueAll, revenueMonth, todayOrders] = await Promise.all([
    prisma.order.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { notIn: ["CANCELLED"] } } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { notIn: ["CANCELLED"] }, createdAt: { gte: startOfMonth } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
  ]);

  // Collapse legacy statuses into the 4 display buckets.
  const byStatus: Record<OrderStatusValue | "ALL", number> = { ALL: 0, PENDING: 0, PROCESSING: 0, COMPLETED: 0, CANCELLED: 0 };
  for (const c of counts) {
    const bucket = (Object.keys(STATUS_DB_VALUES) as OrderStatusValue[]).find((k) =>
      STATUS_DB_VALUES[k].includes(c.status)
    );
    if (bucket) byStatus[bucket] += c._count._all;
    byStatus.ALL += c._count._all;
  }

  return NextResponse.json({
    stats: {
      totalOrders: byStatus.ALL,
      todayOrders,
      totalRevenue: revenueAll._sum.totalAmount || 0,
      monthRevenue: revenueMonth._sum.totalAmount || 0,
      byStatus,
    },
    orders,
    pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

/**
 * PATCH /api/dashboard/orders — admin updates an order's status.
 * Body: { id: string, status: OrderStatusValue }
 * Cancelling returns stock; un-cancelling re-reserves it.
 */
export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return FORBIDDEN();

  const { id, status } = await req.json().catch(() => ({}));
  if (!isUuid(id) || !ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Valid id and status required" }, { status: 400 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!order) throw new Error("NOT_FOUND");
      if (order.status === status) return order;

      const wasCancelled = order.status === "CANCELLED";
      const willCancel = status === "CANCELLED";

      if (willCancel && !wasCancelled) {
        for (const it of order.items) {
          if (it.productId) await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
        }
      } else if (wasCancelled && !willCancel) {
        for (const it of order.items) {
          if (it.productId) {
            const dec = await tx.product.updateMany({
              where: { id: it.productId, stock: { gte: it.quantity } },
              data: { stock: { decrement: it.quantity } },
            });
            if (dec.count === 0) throw new Error(`NO_STOCK:${it.name}`);
          }
        }
      }

      return tx.order.update({ where: { id }, data: { status }, include: ORDER_INCLUDE });
    });

    void sendOrderStatusUpdate({ id: updated.id, email: updated.email, fullName: updated.fullName, status });
    return NextResponse.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (msg.startsWith("NO_STOCK:")) {
      return NextResponse.json({ error: `Cannot reopen: not enough stock for ${msg.slice(9)}` }, { status: 409 });
    }
    console.error("ORDER_STATUS_ERROR:", e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
