import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
import { cleanText, normalizeEmail, isEmail, isStrongEnoughPassword } from "@/lib/validate";

/**
 * POST /api/dashboard/create-user — admin-only.
 * Body: { name, email, password, role?: "USER" | "ADMIN" }
 */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return FORBIDDEN();

  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const name = cleanText(body.name, 100);
  const password = body.password;
  const role = body.role === "ADMIN" ? "ADMIN" : "USER";

  if (!isEmail(email)) return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  if (!isStrongEnoughPassword(password)) {
    return NextResponse.json({ error: "Password must be between 8 and 128 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, name: name || email.split("@")[0], role, provider: "credentials" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
