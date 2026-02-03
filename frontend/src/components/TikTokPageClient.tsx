'use client';

import { useState, useCallback } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';
import Link from 'next/link';
import { DownloadForm } from '@/components/DownloadForm';
import { DownloadResults } from '@/components/DownloadResults';

type TikTokResult = {
  success: boolean;
  title?: string;
  author?: string;
  cover?: string;
  links: { mp4HdWatermark?: string; mp4HdNoWatermark?: string; mp3?: string };
  error?: string;
  _submittedUrl?: string;
};

export function TikTokPageClient() {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [result, setResult] = useState<TikTokResult | null>(null);
  const [retryUrl, setRetryUrl] = useState<string | null>(null);

  const handleRetry = useCallback((url: string) => {
    setResult(null);
    setRetryUrl(url);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 theme-fade min-h-0">
      <p className="mb-6">
        <Link
          href={`/${locale}`}
          className="text-gold hover:underline text-sm font-medium"
        >
          ← {t('common.backToHome')}
        </Link>
      </p>
      <section className="animate-fade-in text-center mb-8 sm:mb-10">
        <h1 className="font-display text-2xl sm:text-4xl text-charcoal dark:text-cream tracking-tight mb-2 sm:mb-3 px-1">
          {t('tools.toolTikTokTitle')}
        </h1>
        <p className="text-stone dark:text-stone/80 text-base sm:text-lg max-w-xl mx-auto leading-snug">
          {t('tools.toolTikTokDesc')}
        </p>
      </section>
      <DownloadForm
        onResult={setResult}
        retryUrl={retryUrl}
        onRetryUrlConsumed={() => setRetryUrl(null)}
      />
      {result && (
        <div className="mt-6 sm:mt-8 animate-slide-up">
          <DownloadResults
            result={result}
            onReset={() => setResult(null)}
            onRetry={handleRetry}
          />
        </div>
      )}
      <section className="mt-10 sm:mt-12 pt-8 border-t border-stone/20 dark:border-stone/30" aria-labelledby="how-to-use-heading">
        <h2 id="how-to-use-heading" className="font-display text-lg sm:text-xl text-charcoal dark:text-cream mb-4 text-center">
          {t('home.howToUse')}
        </h2>
        <ol className="space-y-3 max-w-lg mx-auto text-left">
          {[
            { key: 'step1', label: t('home.step1') },
            { key: 'step2', label: t('home.step2') },
            { key: 'step3', label: t('home.step3') },
            { key: 'step4', label: t('home.step4') },
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
