import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
import { STATUS_DB_VALUES, type OrderStatusValue } from "@/lib/site";

/** GET /api/dashboard/stats — real database numbers for the admin overview. */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return FORBIDDEN();

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const since30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

  const [
    totalUsers,
    todayUsers,
    totalProducts,
    publishedProducts,
    lowStock,
    outOfStock,
    orderCounts,
    revenueAll,
    revenueMonth,
    revenueToday,
    kycPending,
    kycApproved,
    pendingReviews,
    unreadMessages,
    recentOrders,
    last30,
    topSelling,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.product.count(),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.product.findMany({
      where: { stock: { gt: 0, lte: 5 } },
      select: { id: true, name: true, stock: true, imageUrls: true, categories: true },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfDay } } }),
    prisma.kYC.count({ where: { status: "PENDING" } }),
    prisma.kYC.count({ where: { status: "APPROVED" } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.order.findMany({
      include: { items: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: since30 }, status: { not: "CANCELLED" } },
      select: { createdAt: true, totalAmount: true },
    }),
    prisma.orderItem.groupBy({
      by: ["name"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const byStatus: Record<OrderStatusValue | "ALL", number> = { ALL: 0, PENDING: 0, PROCESSING: 0, COMPLETED: 0, CANCELLED: 0 };
  for (const c of orderCounts) {
    const bucket = (Object.keys(STATUS_DB_VALUES) as OrderStatusValue[]).find((k) => STATUS_DB_VALUES[k].includes(c.status));
    if (bucket) byStatus[bucket] += c._count._all;
    byStatus.ALL += c._count._all;
  }

  // Daily revenue series for the last 30 days (sparkline-ready).
  const series: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(startOfDay.getTime() - i * 24 * 3600 * 1000);
    series.push({ date: d.toISOString().slice(0, 10), revenue: 0, orders: 0 });
  }
  const idx = new Map(series.map((s, i) => [s.date, i]));
  for (const o of last30) {
    const key = o.createdAt.toISOString().slice(0, 10);
    const i = idx.get(key);
    if (i !== undefined) {
      series[i].revenue += o.totalAmount;
      series[i].orders += 1;
    }
  }

  return NextResponse.json({
    users: { total: totalUsers, today: todayUsers },
    products: { total: totalProducts, published: publishedProducts, outOfStock, lowStock },
    orders: { byStatus, today: recentOrders.filter((o) => o.createdAt >= startOfDay).length },
    revenue: {
      total: revenueAll._sum.totalAmount || 0,
      month: revenueMonth._sum.totalAmount || 0,
      today: revenueToday._sum.totalAmount || 0,
    },
    kyc: { pending: kycPending, approved: kycApproved },
    pendingReviews,
    unreadMessages,
    recentOrders,
    series,
    topSelling: topSelling.map((t) => ({ name: t.name, quantity: t._sum.quantity || 0 })),
  });
}
