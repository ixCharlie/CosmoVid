'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

export function ToolsContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  const tools = [
    {
      id: 'tiktok-downloader',
      href: `/${locale}`,
      titleKey: 'tools.toolTikTokTitle' as const,
      descKey: 'tools.toolTikTokDesc' as const,
    },
    {
      id: 'video-shrinker',
      href: `/${locale}/shrink`,
      titleKey: 'tools.toolShrinkTitle' as const,
      descKey: 'tools.toolShrinkDesc' as const,
    },
  ];

  return (
    <article className="animate-fade-in">
      <h1 className="font-display text-3xl md:text-4xl text-charcoal dark:text-cream tracking-tight mb-4">
        {t('tools.title')}
      </h1>
      <p className="text-stone dark:text-stone/80 text-lg mb-10 leading-relaxed">
        {t('tools.intro')}
      </p>
      <ul className="space-y-6" aria-label={t('tools.title')}>
        {tools.map((tool) => (
          <li
            key={tool.id}
            className="rounded-xl border border-stone/20 dark:border-stone/40 bg-white dark:bg-stone/10 p-6 theme-fade"
          >
            <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">
              {t(tool.titleKey)}
            </h2>
            <p className="text-stone dark:text-stone/80 mb-4">
              {t(tool.descKey)}
            </p>
            <Link
              href={tool.href}
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-medium hover:opacity-90 transition-opacity touch-manipulation"
            >
              {t('tools.useTool')}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-stone dark:text-stone/70 text-sm">
        {t('tools.moreComing')}
      </p>
    </article>
  );
}
