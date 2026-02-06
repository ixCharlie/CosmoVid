'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

const tools = [
  { key: 'tiktok', href: (locale: string) => `/${locale}/tiktok`, titleKey: 'toolTikTokTitle', descKey: 'toolTikTokDesc' },
  { key: 'x', href: (locale: string) => `/${locale}/x`, titleKey: 'toolXTitle', descKey: 'toolXDesc' },
] as const;

export function ToolsContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="page-content page-section theme-fade min-h-0 w-full">
      <section className="text-center mb-8 sm:mb-10 md:mb-12">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-charcoal dark:text-cream tracking-tight mb-2 sm:mb-3 px-2">
          {t('tools.title')}
        </h1>
        <p className="text-stone dark:text-stone/80 text-base sm:text-lg max-w-xl mx-auto leading-snug px-1">
          {t('tools.intro')}
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 max-w-2xl mx-auto" aria-label={t('tools.title')}>
        {tools.map(({ key, href, titleKey, descKey }) => (
          <Link
            key={key}
            href={href(locale)}
            className="group flex flex-col w-full min-h-[180px] sm:min-h-[200px] rounded-2xl border-2 border-stone/20 dark:border-stone/40 bg-white dark:bg-stone/10 hover:border-gold dark:hover:border-gold hover:shadow-lg active:scale-[0.99] transition-all duration-200 p-5 sm:p-6 text-left touch-manipulation"
          >
            <h2 className="font-display text-lg sm:text-xl text-charcoal dark:text-cream mb-2 group-hover:text-gold dark:group-hover:text-gold transition-colors">
              {t(`tools.${titleKey}`)}
            </h2>
            <p className="text-stone dark:text-stone/80 text-sm sm:text-base flex-1 line-clamp-3">
              {t(`tools.${descKey}`)}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-gold font-medium text-sm sm:text-base group-hover:gap-3 transition-all">
              {t('tools.useTool')}
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
