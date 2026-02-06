'use client';

import { useState, useCallback } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';
import Link from 'next/link';
import { XDownloadForm } from '@/components/XDownloadForm';
import { XDownloadResults } from '@/components/XDownloadResults';

type XResult = {
  success: boolean;
  title?: string;
  author?: string;
  cover?: string;
  duration?: number;
  quality?: string;
  links: { video?: string };
  error?: string;
  _submittedUrl?: string;
};

export function XPageClient() {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [result, setResult] = useState<XResult | null>(null);
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
      <section className="animate-fade-in text-center mb-6 sm:mb-8 md:mb-10">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-charcoal dark:text-cream tracking-tight mb-2 sm:mb-3 px-2">
          {t('tools.toolXTitle')}
        </h1>
        <p className="text-stone dark:text-stone/80 text-base sm:text-lg max-w-xl mx-auto leading-snug px-1">
          {t('tools.toolXDesc')}
        </p>
      </section>
      <XDownloadForm
        onResult={setResult}
        retryUrl={retryUrl}
        onRetryUrlConsumed={() => setRetryUrl(null)}
      />
      {result && (
        <div className="mt-6 sm:mt-8 animate-slide-up">
          <XDownloadResults
            result={result}
            onReset={() => setResult(null)}
            onRetry={handleRetry}
          />
        </div>
      )}
      <section className="mt-10 sm:mt-12 pt-8 border-t border-stone/20 dark:border-stone/30" aria-labelledby="x-how-to-use">
        <h2 id="x-how-to-use" className="font-display text-lg sm:text-xl text-charcoal dark:text-cream mb-4 text-center">
          {t('x.howToUse')}
        </h2>
        <ol className="space-y-3 max-w-lg mx-auto text-left">
          {[
            { key: 'step1', label: t('x.step1') },
            { key: 'step2', label: t('x.step2') },
            { key: 'step3', label: t('x.step3') },
            { key: 'step4', label: t('x.step4') },
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
