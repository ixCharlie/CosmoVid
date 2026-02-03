import type { Locale } from '@/lib/i18n';
import { defaultLocale, isLocale } from '@/lib/i18n';

const COOKIE_NAME = 'COSMOVID_LOCALE';
const COOKIE_MAX_AGE_DAYS = 365;
const STORAGE_KEY = 'cosmovid_locale';

/**
 * Map browser language (e.g. navigator.language) to a supported locale.
 * Handles region codes (es-ES -> es, zh-CN -> zh) and falls back to defaultLocale.
 */
export function browserLanguageToLocale(browserLang: string): Locale {
  if (!browserLang || typeof browserLang !== 'string') return defaultLocale;
  const code = browserLang.split('-')[0].toLowerCase();
  const region = browserLang.split('-')[1]?.toUpperCase();
  // Exact match first (e.g. en, ar)
  if (isLocale(code)) return code;
  // zh-CN, zh-TW -> zh
  if (code === 'zh') return 'zh';
  // hi-IN -> hi
  if (code === 'hi') return 'hi';
  // Common mappings
  const map: Record<string, Locale> = {
    en: 'en',
    ar: 'ar',
    es: 'es',
    fr: 'fr',
    de: 'de',
    pt: 'pt',
    zh: 'zh',
    hi: 'hi',
    ru: 'ru',
  };
  return map[code] ?? defaultLocale;
}

/**
 * Get stored locale preference from cookie (server/middleware) or localStorage (client).
 * Cookie is preferred so middleware can redirect without client JS.
 */
export function getStoredLocale(): Locale | null {
  if (typeof document === 'undefined') return null;
  // Cookie first (used by middleware)
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const fromCookie = match ? decodeURIComponent(match[1]) : null;
  if (fromCookie && isLocale(fromCookie)) return fromCookie;
  // Fallback to localStorage
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage && isLocale(fromStorage)) return fromStorage;
  } catch {
    // ignore
  }
  return null;
}

/**
 * Persist user's locale preference (cookie + localStorage).
 * Call when user selects a language or when auto-detecting on first visit.
 */
export function setStoredLocale(locale: Locale): void {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(locale);
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE_DAYS * 24 * 60 * 60}; SameSite=Lax`;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

export { COOKIE_NAME };
