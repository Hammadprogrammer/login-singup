import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/track — lightweight activity logging.
 * Body:
 *   { type: "search", query: string, resultCount?: number }
 *   { type: "view",   productId: string }
 *
 * Logging is best-effort: failures never break the user experience.
 * userId is taken from the auth cookie when present (anonymous allowed).
 */
export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, "track", LIMITS.track);
    if (limited) return limited;

    const user = getUserFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { type } = body;

    if (type === "search") {
      const query = String(body.query || "").trim().slice(0, 200);
      if (!query) return NextResponse.json({ ok: true });
      await prisma.searchLog.create({
        data: {
          userId: user?.id ?? null,
          query,
          resultCount: Number(body.resultCount) || 0,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (type === "view") {
      const productId = String(body.productId || "");
      if (!productId) return NextResponse.json({ ok: true });
      // Confirm product exists to avoid FK errors.
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return NextResponse.json({ ok: true });
      await prisma.productView.create({
        data: {
          userId: user?.id ?? null,
          productId,
        },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown track type" }, { status: 400 });
  } catch (error) {
    // Never surface tracking errors to the client.
    console.error("TRACK ERROR:", error);
    return NextResponse.json({ ok: false });
  }
}
