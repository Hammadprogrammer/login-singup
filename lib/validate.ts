/**
 * Small, dependency-free validation helpers for API input.
 * Every public write endpoint should sanitize through these before touching Prisma.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Trim, strip control chars and clamp length. Returns "" for non-strings. */
export function cleanString(value: unknown, max = 200): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").trim().slice(0, max);
}

/** Like cleanString but also collapses whitespace runs (names, cities...). */
export function cleanText(value: unknown, max = 200): string {
  return cleanString(value, max).replace(/\s+/g, " ");
}

export function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_RE.test(value);
}

export function normalizeEmail(value: unknown): string {
  return cleanString(value, 254).toLowerCase();
}

export function toInt(value: unknown, fallback = NaN): number {
  const n = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function toFloat(value: unknown, fallback = NaN): number {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = toInt(value, fallback);
  return Math.min(max, Math.max(min, n));
}

/** Split a comma-separated form value into clean, de-duplicated tokens. */
export function csvList(value: unknown, maxItems = 20, maxLen = 60): string[] {
  const raw = cleanString(value, maxItems * (maxLen + 1));
  if (!raw) return [];
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const p = cleanText(part, maxLen);
    if (p) seen.add(p);
    if (seen.size >= maxItems) break;
  }
  return [...seen];
}

/** Loose phone check: digits, spaces, +, -, parentheses; 7–20 chars. */
export function isPhone(value: string): boolean {
  return /^[+\d][\d\s\-()]{6,19}$/.test(value);
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isStrongEnoughPassword(pw: unknown): pw is string {
  return typeof pw === "string" && pw.length >= 8 && pw.length <= 128;
}

/** Image upload constraints shared by products, KYC and CMS uploads. */
export const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
export const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6 MB

export function validateImageFile(file: unknown): file is File {
  return (
    typeof File !== "undefined" &&
    file instanceof File &&
    file.size > 0 &&
    file.size <= MAX_IMAGE_BYTES &&
    IMAGE_MIME.has(file.type)
  );
}

/** Honeypot: bots fill hidden fields; humans never do. */
export function isHoneypotTripped(body: Record<string, unknown>, field = "website"): boolean {
  const v = body?.[field];
  return typeof v === "string" && v.trim().length > 0;
}
