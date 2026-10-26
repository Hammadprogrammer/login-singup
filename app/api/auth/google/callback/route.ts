import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken, authCookieOptions } from "@/lib/auth";
import { normalizeEmail, isEmail, cleanText } from "@/lib/validate";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/login?error=${reason}`, baseUrl));
    res.cookies.delete("oauth_state");
    return res;
  };

  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const expectedState = req.cookies.get("oauth_state")?.value;

    if (!code || !state || !expectedState || state !== expectedState) return fail("google_state");

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) return fail("google_token");

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();

    const email = normalizeEmail(googleUser?.email);
    // Only trust addresses Google has verified — otherwise an attacker could
    // pre-register a victim's email on an unverified Google account.
    if (!userRes.ok || !isEmail(email) || googleUser?.verified_email === false) return fail("google_email");

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: cleanText(googleUser.name, 100) || null, provider: "google" },
      });
    }

    const role = user.role === "ADMIN" ? "ADMIN" : "USER";
    const token = generateToken({ id: user.id, email: user.email, role });

    const response = NextResponse.redirect(new URL(role === "ADMIN" ? "/dashboard" : "/", baseUrl));
    response.cookies.set("token", token, authCookieOptions);
    response.cookies.delete("oauth_state");
    return response;
  } catch (err) {
    console.error("GOOGLE CALLBACK ERROR:", err);
    return fail("google_failed");
  }
}
