'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';
import type { Locale } from '@/lib/i18n';

interface FooterProps {
  defaultLocale?: Locale;
}

export function Footer({ defaultLocale: _ }: FooterProps = {}) {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <footer dir="ltr" className="border-t border-stone/20 bg-charcoal text-cream/90 mt-auto" style={{ paddingBottom: 'max(1.5rem, var(--safe-bottom))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 md:py-8 w-full">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="font-display text-lg sm:text-xl text-cream shrink-0">CosmoVid</div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 sm:gap-x-8 sm:gap-y-4">
            <nav className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2" aria-label="Site">
              <Link href={`/${locale}`} className="hover:text-gold transition-colors min-h-[44px] inline-flex items-center py-2 text-sm sm:text-base touch-manipulation">
                {t('nav.home')}
              </Link>
              <Link href={`/${locale}/tools`} className="hover:text-gold transition-colors min-h-[44px] inline-flex items-center py-2 text-sm sm:text-base touch-manipulation">
                {t('nav.tools')}
              </Link>
            </nav>
          </div>
        </div>
        <p className="mt-4 sm:mt-5 text-sm text-cream/60 max-w-xl">
          For personal use only. Not affiliated with TikTok. Respect copyright and platform ToS.
        </p>
      </div>
    </footer>
  );
}
