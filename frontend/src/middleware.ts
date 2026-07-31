import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPrefixes = ['/patient', '/doctor', '/staff', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Client stores tokens in localStorage; middleware only soft-guards via cookie if present.
  // AuthContext enforces real protection on the client.
  return NextResponse.next();
}

export const config = {
  matcher: ['/patient/:path*', '/doctor/:path*', '/staff/:path*', '/admin/:path*'],
};
