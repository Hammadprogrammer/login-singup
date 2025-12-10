// /app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" });

    // Clear the cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 0, // This deletes the cookie
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
