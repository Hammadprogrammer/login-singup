import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies(); // ✅ await here
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ loggedIn: false }, { status: 401 });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.json({ loggedIn: true, user: decoded }, { status: 200 });
    } catch {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }
  } catch (error) {
    console.error("Critical Server Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
