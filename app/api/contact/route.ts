import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { cleanString, cleanText, normalizeEmail, isEmail, isHoneypotTripped, toInt } from "@/lib/validate";
import { sendContactNotification } from "@/lib/mail";

/** POST /api/contact — public contact form (rate limited + honeypot). */
export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, "contact", LIMITS.contact);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    if (isHoneypotTripped(body)) return NextResponse.json({ message: "Thanks, we'll be in touch." });

    const name = cleanText(body.name, 100);
    const email = normalizeEmail(body.email);
    const subject = cleanText(body.subject, 120);
    const message = cleanString(body.message, 3000);

    if (name.length < 2) return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
    if (!isEmail(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
    if (message.length < 10) return NextResponse.json({ error: "Please write a few more words" }, { status: 400 });

    const saved = await prisma.contactMessage.create({ data: { name, email, subject: subject || null, message } });
    void sendContactNotification(saved);

    return NextResponse.json({ message: "Thanks, we'll be in touch within one business day." }, { status: 201 });
  } catch (error) {
    console.error("CONTACT_POST_ERROR:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

/** GET /api/contact — admin inbox. */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return FORBIDDEN();
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json(messages);
}

/** PATCH /api/contact — admin: mark read. Body: { id, isRead } */
export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return FORBIDDEN();
  const body = await req.json().catch(() => ({}));
  const id = toInt(body.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const updated = await prisma.contactMessage.update({ where: { id }, data: { isRead: body.isRead !== false } });
  return NextResponse.json(updated);
}

/** DELETE /api/contact — admin. Body: { id } */
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return FORBIDDEN();
  const { id } = await req.json().catch(() => ({}));
  const numId = toInt(id);
  if (!numId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await prisma.contactMessage.delete({ where: { id: numId } });
  return NextResponse.json({ success: true });
}
