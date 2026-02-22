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

export function ToolsContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="page-content page-section theme-fade min-h-0 w-full">
      <section className="text-center mb-6 sm:mb-10 md:mb-12">
        <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-charcoal tracking-tight mb-2 sm:mb-3 px-2">
          {t('tools.title')}
        </h1>
        <p className="text-stone text-sm sm:text-base max-w-xl mx-auto leading-snug px-1">
          {t('tools.intro')}
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 max-w-3xl mx-auto" aria-label={t('tools.title')}>
        {tools.map(({ key, href, titleKey, descKey }) => {
          const isX = key === 'x';
          const isInstagram = key === 'instagram' || key === 'instagramStories';
          const hoverBorder = isX ? 'hover:border-blue-500' : isInstagram ? 'hover:border-pink-500' : 'hover:border-black';
          const hoverText = isX ? 'group-hover:text-blue-500' : isInstagram ? 'group-hover:text-pink-500' : 'group-hover:text-black';
          const hoverArrow = isX ? 'group-hover:text-blue-500' : isInstagram ? 'group-hover:text-pink-500' : 'group-hover:text-black';
          return (
            <Link
              key={key}
              href={href(locale)}
              className={`group flex flex-col w-full min-h-[180px] sm:min-h-[200px] rounded-2xl border-2 border-stone/20 bg-white hover:shadow-lg active:scale-[0.99] transition-none p-5 sm:p-6 text-left touch-manipulation ${hoverBorder}`}
            >
              <h2 className={`font-display text-lg sm:text-xl text-charcoal mb-2 transition-none ${hoverText}`}>
                {t(`tools.${titleKey}`)}
              </h2>
              <p className="text-stone text-sm sm:text-base flex-1 line-clamp-3">
                {t(`tools.${descKey}`)}
              </p>
              <span className={`mt-4 inline-flex items-center gap-2 text-stone font-medium text-sm sm:text-base group-hover:gap-3 transition-none ${hoverArrow}`}>
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
