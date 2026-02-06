'use client';

import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

export function FaqContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <article className="animate-fade-in w-full">
      <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-charcoal dark:text-cream tracking-tight mb-6 sm:mb-8 px-1">
        {t('faq.title')}
      </h1>
      <section className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('faq.howItWorks')}</h2>
          <p className="text-stone dark:text-stone/80 leading-relaxed text-base sm:text-lg">{t('faq.howItWorksAnswer')}</p>
        </div>
        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('faq.legal')}</h2>
          <p className="text-stone dark:text-stone/80 leading-relaxed text-base sm:text-lg">{t('faq.legalAnswer')}</p>
        </div>
      </section>
    </article>
  );
}
