import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireUser, UNAUTHORIZED } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { cleanText, cleanString, normalizeEmail, isEmail, isPhone, isUuid } from "@/lib/validate";
import { PAYMENT_METHODS, shippingFor } from "@/lib/site";
import { sendOrderConfirmation, sendAdminNewOrderAlert } from "@/lib/mail";

/**
 * GET /api/orders — the logged-in customer's own orders (newest first).
 * Admins use /api/dashboard/orders for the full view.
 */
export async function GET(req: NextRequest) {
  const user = requireUser(req);
  if (!user) return UNAUTHORIZED();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(orders);
}

class OrderError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/**
 * POST /api/orders — place an order from the user's SERVER-SIDE cart.
 *
 * Security properties:
 *  - prices, names and images come from the Product table, never the client
 *  - stock is checked and decremented atomically inside one transaction
 *  - an `idempotencyKey` (one per checkout attempt) makes retries/double-clicks safe
 *  - the cart is cleared only after the order commits
 */
export async function POST(req: NextRequest) {
  try {
    const user = requireUser(req);
    if (!user) return UNAUTHORIZED();
    const limited = enforceRateLimit(req, "order", LIMITS.order);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));

    const fullName = cleanText(body.fullName, 100);
    const email = normalizeEmail(body.email) || user.email;
    const phone = cleanText(body.phone, 25);
    const address = cleanText(body.address, 250);
    const city = cleanText(body.city, 80);
    const postalCode = cleanText(body.postalCode, 20);
    const country = cleanText(body.country, 80);
    const notes = cleanString(body.notes, 500);
    const paymentMethod = String(body.paymentMethod || "");
    const idempotencyKey = typeof body.idempotencyKey === "string" && isUuid(body.idempotencyKey) ? body.idempotencyKey : null;

    if (fullName.length < 2 || !address || address.length < 5 || !city || !country) {
      return NextResponse.json({ error: "Please complete all delivery fields" }, { status: 400 });
    }
    if (!isEmail(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
    if (!phone || !isPhone(phone)) return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
    if (!PAYMENT_METHODS.some((p) => p.value === paymentMethod)) {
      return NextResponse.json({ error: "Please choose a payment method" }, { status: 400 });
    }
    if (!idempotencyKey) return NextResponse.json({ error: "Missing checkout token — please refresh and try again" }, { status: 400 });

    // Retry of an already-placed order → return the existing one (no duplicate).
    const existing = await prisma.order.findUnique({ where: { idempotencyKey }, include: { items: true } });
    if (existing) {
      if (existing.userId !== user.id) return NextResponse.json({ error: "Invalid checkout token" }, { status: 400 });
      return NextResponse.json(existing, { status: 200 });
    }

    const order = await prisma.$transaction(
      async (tx) => {
        const cart = await tx.cart.findMany({
          where: { userId: user.id },
          include: { product: true },
        });
        if (cart.length === 0) throw new OrderError("Your bag is empty");

        let totalAmount = 0;
        const items: Prisma.OrderItemCreateWithoutOrderInput[] = [];

        for (const line of cart) {
          const p = line.product;
          if (!p.isPublished) throw new OrderError(`"${p.name}" is no longer available`, 409);
          if (line.size && p.sizes.length > 0 && !p.sizes.includes(line.size)) {
            throw new OrderError(`Size ${line.size} is no longer available for "${p.name}"`, 409);
          }

          // Atomic, race-safe decrement: only succeeds if enough stock remains.
          const dec = await tx.product.updateMany({
            where: { id: p.id, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          });
          if (dec.count === 0) {
            throw new OrderError(`Not enough stock for "${p.name}" (only ${p.stock} left)`, 409);
          }

          const lineTotal = p.price * line.quantity;
          totalAmount += lineTotal;
          items.push({
            product: { connect: { id: p.id } },
            name: p.name,
            price: p.price,
            quantity: line.quantity,
            size: line.size,
            imageUrl: p.imageUrls[0] ?? null,
          });
        }

        const grandTotal = totalAmount + shippingFor(totalAmount);
        const created = await tx.order.create({
          data: {
            userId: user.id,
            status: "PENDING",
            paymentMethod,
            totalAmount: Math.round(grandTotal * 100) / 100,
            fullName,
            email,
            phone,
            address,
            city,
            postalCode: postalCode || null,
            country,
            notes: notes || null,
            idempotencyKey,
            items: { create: items },
          },
          include: { items: true },
        });

        await tx.cart.deleteMany({ where: { userId: user.id } });
        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 15000 }
    );

    // Emails are best-effort and never block the response.
    void Promise.all([sendOrderConfirmation(order), sendAdminNewOrderAlert(order)]);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    // Unique violation on idempotencyKey from a concurrent duplicate submit.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This order was already placed" }, { status: 409 });
    }
    console.error("CREATE ORDER ERROR:", error);
    return NextResponse.json({ error: "Failed to place order. Please try again." }, { status: 500 });
  }
}

/**
 * PATCH /api/orders — customer cancels their own PENDING order.
 * Body: { id }
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = requireUser(req);
    if (!user) return UNAUTHORIZED();

    const { id } = await req.json().catch(() => ({}));
    if (!isUuid(id)) return NextResponse.json({ error: "Invalid order" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!order || order.userId !== user.id) throw new OrderError("Order not found", 404);
      if (order.status !== "PENDING") throw new OrderError("Only pending orders can be cancelled", 409);

      // Return reserved stock.
      for (const it of order.items) {
        if (it.productId) {
          await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
        }
      }
      return tx.order.update({ where: { id }, data: { status: "CANCELLED" }, include: { items: true } });
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OrderError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("CANCEL ORDER ERROR:", error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
