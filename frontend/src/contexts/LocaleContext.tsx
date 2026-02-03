'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n';
import { locales, rtlLocales } from '@/lib/i18n';
import { setStoredLocale } from '@/lib/locale-preference';

type LocaleContextType = { locale: Locale; setLocale: (l: Locale) => void };

const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  setLocale: () => {},
});

const localePattern = new RegExp(`^/(${locales.join('|')})(?:/|$)`);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = initialLocale;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = (l: Locale) => {
    if (l === locale) return;
    setStoredLocale(l);
    const pathWithoutLocale = pathname.replace(localePattern, '/') || '/';
    const newPath = pathWithoutLocale === '/' ? `/${l}` : `/${l}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
