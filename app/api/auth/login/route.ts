import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 2. Admin Logic (Direct check from .env)
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { role: "ADMIN" },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      const response = NextResponse.json({
        message: "Admin login successful",
        redirect: "/dashboard",
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // 3. User Database Lookup
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Case: User nahi mila
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Case: User ne Google se sign up kiya tha (isliye DB mein password nahi hai)
    if (!user.password && user.provider === "google") {
      return NextResponse.json(
        { error: "This account is linked with Google. Please click 'Continue with Google'." },
        { status: 403 } 
      );
    }

    // 4. Password Verification (For Email/Password users)
    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" }, // Security tip: same error for wrong pass/email
        { status: 401 }
      );
    }

    // 5. Success - Token Generation
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || "USER",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      redirect: "/",
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}