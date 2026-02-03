import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isLocale, defaultLocale } from '@/lib/i18n';
import { COOKIE_NAME } from '@/lib/locale-preference';

const LOCALE_HEADER = 'x-locale';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segment = pathname.split('/')[1];

  // Root: check stored preference and redirect, or allow (client will auto-detect)
  if (pathname === '/') {
    const stored = request.cookies.get(COOKIE_NAME)?.value;
    const locale = stored && isLocale(stored) ? stored : null;
    if (locale) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      const response = NextResponse.redirect(url, 302);
      response.headers.set(LOCALE_HEADER, locale);
      return response;
    }
    const response = NextResponse.next();
    response.headers.set(LOCALE_HEADER, defaultLocale);
    return response;
  }

  // Explicit locale URLs: /en, /ar, /es, /fr, etc.
  if (segment && isLocale(segment)) {
    const response = NextResponse.next();
    response.headers.set(LOCALE_HEADER, segment);
    return response;
  }

  // Path without supported locale: redirect to default
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  const response = NextResponse.redirect(url, 302);
  response.headers.set(LOCALE_HEADER, defaultLocale);
  return response;
}

export const config = {
  // Exclude static assets so /NEW.png etc. are served without locale redirect
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|NEW\\.png).*)'],
};
