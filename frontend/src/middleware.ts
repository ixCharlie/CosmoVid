import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALE_HEADER = 'x-locale';
type Locale = 'en' | 'ar';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segment = pathname.split('/')[1];

  // Root: language picker — no redirect
  if (pathname === '/') {
    const response = NextResponse.next();
    response.headers.set(LOCALE_HEADER, 'en');
    return response;
  }

  // Explicit locale URLs: /en, /ar, /en/faq, /ar/about, etc.
  if (segment === 'en' || segment === 'ar') {
    const response = NextResponse.next();
    response.headers.set(LOCALE_HEADER, segment);
    return response;
  }

  // No locale: redirect to English version (keeps en/ar on separate URLs)
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = `/en${pathname === '/' ? '' : pathname}`;
  const response = NextResponse.redirect(newUrl, 302);
  response.headers.set(LOCALE_HEADER, 'en');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and api
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
