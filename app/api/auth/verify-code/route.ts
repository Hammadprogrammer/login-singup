import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !user.resetCode || !user.resetCodeExpiry) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  if (new Date() > user.resetCodeExpiry) {
    return NextResponse.json({ error: "Code expired" }, { status: 400 });
  }

  const isValid = await bcrypt.compare(String(code), user.resetCode);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  return NextResponse.json({ message: "Code verified" });
}
