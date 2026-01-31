'use client';

import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

export function SkipLink() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-gold focus:text-charcoal focus:rounded-lg focus:outline-none"
    >
      {t('common.skipToContent')}
    </a>
  );
}
