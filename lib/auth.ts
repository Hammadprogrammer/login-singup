import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

// A missing secret means auth genuinely cannot work — but we must NOT throw at
// module load, otherwise every route that imports this file returns a 500.
// We fall back to a clearly-marked dev secret and warn loudly instead.
if (!JWT_SECRET) {
  console.warn(
    "[auth] JWT_SECRET is not set. Using an insecure development fallback. " +
      "Set a strong JWT_SECRET (32+ chars) in your .env for production."
  );
} else if (JWT_SECRET.length < 16) {
  console.warn(
    "[auth] JWT_SECRET is weak (<16 chars). Use a longer secret (32+ chars) for production."
  );
}

const SECRET: string = JWT_SECRET || "dev-only-insecure-secret-change-me";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthUser {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
}

export function generateToken(payload: AuthUser) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, SECRET) as AuthUser;
  } catch {
    return null;
  }
}

/** Standard secure cookie options used everywhere we set the auth token. */
export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: TOKEN_MAX_AGE,
};

/** Read + verify the auth token from the incoming request cookies. */
export function getUserFromRequest(req: NextRequest): AuthUser | null {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Read + verify the auth token from the Next.js server cookie store. */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Returns the user only if they are an ADMIN, otherwise null. */
export async function getAdminUser(): Promise<AuthUser | null> {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export function isAdminRequest(req: NextRequest): boolean {
  const user = getUserFromRequest(req);
  return user?.role === "ADMIN";
}
