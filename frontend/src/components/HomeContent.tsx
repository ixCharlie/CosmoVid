'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

export function HomeContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <main id="main-content" className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 theme-fade min-h-0 flex flex-col items-center text-center">
      <section className="animate-fade-in" aria-labelledby="welcome-heading">
        <p className="text-gold font-medium text-sm sm:text-base uppercase tracking-wider mb-4 sm:mb-5">
          {t('home.welcome')}
        </p>
        <h1 id="welcome-heading" className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-charcoal dark:text-cream tracking-tight mb-4 sm:mb-5 px-1 leading-tight">
          {t('home.title')}
        </h1>
        <p className="text-stone dark:text-stone/80 text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed mb-10 sm:mb-12">
          {t('home.subtitle')}
        </p>
        <Link
          href={`/${locale}/tools`}
          className="inline-flex min-h-[48px] items-center justify-center px-6 py-3 rounded-lg font-medium bg-charcoal dark:bg-cream text-cream dark:text-charcoal hover:bg-charcoal/90 dark:hover:bg-cream/90 transition-colors focus:ring-2 focus:ring-gold focus:ring-offset-2"
        >
          {t('home.getStarted')}
        </Link>
      </section>
    </main>
  );
}
