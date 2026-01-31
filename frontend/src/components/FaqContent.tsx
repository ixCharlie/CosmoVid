'use client';

import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

export function FaqContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <article className="animate-fade-in">
      <h1 className="font-display text-3xl md:text-4xl text-charcoal dark:text-cream tracking-tight mb-8">
        {t('faq.title')}
      </h1>
      <section className="space-y-8">
        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('faq.howItWorks')}</h2>
          <p className="text-stone dark:text-stone/80 leading-relaxed">{t('faq.howItWorksAnswer')}</p>
        </div>
        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('faq.legal')}</h2>
          <p className="text-stone dark:text-stone/80 leading-relaxed">{t('faq.legalAnswer')}</p>
        </div>
      </section>
    </article>
  );
}
