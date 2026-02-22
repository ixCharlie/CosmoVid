'use client';

import { useState, useCallback } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';
import Link from 'next/link';
import { InstagramDownloadForm } from '@/components/InstagramDownloadForm';
import { InstagramDownloadResults } from '@/components/InstagramDownloadResults';

type InstagramResult = {
  success: boolean;
  title?: string;
  author?: string;
  cover?: string;
  duration?: number;
  quality?: string;
  links: {
    video?: string;
    image?: string;
    items?: Array<{ url: string; type: 'video' | 'image'; thumbnail?: string }>;
  };
  error?: string;
  _submittedUrl?: string;
};

export function InstagramPageClient() {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [result, setResult] = useState<InstagramResult | null>(null);
  const [retryUrl, setRetryUrl] = useState<string | null>(null);

  const handleRetry = useCallback((url: string) => {
    setResult(null);
    setRetryUrl(url);
  }, []);

  return (
    <div className="page-content page-section theme-fade min-h-0 w-full max-w-3xl mx-auto">
      <p className="mb-5 sm:mb-6">
        <Link
          href={`/${locale}`}
          className="text-gold hover:underline text-sm font-medium min-h-[44px] inline-flex items-center touch-manipulation"
        >
          ← {t('common.backToHome')}
        </Link>
      </p>
      <section className="animate-fade-in text-center mb-4 sm:mb-8 md:mb-10">
        <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-charcoal dark:text-cream tracking-tight mb-2 sm:mb-3 px-2">
          {t('tools.toolInstagramTitle')}
        </h1>
        <p className="text-stone dark:text-stone/80 text-sm sm:text-base max-w-xl mx-auto leading-snug px-1">
          {t('tools.toolInstagramDesc')}
        </p>
        <Link
          href={`/${locale}/instagram/stories`}
          className="mt-2 inline-block text-sm text-gold hover:underline"
        >
          {t('tools.toolInstagramStoriesTitle')} →
        </Link>
      </section>
      <InstagramDownloadForm
        onResult={setResult}
        retryUrl={retryUrl}
        onRetryUrlConsumed={() => setRetryUrl(null)}
      />
      {result && (
        <div className="mt-6 sm:mt-8 animate-slide-up">
          <InstagramDownloadResults
            result={result}
            onReset={() => setResult(null)}
            onRetry={handleRetry}
          />
        </div>
      )}
      <section className="mt-10 sm:mt-12 pt-8 border-t border-stone/20 dark:border-stone/30" aria-labelledby="instagram-how-to-use">
        <h2 id="instagram-how-to-use" className="font-display text-base sm:text-lg text-charcoal dark:text-cream mb-3 text-center">
          {t('instagram.howToUse')}
        </h2>
        <ol className="space-y-3 max-w-lg mx-auto text-left">
          {[
            { key: 'step1', label: t('instagram.step1') },
            { key: 'step2', label: t('instagram.step2') },
            { key: 'step3', label: t('instagram.step3') },
            { key: 'step4', label: t('instagram.step4') },
          ].map(({ key, label }, i) => (
            <li key={key} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/20 dark:bg-gold/30 text-gold font-display font-medium flex items-center justify-center text-sm">
                {i + 1}
              </span>
              <span className="text-stone dark:text-stone/80 pt-0.5 text-sm sm:text-base">{label}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
