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
    <footer className="border-t border-stone/20 bg-charcoal text-cream/90 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="font-display text-lg text-cream">CosmoVid</div>
          <nav className="flex flex-wrap gap-6 text-sm" aria-label="Footer">
            <Link href={`/${locale}`} className="hover:text-gold transition-colors">
              {t('nav.home')}
            </Link>
            <Link href={`/${locale}/tools`} className="hover:text-gold transition-colors">
              {t('nav.tools')}
            </Link>
            <Link href={`/${locale}/faq`} className="hover:text-gold transition-colors">
              {t('nav.faq')}
            </Link>
            <Link href={`/${locale}/about`} className="hover:text-gold transition-colors">
              {t('nav.about')}
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-sm text-cream/60">
          For personal use only. Not affiliated with TikTok. Respect copyright and platform ToS.
        </p>
      </div>
    </footer>
  );
}
