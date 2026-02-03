'use client';

import Link from 'next/link';
import { locales, localeNames, type Locale } from '@/lib/i18n';
import { setStoredLocale } from '@/lib/locale-preference';

const linkClass =
  'min-h-[48px] inline-flex items-center justify-center px-4 py-3 rounded-lg font-medium border-2 border-charcoal dark:border-cream text-charcoal dark:text-cream hover:bg-charcoal/10 dark:hover:bg-cream/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 touch-manipulation';
const primaryClass =
  'bg-charcoal dark:bg-cream text-cream dark:text-charcoal hover:bg-charcoal/90 dark:hover:bg-cream/90 border-0';

function LanguageLink({ locale, primary }: { locale: Locale; primary: boolean }) {
  return (
    <Link
      href={`/${locale}`}
      className={primary ? `${linkClass} ${primaryClass}` : linkClass}
      onClick={() => setStoredLocale(locale)}
    >
      {localeNames[locale]}
    </Link>
  );
}

export function LanguagePicker() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-cream dark:bg-charcoal theme-fade">
      <div className="text-center max-w-2xl">
        <p className="text-gold font-medium text-sm uppercase tracking-wider mb-4">
          Welcome
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-charcoal dark:text-cream tracking-tight mb-3">
          CosmoVid
        </h1>
        <p className="text-lg sm:text-xl text-charcoal dark:text-cream font-medium mb-2">
          Download TikTok videos in HD — with or without watermark. Free &amp; fast.
        </p>
        <p className="text-stone dark:text-stone/80 text-sm mb-8">
          Choose your language to get started
        </p>
        <nav
          className="flex flex-wrap gap-3 justify-center"
          aria-label="Language selection"
        >
          {locales.map((locale, i) => (
            <LanguageLink
              key={locale}
              locale={locale}
              primary={i === 0}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
