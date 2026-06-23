import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, code, password } = await req.json();

  // The reset code is now MANDATORY — a valid email alone can no longer
  // reset a password. This closes the account-takeover hole.
  if (!email || !code || !password) {
    return NextResponse.json(
      { error: "Email, verification code and new password are required" },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long" },
      { status: 400 }
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !user.resetCode || !user.resetCodeExpiry) {
    return NextResponse.json({ error: "Invalid or expired reset request" }, { status: 400 });
  }

  if (new Date() > user.resetCodeExpiry) {
    return NextResponse.json({ error: "Reset code has expired" }, { status: 400 });
  }

  const isValidCode = await bcrypt.compare(String(code), user.resetCode);
  if (!isValidCode) {
    return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: {
      password: hash,
      resetCode: null,
      resetCodeExpiry: null,
    },
  });

  return NextResponse.json({ message: "Password updated" });
}
