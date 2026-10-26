import nodemailer from "nodemailer";
import { SITE, paymentLabel } from "./site";
import { formatPrice, shortId } from "./format";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const FROM = () => `"${SITE.name}" <${process.env.EMAIL}>`;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/** Fire-and-forget wrapper: email failures are logged, never surfaced to users. */
async function safeSend(opts: nodemailer.SendMailOptions) {
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) return;
  try {
    await transporter.sendMail({ from: FROM(), ...opts });
  } catch (err) {
    console.error("[mail] send failed:", err instanceof Error ? err.message : err);
  }
}

export interface OrderEmailItem {
  name: string;
  size?: string | null;
  quantity: number;
  price: number;
}

export interface OrderEmailData {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  address: string;
  city: string;
  postalCode?: string | null;
  country: string;
  paymentMethod: string;
  totalAmount: number;
  items: OrderEmailItem[];
}

function orderTable(o: OrderEmailData) {
  const rows = o.items
    .map(
      (it) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(it.name)}${
          it.size ? ` <span style="color:#777">(${escapeHtml(it.size)})</span>` : ""
        } × ${it.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatPrice(
          it.price * it.quantity
        )}</td></tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
    <tr><td style="padding:12px 0;font-weight:700">Total</td><td style="padding:12px 0;text-align:right;font-weight:700">${formatPrice(o.totalAmount)}</td></tr></table>`;
}

function shell(title: string, body: string) {
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px;color:#15171c;background:#faf8f3">
    <p style="letter-spacing:.3em;font-size:11px;color:#8a7a5c;margin:0 0 8px">${SITE.name}</p>
    <h1 style="font-weight:400;font-size:24px;margin:0 0 24px">${title}</h1>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#777">${SITE.name} · ${escapeHtml(SITE.address)}</p>
  </div>`;
}

export async function sendOrderConfirmation(o: OrderEmailData) {
  await safeSend({
    to: o.email,
    subject: `Order #${shortId(o.id)} confirmed — ${SITE.name}`,
    html: shell(
      "Thank you for your order",
      `<p>Hi ${escapeHtml(o.fullName)}, we've received your order <strong>#${shortId(o.id)}</strong> and will start preparing it shortly.</p>
       ${orderTable(o)}
       <p style="font-size:13px;color:#555"><strong>Payment:</strong> ${escapeHtml(paymentLabel(o.paymentMethod))}<br/>
       <strong>Deliver to:</strong> ${escapeHtml(o.address)}, ${escapeHtml(o.city)}${o.postalCode ? ` ${escapeHtml(o.postalCode)}` : ""}, ${escapeHtml(o.country)}</p>
       <p style="font-size:13px;color:#555">You can track this order any time from <em>Order History</em> in your account.</p>`
    ),
  });
}

export async function sendAdminNewOrderAlert(o: OrderEmailData) {
  const to = process.env.ADMIN_EMAIL;
  if (!to) return;
  await safeSend({
    to,
    subject: `New order #${shortId(o.id)} — ${formatPrice(o.totalAmount)}`,
    html: shell(
      "New order received",
      `<p><strong>${escapeHtml(o.fullName)}</strong> · ${escapeHtml(o.email)}${o.phone ? ` · ${escapeHtml(o.phone)}` : ""}</p>
       ${orderTable(o)}
       <p style="font-size:13px;color:#555"><strong>Payment:</strong> ${escapeHtml(paymentLabel(o.paymentMethod))}<br/>
       <strong>Ship to:</strong> ${escapeHtml(o.address)}, ${escapeHtml(o.city)}${o.postalCode ? ` ${escapeHtml(o.postalCode)}` : ""}, ${escapeHtml(o.country)}</p>`
    ),
  });
}

export async function sendOrderStatusUpdate(o: { id: string; email: string; fullName: string; status: string }) {
  const copy: Record<string, string> = {
    PROCESSING: "Your order is being prepared and will ship soon.",
    COMPLETED: "Your order has been delivered. We hope you love it.",
    CANCELLED: "Your order has been cancelled. If you didn't request this, please contact us.",
  };
  const text = copy[o.status];
  if (!text) return;
  await safeSend({
    to: o.email,
    subject: `Order #${shortId(o.id)} ${o.status.toLowerCase()} — ${SITE.name}`,
    html: shell(`Order ${o.status.toLowerCase()}`, `<p>Hi ${escapeHtml(o.fullName)},</p><p>${text}</p>`),
  });
}

export async function sendContactNotification(m: { name: string; email: string; subject?: string | null; message: string }) {
  const to = process.env.ADMIN_EMAIL;
  if (!to) return;
  await safeSend({
    to,
    replyTo: m.email,
    subject: `Contact form: ${m.subject ? escapeHtml(m.subject) : "New message"}`,
    html: shell(
      "New contact message",
      `<p><strong>${escapeHtml(m.name)}</strong> · ${escapeHtml(m.email)}</p><p style="white-space:pre-wrap">${escapeHtml(m.message)}</p>`
    ),
  });
}
