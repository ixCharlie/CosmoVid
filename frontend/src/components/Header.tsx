'use client';

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

  const nav = [
    { href: `/${locale}`, label: t('nav.home') },
    { href: `/${locale}/faq`, label: t('nav.faq') },
    { href: `/${locale}/about`, label: t('nav.about') },
  ];

  return (
    <header className="border-b border-stone/20 bg-white/80 dark:bg-charcoal/90 dark:border-stone/30 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-[1.5s] ease-in-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-14 sm:h-16 md:h-20 gap-2">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 font-display text-xl md:text-2xl text-charcoal dark:text-cream tracking-tight hover:text-gold dark:hover:text-gold theme-fade shrink-0 py-2 touch-manipulation"
            aria-label="CosmoVid Home"
          >
            <Image
              src="/Cosmo.png"
              alt=""
              width={40}
              height={40}
              className="h-8 w-8 md:h-10 md:w-10 object-contain"
              priority
              unoptimized
            />
            <span>CosmoVid</span>
          </Link>
          <nav className="flex items-center flex-wrap justify-end gap-1 sm:gap-2 md:gap-6" aria-label="Main">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`min-h-[44px] min-w-[44px] sm:min-w-0 inline-flex items-center justify-center px-3 py-2 text-sm md:text-base rounded-lg theme-fade touch-manipulation ${
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
        </div>
      </div>
    </header>
  );
}
