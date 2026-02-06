'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

export function AboutContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <article className="animate-fade-in w-full">
      <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-charcoal dark:text-cream tracking-tight mb-5 sm:mb-6 px-1">
        {t('about.title')}
      </h1>
      <p className="text-stone dark:text-stone/80 leading-relaxed mb-6 sm:mb-8 text-base sm:text-lg">{t('about.intro')}</p>
      <section>
        <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('about.contact')}</h2>
        <p className="text-stone dark:text-stone/80 leading-relaxed mb-4 text-base sm:text-lg">{t('about.contactText')}</p>
        <a
          href="mailto:himtonysoprano@gmail.com"
          className="text-gold hover:underline font-medium min-h-[44px] inline-flex items-center touch-manipulation"
        >
          himtonysoprano@gmail.com
        </a>
      </section>
      <p className="mt-6 sm:mt-8">
        <Link href={`/${locale}`} className="text-gold hover:underline font-medium min-h-[44px] inline-flex items-center touch-manipulation">
          {t('common.backToHome')}
        </Link>
      </p>
    </article>
  );
}
