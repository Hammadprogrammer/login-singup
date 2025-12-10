import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { transporter } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid Email" }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { email },
      data: {
        resetCode: code,
        resetCodeExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      } as any,
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset Code",
      text: `Your reset code is: ${code}`,
    });

    return NextResponse.json({ message: "Code sent successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
