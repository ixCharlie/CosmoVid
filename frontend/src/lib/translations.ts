import type { Locale } from './i18n';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import pt from '@/locales/pt.json';
import zh from '@/locales/zh.json';
import hi from '@/locales/hi.json';
import ru from '@/locales/ru.json';

const messages: Record<Locale, typeof en> = {
  en,
  ar,
  es,
  fr,
  de,
  pt,
  zh,
  hi,
  ru,
};

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
