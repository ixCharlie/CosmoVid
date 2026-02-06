'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

export function TermsContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <article className="animate-fade-in w-full max-w-3xl">
      <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-charcoal dark:text-cream tracking-tight mb-5 sm:mb-6 px-1">
        {t('terms.title')}
      </h1>
      <p className="text-stone dark:text-stone/80 text-sm mb-8">
        {t('terms.lastUpdated')}
      </p>

      <section className="space-y-6 text-stone dark:text-stone/80 leading-relaxed">
        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('terms.acceptTitle')}</h2>
          <p>{t('terms.accept')}</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('terms.useTitle')}</h2>
          <p>{t('terms.use')}</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('terms.disclaimerTitle')}</h2>
          <p>{t('terms.disclaimer')}</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('terms.changesTitle')}</h2>
          <p>{t('terms.changes')}</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('terms.contactTitle')}</h2>
          <p>{t('terms.contact')}</p>
        </div>
      </section>

      <p className="mt-8 sm:mt-10">
        <Link href={`/${locale}`} className="text-gold hover:underline font-medium min-h-[44px] inline-flex items-center touch-manipulation">
          {t('common.backToHome')}
        </Link>
      </p>
    </article>
  );
}
