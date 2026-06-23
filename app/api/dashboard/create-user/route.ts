import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getAdminUser } from "@/lib/auth";

/**
 * POST /api/dashboard/create-user — admin-only.
 * Lets an admin manually create a new USER or ADMIN account.
 * Body: { name, email, password, role? }
 */
export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, email, password, role } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const finalRole = role === "ADMIN" ? "ADMIN" : role === "SUBADMIN" ? "SUBADMIN" : "USER";

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashed,
      name: name?.trim() || normalizedEmail.split("@")[0],
      role: finalRole,
      provider: "credentials",
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
