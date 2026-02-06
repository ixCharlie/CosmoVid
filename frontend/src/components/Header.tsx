'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getTranslations } from '@/lib/translations';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface HeaderProps {
  defaultLocale?: string;
}

export function Header({ defaultLocale: _ }: HeaderProps = {}) {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { theme, setTheme } = useTheme();
  const t = getTranslations(locale);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: `/${locale}`, label: t('nav.home') },
    { href: `/${locale}/tools`, label: t('nav.tools') },
    { href: `/${locale}/blog`, label: t('nav.blog') },
    { href: `/${locale}/faq`, label: t('nav.faq') },
    { href: `/${locale}/about`, label: t('nav.about') },
  ];
  const nav = locale === 'ar' ? [...navItems].reverse() : navItems;

  return (
    <header dir="ltr" className="border-b border-stone/20 bg-white/95 dark:bg-charcoal/95 dark:border-stone/30 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200 ease-out" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between min-h-14 sm:h-16 gap-3 md:gap-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 font-display text-xl md:text-2xl text-charcoal dark:text-cream tracking-tight hover:text-gold dark:hover:text-gold theme-fade shrink-0 py-2 touch-manipulation min-h-[44px]"
            aria-label="CosmoVid Home"
          >
            <Image
              src="/NEW.png"
              alt=""
              width={40}
              height={40}
              className="h-8 w-8 md:h-10 md:w-10 object-contain"
              priority
              unoptimized
            />
            <span>CosmoVid</span>
          </Link>

          {/* Desktop nav: visible from md up */}
          <nav className="hidden md:flex items-center flex-wrap justify-end gap-0.5 sm:gap-2 lg:gap-4" aria-label="Main">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`min-h-[44px] min-w-[44px] sm:min-w-0 inline-flex items-center justify-center px-3 py-2 text-sm lg:text-base rounded-lg theme-fade touch-manipulation ${
                  pathname === href ? 'text-gold font-medium' : 'text-stone dark:text-stone/80 hover:text-charcoal dark:hover:text-cream active:bg-stone/10 dark:active:bg-stone/20'
                }`}
              >
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone dark:text-stone/80 hover:bg-stone/10 dark:hover:bg-stone/20 theme-fade touch-manipulation"
              aria-label={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
              title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <LanguageSwitcher />
          </nav>

          {/* Mobile: theme + language + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone dark:text-stone/80 hover:bg-stone/10 dark:hover:bg-stone/20 theme-fade touch-manipulation"
              aria-label={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone dark:text-stone/80 hover:bg-stone/10 dark:hover:bg-stone/20 theme-fade touch-manipulation"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown: scrollable if many items */}
        <div
          id="mobile-nav"
          className={`md:hidden overflow-hidden transition-[max-height] duration-200 ease-out ${mobileMenuOpen ? 'max-h-[min(70vh,400px)]' : 'max-h-0'}`}
          aria-hidden={!mobileMenuOpen}
        >
          <nav className="pb-4 pt-2 flex flex-col gap-0.5 overflow-y-auto overscroll-contain max-h-[min(70vh,400px)]" aria-label="Main">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`min-h-[48px] flex items-center px-4 py-3 text-base rounded-lg theme-fade touch-manipulation ${
                  pathname === href ? 'text-gold font-medium bg-gold/10 dark:bg-gold/20' : 'text-charcoal dark:text-cream hover:bg-stone/10 dark:hover:bg-stone/20 active:bg-stone/15 dark:active:bg-stone/25'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
