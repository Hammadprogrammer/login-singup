import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { normalizeEmail, isEmail, cleanString } from "@/lib/validate";

const INVALID = () => NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "verify-code", LIMITS.verify);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const code = cleanString(body.code, 6);
  if (!email || !isEmail(email) || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Email and 6-digit code are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.resetCode || !user.resetCodeExpiry) return INVALID();
  if (new Date() > user.resetCodeExpiry) return INVALID();

  const isValid = await bcrypt.compare(code, user.resetCode);
  if (!isValid) return INVALID();

  return NextResponse.json({ message: "Code verified" });
}
