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
    const { cartItemId, quantity } = await req.json();
    const updated = await prisma.cart.update({
      where: { id: Number(cartItemId) },
      data: { quantity: Number(quantity) }
    });
    return NextResponse.json(updated);
  } catch { return NextResponse.json({ error: "Update failed" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await prisma.cart.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}