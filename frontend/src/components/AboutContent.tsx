'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

export function AboutContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <article className="animate-fade-in">
      <h1 className="font-display text-3xl md:text-4xl text-charcoal dark:text-cream tracking-tight mb-6">
        {t('about.title')}
      </h1>
      <p className="text-stone dark:text-stone/80 leading-relaxed mb-8">{t('about.intro')}</p>
      <section>
        <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('about.contact')}</h2>
        <p className="text-stone dark:text-stone/80 leading-relaxed mb-4">{t('about.contactText')}</p>
        <a
          href="mailto:support@example.com"
          className="text-gold hover:underline font-medium"
        >
          support@example.com
        </a>
      </section>
      <p className="mt-8">
        <Link href={`/${locale}`} className="text-gold hover:underline">
          {t('common.backToHome')}
        </Link>
      </p>
    </article>
  );
}
