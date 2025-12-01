import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // your Prisma client
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  console.log("Signup API called");

  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      console.log("Missing fields");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    console.log("Existing user:", existingUser);

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password");

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role }
    });
    console.log("User created:", user);

    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    console.log("JWT created");

    // Set cookie
    const res = NextResponse.json({
      message: "User created successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    console.log("Cookie set");
    return res;

  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
