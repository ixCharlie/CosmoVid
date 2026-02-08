import type { Locale } from '@/lib/i18n';
import { locales, defaultLocale } from '@/lib/i18n';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import pt from '@/locales/pt.json';
import zh from '@/locales/zh.json';
import hi from '@/locales/hi.json';
import ru from '@/locales/ru.json';

export type PageKey = 'home' | 'shrink' | 'tiktok' | 'x' | 'tools';

type MetaMessages = Record<
  Locale,
  {
    home: { metaTitle: string; metaDescription: string };
    shrink?: { metaTitle: string; metaDescription: string };
    tools?: { metaTitle: string; metaDescription: string };
    tiktok?: { metaTitle: string; metaDescription: string };
    x?: { metaTitle: string; metaDescription: string };
  }
>;

const messages: MetaMessages = {
  en: en as MetaMessages['en'],
  ar: ar as MetaMessages['ar'],
  es: es as MetaMessages['es'],
  fr: fr as MetaMessages['fr'],
  de: de as MetaMessages['de'],
  pt: pt as MetaMessages['pt'],
  zh: zh as MetaMessages['zh'],
  hi: hi as MetaMessages['hi'],
  ru: ru as MetaMessages['ru'],
};

const FALLBACK_META = { metaTitle: 'CosmoVid', metaDescription: 'Video downloader tools.' };

export function getPageMeta(locale: Locale, page: PageKey): { title: string; description: string } {
  const m = messages[locale] ?? messages[defaultLocale];
  const section = m[page as keyof typeof m];
  const s =
    section && typeof section === 'object' && 'metaTitle' in section
      ? (section as { metaTitle: string; metaDescription: string })
      : FALLBACK_META;
  return {
    title: s.metaTitle ?? FALLBACK_META.metaTitle,
    description: s.metaDescription ?? FALLBACK_META.metaDescription,
  };
}

const baseUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmovid.example.com').replace(/\/$/, '');

/** Build hreflang/languages object for all locales for a given page. */
function buildLanguagesForPage(page: PageKey): Record<string, string> {
  const pathSegment = page === 'home' ? '' : `/${page}`;
  const languages: Record<string, string> = {
    'x-default': `${baseUrl}/en${pathSegment}`,
  };
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}${pathSegment}`;
  }
  return languages;
}

/** Path-based locale URLs for all supported languages (SEO hreflang). */
export function getAlternatesForPage(page: PageKey): { canonical: string; languages: Record<string, string> } {
  return {
    canonical: `${baseUrl}/en${page === 'home' ? '' : `/${page}`}`,
    languages: buildLanguagesForPage(page),
  };
}

/** Build canonical and hreflang for the current locale and page. */
export function getAlternatesForPageWithLocale(locale: Locale, page: PageKey): { canonical: string; languages: Record<string, string> } {
  const pathSegment = page === 'home' ? '' : `/${page}`;
  const canonical = `${baseUrl}/${locale}${pathSegment}`;
  return {
    canonical,
    languages: buildLanguagesForPage(page),
  };
}

const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  ar: 'ar_AR',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE',
  pt: 'pt_BR',
  zh: 'zh_CN',
  hi: 'hi_IN',
  ru: 'ru_RU',
};

export function getOgLocale(locale: Locale): string {
  return OG_LOCALE_MAP[locale] ?? 'en_US';
}

/** All alternate locales for Open Graph (excluding current). */
export function getOgAlternateLocales(currentLocale: Locale): string[] {
  return locales.filter((l) => l !== currentLocale).map((l) => OG_LOCALE_MAP[l]);
}

export { baseUrl };
