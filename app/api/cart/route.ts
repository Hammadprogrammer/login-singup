import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

function getAuthUser(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as { id: number };
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const items = await prisma.cart.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, quantity, size } = await req.json();

    // Size-specific check: logic updated to handle multiple sizes of same product
    const existing = await prisma.cart.findFirst({
      where: { 
        userId: user.id, 
        productId: productId,
        size: size 
      }
    });

    if (existing) {
      const updated = await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (Number(quantity) || 1) }
      });
      return NextResponse.json(updated);
    }

    const newItem = await prisma.cart.create({
      data: { 
        userId: user.id, 
        productId, 
        quantity: Number(quantity) || 1, 
        size 
      }
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cartItemId, quantity } = await req.json();
    const item = await prisma.cart.findUnique({ where: { id: Number(cartItemId) } });
    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.cart.update({
      where: { id: item.id },
      data: { quantity: Math.max(1, Number(quantity) || 1) }
    });
    return NextResponse.json(updated);
  } catch { return NextResponse.json({ error: "Update failed" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const item = await prisma.cart.findUnique({ where: { id } });
  if (!item || item.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.cart.delete({ where: { id } });
  return NextResponse.json({ success: true });
}