import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

/**
 * GET /api/dashboard/analytics — admin-only.
 * Search & product-view analytics + product performance.
 */
export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalSearches,
    totalViews,
    topSearchesRaw,
    recentSearches,
    topViewedRaw,
  ] = await Promise.all([
    prisma.searchLog.count(),
    prisma.productView.count(),
    // Most frequent search queries.
    prisma.searchLog.groupBy({
      by: ["query"],
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    }),
    prisma.searchLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    // Most viewed products.
    prisma.productView.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),
  ]);

  // Hydrate the most-viewed products with product details.
  const viewedIds = topViewedRaw.map((v: { productId: string }) => v.productId);
  const viewedProducts = viewedIds.length
    ? await prisma.product.findMany({
        where: { id: { in: viewedIds } },
        select: { id: true, name: true, price: true, imageUrls: true },
      })
    : [];

  const topViewed = topViewedRaw.map((v: { productId: string; _count: { productId: number } }) => ({
    product: viewedProducts.find((p: { id: string }) => p.id === v.productId) || null,
    productId: v.productId,
    views: v._count.productId,
  }));

  const topSearches = topSearchesRaw.map((s: { query: string; _count: { query: number } }) => ({
    query: s.query,
    count: s._count.query,
  }));

  return NextResponse.json({
    stats: { totalSearches, totalViews },
    topSearches,
    recentSearches,
    topViewed,
  });
}
