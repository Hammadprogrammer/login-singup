import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { transporter } from "@/lib/mail";
import { SITE } from "@/lib/site";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { normalizeEmail, isEmail } from "@/lib/validate";

// Generic response so attackers cannot enumerate which emails are registered.
const GENERIC_OK = { message: "If an account exists for that email, a reset code has been sent." };

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, "forgot", LIMITS.forgot);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    if (!email || !isEmail(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json(GENERIC_OK);

    // Cryptographically random 6-digit code; only its hash is stored.
    const code = String(randomInt(100000, 1000000));
    const hashedCode = await bcrypt.hash(code, 10);

    await prisma.user.update({
      where: { email },
      data: { resetCode: hashedCode, resetCodeExpiry: new Date(Date.now() + 10 * 60 * 1000) },
    });

    try {
      await transporter.sendMail({
        from: `"${SITE.name}" <${process.env.EMAIL}>`,
        to: email,
        subject: `${SITE.name} — your password reset code`,
        text: `Your password reset code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
      });
    } catch (mailErr) {
      console.error("Failed to send reset email:", mailErr);
    }

    return NextResponse.json(GENERIC_OK);
  } catch (error) {
    console.error("FORGOT ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
