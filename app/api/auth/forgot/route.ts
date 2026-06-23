import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { transporter } from "@/lib/mail";

// Generic response so attackers cannot enumerate which emails are registered.
const GENERIC_OK = {
  message: "If an account exists for that email, a reset code has been sent.",
};

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always return the same response regardless of whether the user exists.
    if (!user) {
      return NextResponse.json(GENERIC_OK);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Store only a HASH of the code — never the plaintext.
    const hashedCode = await bcrypt.hash(code, 10);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        resetCode: hashedCode,
        resetCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: normalizedEmail,
        subject: "Password Reset Code",
        text: `Your password reset code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
      });
    } catch (mailErr) {
      console.error("Failed to send reset email:", mailErr);
      // Do not reveal mail failures tied to a specific account.
    }

    return NextResponse.json(GENERIC_OK);
  } catch (error) {
    console.error("FORGOT ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
