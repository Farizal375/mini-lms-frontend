// File: src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJWTRole(token: string): string | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.role || null;
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  // Ambil token JWT dari cookies browser
  const token = request.cookies.get('token')?.value;
  
  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith('/sign-in') || path.startsWith('/sign-up');
  const isProtectedRoute = path.startsWith('/admin') || path.startsWith('/my-books');

  // Jika belum login tapi mencoba masuk halaman terlarang, tendang ke login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (token) {
    // Jika sudah login tapi mencoba buka halaman login/register, arahkan ke beranda
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Role verification for admin paths
    if (path.startsWith('/admin')) {
      const role = decodeJWTRole(token);
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Lindungi semua rute kecuali file statis dan API internal
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
};