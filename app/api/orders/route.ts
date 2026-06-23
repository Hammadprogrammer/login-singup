import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

interface IncomingItem {
  id?: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  size?: string;
  imageUrls?: string[];
  imageUrl?: string;
}

/**
 * GET /api/orders
 *  - normal user: returns only their own orders
 *  - admin: pass ?userId=<id> to view a specific user's orders
 */
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const requestedUserId = searchParams.get("userId");

  let targetUserId = user.id;
  if (requestedUserId) {
    if (user.role !== "ADMIN" && Number(requestedUserId) !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    targetUserId = Number(requestedUserId);
  }

  const orders = await prisma.order.findMany({
    where: { userId: targetUserId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

/**
 * POST /api/orders — create an order for the logged-in user.
 */
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized - please login" }, { status: 401 });

    const body = await req.json();
    const { items, paymentMethod, fullName, email, address, city, country } = body as {
      items: IncomingItem[];
      paymentMethod?: string;
      fullName: string;
      email: string;
      address: string;
      city: string;
      country: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!fullName || !email || !address || !city || !country) {
      return NextResponse.json({ error: "All shipping fields are required" }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (acc, it) => acc + Number(it.price) * Number(it.quantity || 1),
      0
    );

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        paymentMethod: paymentMethod || "card",
        totalAmount,
        fullName,
        email,
        address,
        city,
        country,
        items: {
          create: items.map((it) => ({
            productId: it.productId || it.id || null,
            name: it.name,
            price: Number(it.price),
            quantity: Number(it.quantity) || 1,
            size: it.selectedSize || it.size || null,
            imageUrl: it.imageUrl || it.imageUrls?.[0] || null,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
