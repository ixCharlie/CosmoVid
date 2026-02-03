export const LOCALES = [
  'en',
  'ar',
  'es',
  'fr',
  'de',
  'pt',
  'zh',
  'hi',
  'ru',
] as const;

export type Locale = (typeof LOCALES)[number];

export const locales: Locale[] = [...LOCALES];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  zh: '中文',
  hi: 'हिन्दी',
  ru: 'Русский',
};

/** RTL locales */
export const rtlLocales: Locale[] = ['ar'];

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}
