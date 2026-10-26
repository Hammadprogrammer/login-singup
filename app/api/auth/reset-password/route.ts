import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { normalizeEmail, isEmail, cleanString, isStrongEnoughPassword } from "@/lib/validate";

const INVALID = () => NextResponse.json({ error: "Invalid or expired reset request" }, { status: 400 });

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "reset-password", LIMITS.verify);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const code = cleanString(body.code, 6);
  const password = body.password;

  // The reset code is MANDATORY — a valid email alone can never reset a password.
  if (!email || !isEmail(email) || !/^\d{6}$/.test(code) || !password) {
    return NextResponse.json({ error: "Email, verification code and new password are required" }, { status: 400 });
  }
  if (!isStrongEnoughPassword(password)) {
    return NextResponse.json({ error: "Password must be between 8 and 128 characters" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.resetCode || !user.resetCodeExpiry) return INVALID();
  if (new Date() > user.resetCodeExpiry) return INVALID();

  const isValidCode = await bcrypt.compare(code, user.resetCode);
  if (!isValidCode) return INVALID();

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { email },
    data: { password: hash, resetCode: null, resetCodeExpiry: null },
  });

  return NextResponse.json({ message: "Password updated" });
}
