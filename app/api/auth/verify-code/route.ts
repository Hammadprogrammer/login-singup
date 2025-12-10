import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, code } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.resetCode !== code) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  if (new Date() > user.resetCodeExpiry!) {
    return NextResponse.json({ error: "Code expired" }, { status: 400 });
  }

  return NextResponse.json({ message: "Code verified" });
}
