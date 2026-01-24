import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const authSession = request.cookies.get('auth_session');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Si no hay sesión y no estamos en login, redirigir a login
  if (!authSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay sesión y estamos en login, redirigir al home
  if (authSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
