import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken, authCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Basic validation
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Database lookup (admin is now a normal DB user with role = ADMIN)
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 2a. One-time admin bootstrap.
    // If the credentials match the ADMIN_EMAIL/ADMIN_PASSWORD from the env,
    // provision (or upgrade) a real DB admin with a securely HASHED password.
    // After this, the admin authenticates purely from the database.
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (
      adminEmail &&
      adminPassword &&
      normalizedEmail === adminEmail &&
      password === adminPassword
    ) {
      const hashed = await bcrypt.hash(password, 12);
      user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: "ADMIN", password: hashed, provider: "credentials" },
        create: {
          email: adminEmail,
          password: hashed,
          name: "Administrator",
          role: "ADMIN",
          provider: "credentials",
        },
      });
    }

    // Generic error to avoid leaking which emails exist.
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Case: account is linked with Google (no password set).
    if (!user.password && user.provider === "google") {
      return NextResponse.json(
        { error: "This account is linked with Google. Please click 'Continue with Google'." },
        { status: 403 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Password verification
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Success - issue token. Role comes from the DB, never the request.
    const role = user.role === "ADMIN" ? "ADMIN" : "USER";
    const token = generateToken({ id: user.id, email: user.email, role });

    const response = NextResponse.json({
      message: "Login successful",
      redirect: role === "ADMIN" ? "/dashboard" : "/",
    });

    response.cookies.set("token", token, authCookieOptions);
    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}