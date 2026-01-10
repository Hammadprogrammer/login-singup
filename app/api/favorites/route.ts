import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Token verify karne ka helper
function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
  } catch (err) {
    return null;
  }
}

// GET → User ke saare favorites le aayega
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: { product: true }, // Product info bhi chahiye
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// POST → Favorite add/remove karega
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { productId, action } = await req.json();
    if (!productId || !action) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    if (action === "add") {
      // Check already exists
      const exists = await prisma.favorite.findUnique({
        where: { userId_productId: { userId: user.id, productId } },
      });

      if (!exists) {
        await prisma.favorite.create({
          data: { userId: user.id, productId },
        });
      }
    } else if (action === "remove") {
      await prisma.favorite.deleteMany({
        where: { userId: user.id, productId },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
