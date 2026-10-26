import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pages that require a logged-in user (token presence only â€” the JWT is
// cryptographically verified server-side in each page / API handler).
const PROTECTED_PREFIXES = ["/dashboard", "/checkout", "/orders", "/kyc"];

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * CSRF defence for cookie-authenticated API routes: a browser always sends
 * `Origin` (or at least `Referer`) on cross-site mutations. If it is present
 * and does not match our own host, reject. Same-site requests from our pages
 * pass; plain non-browser clients without Origin are allowed through (they
 * carry no ambient cookie, so they can't forge a user's session anyway).
 */
function failsOriginCheck(request: NextRequest): boolean {
  const origin = request.headers.get("origin") || request.headers.get("referer");
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host;
    const selfHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
    return originHost !== selfHost;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    // OAuth callback is a top-level navigation from Google; skip it.
    if (MUTATING.has(request.method) && !pathname.startsWith("/api/auth/google") && failsOriginCheck(request)) {
      return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
    }
    return NextResponse.next();
  }

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (needsAuth && !request.cookies.get("token")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/checkout/:path*", "/orders/:path*", "/kyc/:path*"],
};
