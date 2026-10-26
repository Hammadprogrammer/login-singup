import { NextResponse } from "next/server";
import { authCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });
  // Must match the attributes used when setting the cookie or browsers keep it.
  response.cookies.set("token", "", { ...authCookieOptions, maxAge: 0 });
  return response;
}
