import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight in-memory sliding-window rate limiter.
 *
 * Good for a single Node instance (which is how this app is deployed). If the
 * app is ever scaled horizontally, swap the Map for Redis/Upstash — the call
 * sites don't need to change.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number, windowMs: number) {
  // Periodically drop stale keys so memory stays bounded.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    b.hits = b.hits.filter((t) => now - t < windowMs);
    if (b.hits.length === 0) buckets.delete(key);
  }
}

export interface RateLimitOptions {
  /** Max requests allowed in the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);
  const b = buckets.get(key) ?? { hits: [] };
  b.hits = b.hits.filter((t) => now - t < windowMs);
  if (b.hits.length >= limit) {
    buckets.set(key, b);
    const retryAfterSec = Math.ceil((windowMs - (now - b.hits[0])) / 1000);
    return { ok: false, remaining: 0, retryAfterSec };
  }
  b.hits.push(now);
  buckets.set(key, b);
  return { ok: true, remaining: limit - b.hits.length, retryAfterSec: 0 };
}

/** Best-effort client IP (works behind common reverse proxies). */
export function getClientIp(req: NextRequest | Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") || h.get("cf-connecting-ip") || "unknown";
}

/**
 * Convenience: apply a limit scoped to `scope` + client IP (+ optional extra key).
 * Returns a ready-to-send 429 response when exceeded, otherwise null.
 */
export function enforceRateLimit(
  req: NextRequest | Request,
  scope: string,
  opts: RateLimitOptions,
  extraKey?: string
): NextResponse | null {
  const key = `${scope}:${getClientIp(req)}${extraKey ? `:${extraKey}` : ""}`;
  const r = rateLimit(key, opts);
  if (r.ok) return null;
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": String(r.retryAfterSec) } }
  );
}

/** Preset policies used across the API. */
export const LIMITS = {
  login: { limit: 8, windowMs: 15 * 60_000 },
  loginPerEmail: { limit: 6, windowMs: 15 * 60_000 },
  signup: { limit: 5, windowMs: 60 * 60_000 },
  forgot: { limit: 4, windowMs: 15 * 60_000 },
  verify: { limit: 8, windowMs: 15 * 60_000 },
  order: { limit: 10, windowMs: 10 * 60_000 },
  contact: { limit: 5, windowMs: 60 * 60_000 },
  review: { limit: 5, windowMs: 60 * 60_000 },
  kyc: { limit: 5, windowMs: 60 * 60_000 },
  cart: { limit: 120, windowMs: 10 * 60_000 },
  track: { limit: 120, windowMs: 10 * 60_000 },
  adminWrite: { limit: 120, windowMs: 10 * 60_000 },
};
