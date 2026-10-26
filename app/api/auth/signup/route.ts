import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken, authCookieOptions } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { cleanText, normalizeEmail, isEmail, isStrongEnoughPassword, isHoneypotTripped } from "@/lib/validate";

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, "signup", LIMITS.signup);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));

    // Bots fill the hidden "website" field; pretend success so they move on.
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ message: "User created successfully" });
    }

    const firstName = cleanText(body.firstName, 50);
    const lastName = cleanText(body.lastName, 50);
    const email = normalizeEmail(body.email);
    const password = body.password;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (!isStrongEnoughPassword(password)) {
      return NextResponse.json({ error: "Password must be between 8 and 128 characters" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // role is always forced to USER here — admins are provisioned separately.
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name: `${firstName} ${lastName}`, role: "USER" },
    });

    const token = generateToken({ id: user.id, email: user.email, role: "USER" });
    const res = NextResponse.json({
      message: "User created successfully",
      user: { id: user.id, email: user.email, name: user.name },
    });
    res.cookies.set("token", token, authCookieOptions);
    return res;
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
