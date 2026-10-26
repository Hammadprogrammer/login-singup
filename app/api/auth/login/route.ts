import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken, authCookieOptions } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { normalizeEmail, isEmail } from "@/lib/validate";

const INVALID = () => NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, "login", LIMITS.login);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const { email, password } = body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const normalizedEmail = normalizeEmail(email);
    if (!isEmail(normalizedEmail) || password.length > 128) return INVALID();

    // Second limiter keyed by account, so a distributed brute force on one
    // mailbox is still throttled.
    const perEmail = enforceRateLimit(req, "login-email", LIMITS.loginPerEmail, normalizedEmail);
    if (perEmail) return perEmail;

    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // One-time admin bootstrap from env (hashed on first use; DB is the source of truth after).
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword && normalizedEmail === adminEmail && safeEqual(password, adminPassword)) {
      const hashed = await bcrypt.hash(password, 12);
      user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: "ADMIN", password: hashed, provider: "credentials" },
        create: { email: adminEmail, password: hashed, name: "Administrator", role: "ADMIN", provider: "credentials" },
      });
    }

    if (!user) {
      // Burn comparable time so missing accounts aren't distinguishable by latency.
      await bcrypt.compare(password, "$2a$12$CwTycUXWue0Thq9StjUM0uJ8Zs0u1QGZ6rXoP0v2zJ7lJ6bN0aOaW");
      return INVALID();
    }

    if (!user.password) {
      if (user.provider === "google") {
        return NextResponse.json(
          { error: "This account uses Google sign-in. Please continue with Google." },
          { status: 403 }
        );
      }
      return INVALID();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return INVALID();

    const role = user.role === "ADMIN" ? "ADMIN" : "USER";
    const token = generateToken({ id: user.id, email: user.email, role });

    const response = NextResponse.json({
      message: "Login successful",
      redirect: role === "ADMIN" ? "/dashboard" : "/",
      user: { id: user.id, email: user.email, name: user.name, role },
    });
    response.cookies.set("token", token, authCookieOptions);
    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
