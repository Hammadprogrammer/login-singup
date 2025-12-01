import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1];

    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ message: "Welcome Admin!" });
  } catch (error) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
