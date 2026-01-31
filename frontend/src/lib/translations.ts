import type { Locale } from './i18n';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

const messages: Record<Locale, typeof en> = { en, ar };

function getNested(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    current = (current as Record<string, unknown>)?.[part];
  }
  return current;
}

export function getTranslations(locale: Locale) {
  const t = messages[locale] ?? messages.en;
  return function tr(key: string): string {
    const value = getNested(t as Record<string, unknown>, key);
    return typeof value === 'string' ? value : key;
  };
}

