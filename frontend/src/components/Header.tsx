'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getTranslations } from '@/lib/translations';
import { localeNames, type Locale } from '@/lib/i18n';

interface HeaderProps {
  locales: Locale[];
  defaultLocale: Locale;
}

export function Header({ locales, defaultLocale }: HeaderProps) {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const t = getTranslations(locale);

  const nav = [
    { href: `/${locale}`, label: t('nav.home') },
    { href: `/${locale}/faq`, label: t('nav.faq') },
    { href: `/${locale}/about`, label: t('nav.about') },
  ];

  return (
    <header className="border-b border-stone/20 bg-white/80 dark:bg-charcoal/90 dark:border-stone/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href={`/${locale}`}
            className="font-display text-xl md:text-2xl text-charcoal dark:text-cream tracking-tight hover:text-gold dark:hover:text-gold transition-colors"
          >
            CosmoVid
          </Link>
          <nav className="flex items-center gap-4 md:gap-6" aria-label="Main">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm md:text-base transition-colors ${
                  pathname === href ? 'text-gold font-medium' : 'text-stone dark:text-stone/80 hover:text-charcoal dark:hover:text-cream'
                }`}
              >
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-stone dark:text-stone/80 hover:bg-stone/10 dark:hover:bg-stone/20 transition-colors"
              aria-label={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
              title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <div className="relative flex items-center gap-1">
              <span className="sr-only">{t('common.language')}</span>
              {locales.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={`px-2 py-1 text-sm rounded transition-colors ${
                    locale === l ? 'bg-charcoal dark:bg-cream text-cream dark:text-charcoal' : 'text-stone dark:text-stone/80 hover:bg-stone/10 dark:hover:bg-stone/20'
                  }`}
                  aria-pressed={locale === l}
                >
                  {localeNames[l]}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
