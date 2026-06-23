// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require the user to be logged in (token must be present).
// NOTE: this only checks for token presence at the edge. Role-based access
// (e.g. ADMIN-only /dashboard) is still verified server-side where the JWT
// is cryptographically validated.
const PROTECTED_PREFIXES = [
  '/sell_product',
  '/dashboard',
  '/my-products',
  '/add-product',
  '/checkout',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (needsAuth) {
    const token = request.cookies.get('token');
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sell_product/:path*',
    '/dashboard/:path*',
    '/my-products/:path*',
    '/add-product/:path*',
    '/checkout/:path*',
  ],
};