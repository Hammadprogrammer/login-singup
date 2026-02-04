import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper to verify user
function getAuthUser(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as { id: number };
  } catch { return null; }
}

// GET: Fetch all items
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

// POST: Add or Increment
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json(); // Pehle JSON parse karein
    const { productId, quantity, size } = body;

    const existing = await prisma.cart.findUnique({
      where: { userId_productId: { userId: user.id, productId } }
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
    console.error("API POST ERROR:", err.message);
    return NextResponse.json({ error: "Server Error", details: err.message }, { status: 500 });
  }
}

// PATCH: Update quantity
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

// DELETE: Remove item
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await prisma.cart.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}