import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireUser, requireAdmin, UNAUTHORIZED, FORBIDDEN } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { cleanString, cleanText, clampInt, isUuid, toInt } from "@/lib/validate";

const PUBLIC_SELECT = {
  id: true,
  rating: true,
  title: true,
  comment: true,
  createdAt: true,
  user: { select: { name: true } },
  product: { select: { id: true, name: true, imageUrls: true } },
} satisfies Prisma.ReviewSelect;

/**
 * GET /api/reviews — approved reviews (public). ?productId=<uuid> to scope.
 *   ?all=1 (admin) returns every review incl. pending, with user emails.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const admin = sp.get("all") === "1";
  if (admin && !requireAdmin(req)) return FORBIDDEN();

  const where: Prisma.ReviewWhereInput = admin ? {} : { isApproved: true };
  const productId = sp.get("productId");
  if (productId) {
    if (!isUuid(productId)) return NextResponse.json([]);
    where.productId = productId;
  }

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: admin
      ? { ...PUBLIC_SELECT, isApproved: true, user: { select: { id: true, name: true, email: true } } }
      : PUBLIC_SELECT,
  });

  const agg = await prisma.review.aggregate({ where: { isApproved: true, ...(where.productId ? { productId: where.productId } : {}) }, _avg: { rating: true }, _count: true });
  return NextResponse.json({ reviews, average: agg._avg.rating ?? 0, count: agg._count });
}

/** POST /api/reviews — logged-in customers only. Body: { rating, title?, comment, productId? } */
export async function POST(req: NextRequest) {
  try {
    const user = requireUser(req);
    if (!user) return UNAUTHORIZED();
    const limited = enforceRateLimit(req, "review", LIMITS.review);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const rating = clampInt(body.rating, 1, 5, 0);
    const title = cleanText(body.title, 100);
    const comment = cleanString(body.comment, 1200);
    const productId = body.productId;

    if (!rating) return NextResponse.json({ error: "Please choose a rating from 1 to 5" }, { status: 400 });
    if (comment.length < 10) return NextResponse.json({ error: "Please write at least 10 characters" }, { status: 400 });
    if (productId !== undefined && productId !== null && productId !== "" && !isUuid(productId)) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    if (productId) {
      const exists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
      if (!exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      // Only one review per customer per product.
      const dup = await prisma.review.findFirst({ where: { userId: user.id, productId } });
      if (dup) return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: { userId: user.id, productId: productId || null, rating, title: title || null, comment },
      select: { id: true, rating: true, title: true, comment: true, isApproved: true, createdAt: true },
    });
    return NextResponse.json({ ...review, message: "Thanks! Your review will appear once approved." }, { status: 201 });
  } catch (error) {
    console.error("REVIEW_POST_ERROR:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

/** PATCH /api/reviews — admin moderation. Body: { id, isApproved } */
export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return FORBIDDEN();
  const body = await req.json().catch(() => ({}));
  const id = toInt(body.id);
  if (!id || typeof body.isApproved !== "boolean") return NextResponse.json({ error: "id and isApproved required" }, { status: 400 });
  const updated = await prisma.review.update({ where: { id }, data: { isApproved: body.isApproved } });
  return NextResponse.json(updated);
}

/** DELETE /api/reviews — admin, or the author of the review. Body: { id } */
export async function DELETE(req: NextRequest) {
  const user = requireUser(req);
  if (!user) return UNAUTHORIZED();
  const { id: rawId } = await req.json().catch(() => ({}));
  const id = toInt(rawId);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.userId !== user.id && user.role !== "ADMIN") return FORBIDDEN();

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
