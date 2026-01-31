import type { Locale } from '@/lib/i18n';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

export type PageKey = 'home' | 'faq' | 'about';

const messages = { en, ar } as Record<Locale, { home: { metaTitle: string; metaDescription: string }; faq: { metaTitle: string; metaDescription: string }; about: { metaTitle: string; metaDescription: string } }>;

export function getPageMeta(locale: Locale, page: PageKey): { title: string; description: string } {
  const m = messages[locale] ?? messages.en;
  const section = m[page];
  return {
    title: section.metaTitle,
    description: section.metaDescription,
  };
}

const baseUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmovid.example.com';

/** Path-based locale URLs: /en, /ar, /en/faq, /ar/faq, etc. */
export function getAlternatesForPage(page: PageKey): { canonical: string; languages: Record<string, string> } {
  const base = baseUrl().replace(/\/$/, '');
  const pathEn = page === 'home' ? '' : page;
  const pathAr = page === 'home' ? '' : page;
  const urlEn = pathEn ? `${base}/en/${pathEn}` : `${base}/en`;
  const urlAr = pathAr ? `${base}/ar/${pathAr}` : `${base}/ar`;
  return {
    canonical: urlEn,
    languages: {
      'en': urlEn,
      'ar': urlAr,
      'x-default': urlEn,
    },
  };
}

/** Build canonical and languages for a given locale and page (for current page URL). */
export function getAlternatesForPageWithLocale(locale: Locale, page: PageKey): { canonical: string; languages: Record<string, string> } {
  const base = baseUrl().replace(/\/$/, '');
  const pathSegment = page === 'home' ? '' : `/${page}`;
  const urlEn = `${base}/en${pathSegment}`;
  const urlAr = `${base}/ar${pathSegment}`;
  const canonical = locale === 'ar' ? urlAr : urlEn;
  return {
    canonical,
    languages: {
      'en': urlEn,
      'ar': urlAr,
      'x-default': urlEn,
    },
  };
}

export function getOgLocale(locale: Locale): string {
  return locale === 'ar' ? 'ar_AR' : 'en_US';
}

export { baseUrl };
