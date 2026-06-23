import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

/**
 * GET /api/dashboard/user-detail?id=<userId>
 * Admin-only. Returns a full 360° view of a single user:
 * account info, their orders, search history, product views and listings.
 */
export async function GET(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("id"));
  if (!userId || Number.isNaN(userId)) {
    return NextResponse.json({ error: "Valid user id required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      provider: true,
      createdAt: true,
      kyc: { select: { status: true, fullName: true, documentType: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let orders: any[] = [];
  let searches: any[] = [];
  let views: any[] = [];
  let products: any[] = [];

  try {
    [orders, searches, views, products] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.searchLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.productView.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          product: { select: { id: true, name: true, price: true, imageUrls: true } },
        },
      }),
      prisma.product.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          price: true,
          imageUrls: true,
          isPublished: true,
          createdAt: true,
        },
      }),
    ]);
  } catch (err) {
    console.error("[user-detail] Prisma query error:", err);
    return NextResponse.json({ error: "Failed to load user activity data" }, { status: 500 });
  }

  const totalSpent = orders.reduce(
    (acc: number, o: { totalAmount: number }) => acc + o.totalAmount,
    0
  );

  return NextResponse.json({
    user,
    stats: {
      orderCount: orders.length,
      totalSpent,
      searchCount: searches.length,
      viewCount: views.length,
      productCount: products.length,
    },
    orders,
    searches,
    views,
    products,
  });
}
