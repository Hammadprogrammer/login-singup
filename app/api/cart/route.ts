import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, UNAUTHORIZED } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { cleanText, clampInt, isUuid, toInt } from "@/lib/validate";

const CART_PRODUCT_SELECT = {
  id: true, name: true, price: true, stock: true, imageUrls: true, sizes: true, categories: true, brands: true, isPublished: true,
};

const MAX_QTY = 10;

export async function GET(req: NextRequest) {
  const user = requireUser(req);
  if (!user) return UNAUTHORIZED();

  const items = await prisma.cart.findMany({
    where: { userId: user.id },
    include: { product: { select: CART_PRODUCT_SELECT } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const user = requireUser(req);
    if (!user) return UNAUTHORIZED();
    const limited = enforceRateLimit(req, "cart", LIMITS.cart);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const productId = body.productId;
    const size = cleanText(body.size, 10);
    const quantity = clampInt(body.quantity, 1, MAX_QTY, 1);

    if (!isUuid(productId)) return NextResponse.json({ error: "Invalid product" }, { status: 400 });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isPublished) return NextResponse.json({ error: "Product unavailable" }, { status: 404 });
    if (product.sizes.length > 0 && !product.sizes.includes(size)) {
      return NextResponse.json({ error: "Please select an available size" }, { status: 400 });
    }
    if (product.stock <= 0) return NextResponse.json({ error: "This item is out of stock" }, { status: 409 });

    const existing = await prisma.cart.findFirst({ where: { userId: user.id, productId, size: size || null } });
    const newQty = Math.min(MAX_QTY, (existing?.quantity ?? 0) + quantity);
    if (newQty > product.stock) {
      return NextResponse.json({ error: `Only ${product.stock} left in stock` }, { status: 409 });
    }

    const item = existing
      ? await prisma.cart.update({ where: { id: existing.id }, data: { quantity: newQty } })
      : await prisma.cart.create({ data: { userId: user.id, productId, quantity: newQty, size: size || null } });

    return NextResponse.json(item, { status: existing ? 200 : 201 });
  } catch (err) {
    console.error("CART_POST_ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = requireUser(req);
    if (!user) return UNAUTHORIZED();

    const body = await req.json().catch(() => ({}));
    const cartItemId = toInt(body.cartItemId);
    const quantity = clampInt(body.quantity, 1, MAX_QTY, 1);

    const item = await prisma.cart.findUnique({ where: { id: cartItemId }, include: { product: { select: { stock: true } } } });
    if (!item || item.userId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (quantity > item.product.stock) {
      return NextResponse.json({ error: `Only ${item.product.stock} left in stock` }, { status: 409 });
    }

    const updated = await prisma.cart.update({ where: { id: item.id }, data: { quantity } });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = requireUser(req);
  if (!user) return UNAUTHORIZED();

  const id = toInt(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const item = await prisma.cart.findUnique({ where: { id } });
  if (!item || item.userId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.cart.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
