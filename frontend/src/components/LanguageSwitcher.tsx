'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';
import { locales, localeNames, type Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const t = getTranslations(locale);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1 px-2 py-1.5 text-sm rounded-lg text-stone dark:text-stone/80 hover:bg-stone/10 dark:hover:bg-stone/20 theme-fade touch-manipulation"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('common.language')}
        id="language-switcher"
      >
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-labelledby="language-switcher"
          className="absolute right-0 top-full mt-1 py-1 w-44 max-h-[70vh] overflow-y-auto rounded-lg border border-stone/20 dark:border-stone/40 bg-white dark:bg-charcoal shadow-lg z-50 theme-fade"
        >
          {locales.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <button
                type="button"
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm rounded-none transition-colors touch-manipulation ${
                  l === locale
                    ? 'bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-medium'
                    : 'text-charcoal dark:text-cream hover:bg-stone/10 dark:hover:bg-stone/20'
                }`}
              >
                {localeNames[l]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
