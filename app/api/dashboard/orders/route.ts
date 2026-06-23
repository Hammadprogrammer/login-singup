import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

/**
 * GET /api/dashboard/orders — admin-only.
 * Returns all orders (with user + items) plus headline stats.
 * Optional ?status=PENDING|PAID|... filter.
 */
export async function GET(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where = status ? { status: status as any } : {};

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalOrders, todayOrders, revenueAgg, pendingCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({
    stats: {
      totalOrders,
      todayOrders,
      totalRevenue: revenueAgg._sum.totalAmount || 0,
      pendingOrders: pendingCount,
    },
    orders,
  });
}

/**
 * PATCH /api/dashboard/orders — admin updates an order's status.
 * Body: { id: string, status: OrderStatus }
 */
export async function PATCH(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, status } = await req.json();
  const allowed = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!id || !allowed.includes(status)) {
    return NextResponse.json({ error: "Valid id and status required" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}
