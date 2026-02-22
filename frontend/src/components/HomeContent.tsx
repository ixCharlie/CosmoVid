'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

const tools = [
  { key: 'tiktok', href: (locale: string) => `/${locale}/tiktok`, titleKey: 'toolTikTokTitle', descKey: 'toolTikTokDesc' },
  { key: 'x', href: (locale: string) => `/${locale}/x`, titleKey: 'toolXTitle', descKey: 'toolXDesc' },
  { key: 'instagram', href: (locale: string) => `/${locale}/instagram`, titleKey: 'toolInstagramTitle', descKey: 'toolInstagramDesc' },
  { key: 'instagramStories', href: (locale: string) => `/${locale}/instagram/stories`, titleKey: 'toolInstagramStoriesTitle', descKey: 'toolInstagramStoriesDesc' },
] as const;

export function HomeContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12 theme-fade min-h-0">
      <section className="text-center mb-8 sm:mb-12 md:mb-14">
        <p className="font-display text-base sm:text-lg text-gold dark:text-gold mb-2">
          {t('home.greeting')}
        </p>
        <h1 className="font-display text-xl sm:text-3xl md:text-4xl lg:text-5xl text-charcoal dark:text-cream tracking-tight mb-3 sm:mb-4 px-1">
          {t('home.title')}
        </h1>
        <p className="text-stone dark:text-stone/80 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-snug">
          {t('home.intro')}
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 max-w-3xl mx-auto" aria-label={t('home.chooseTool')}>
        {tools.map(({ key, href, titleKey, descKey }) => {
          const isX = key === 'x';
          const isInstagram = key === 'instagram' || key === 'instagramStories';
          const hoverBorder = isX ? 'hover:border-blue-500 dark:hover:border-blue-400' : isInstagram ? 'hover:border-pink-500 dark:hover:border-pink-400' : 'hover:border-black dark:hover:border-cream';
          const hoverText = isX ? 'group-hover:text-blue-500 dark:group-hover:text-blue-400' : isInstagram ? 'group-hover:text-pink-500 dark:group-hover:text-pink-400' : 'group-hover:text-black dark:group-hover:text-cream';
          const hoverArrow = isX ? 'group-hover:text-blue-500 dark:group-hover:text-blue-400' : isInstagram ? 'group-hover:text-pink-500 dark:group-hover:text-pink-400' : 'group-hover:text-black dark:group-hover:text-cream';
          return (
            <Link
              key={key}
              href={href(locale)}
              className={`group flex flex-col w-full min-h-[180px] sm:min-h-[200px] rounded-2xl border-2 border-stone/20 dark:border-stone/40 bg-white dark:bg-stone/5 hover:shadow-lg active:scale-[0.99] transition-none p-5 sm:p-6 text-left touch-manipulation ${hoverBorder}`}
            >
              <h2 className={`font-display text-lg sm:text-xl text-charcoal dark:text-cream mb-2 transition-none ${hoverText}`}>
                {t(`tools.${titleKey}`)}
              </h2>
              <p className="text-stone dark:text-stone/80 text-sm sm:text-base flex-1 line-clamp-3">
                {t(`tools.${descKey}`)}
              </p>
              <span className={`mt-4 inline-flex items-center gap-2 text-stone dark:text-stone/70 font-medium text-sm sm:text-base group-hover:gap-3 transition-none ${hoverArrow}`}>
                {t('tools.useTool')}
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
