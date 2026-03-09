// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Check karein ke kya user Sell section mein ja raha hai
  if (request.nextUrl.pathname.startsWith('/sell_product')) {
    
    // 2. Cookie se token check karein (Aapki auth api jo cookie set karti hai)
    const token = request.cookies.get('token'); // 'token' ki jagah apna cookie name likhein

    if (!token) {
      // 3. Agar token nahi hai, toh login page par redirect kar dein
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Sirf in paths par middleware chalega
export const config = {
  matcher: ['/sell_product/:path*'],
};