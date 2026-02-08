'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface HeaderProps {
  defaultLocale?: string;
}

export function Header({ defaultLocale: _ }: HeaderProps = {}) {
  const pathname = usePathname();
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: `/${locale}`, label: t('nav.home') },
    { href: `/${locale}/tools`, label: t('nav.tools') },
  ];
  const nav = locale === 'ar' ? [...navItems].reverse() : navItems;

  return (
    <header dir="ltr" className="border-b border-stone/20 bg-white/95 backdrop-blur-md sticky top-0 z-50" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center min-h-12 sm:min-h-14 sm:h-16 gap-2 sm:gap-4">
          <div className="flex items-center flex-1 justify-start min-w-0">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 font-display text-lg sm:text-xl md:text-2xl text-charcoal tracking-tight hover:text-gold py-2 touch-manipulation min-h-[44px]"
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
          </div>

          {/* Desktop nav: centered */}
          <nav className="hidden md:flex items-center justify-center flex-shrink-0 gap-0.5 sm:gap-2 lg:gap-4" aria-label="Main">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`min-h-[44px] min-w-[44px] sm:min-w-0 inline-flex items-center justify-center px-3 py-2 text-sm lg:text-base rounded-lg touch-manipulation ${
                  pathname === href ? 'text-gold font-medium' : 'text-stone hover:text-charcoal active:bg-stone/10'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop: language */}
          <div className="hidden md:flex items-center justify-end flex-1 gap-1 min-w-0">
            <LanguageSwitcher />
          </div>

          {/* Mobile: language + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone hover:bg-stone/10 touch-manipulation"
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
                className={`min-h-[48px] flex items-center px-4 py-3 text-base rounded-lg touch-manipulation ${
                  pathname === href ? 'text-gold font-medium bg-gold/10' : 'text-charcoal hover:bg-stone/10 active:bg-stone/15'
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
