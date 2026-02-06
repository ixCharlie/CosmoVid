'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

export function PrivacyContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <article className="animate-fade-in w-full max-w-3xl">
      <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-charcoal dark:text-cream tracking-tight mb-5 sm:mb-6 px-1">
        {t('privacy.title')}
      </h1>
      <p className="text-stone dark:text-stone/80 text-sm mb-8">
        {t('privacy.lastUpdated')}
      </p>

      <section className="space-y-6 text-stone dark:text-stone/80 leading-relaxed">
        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('privacy.introTitle')}</h2>
          <p>{t('privacy.intro')}</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('privacy.adsTitle')}</h2>
          <p className="mb-3">{t('privacy.adsIntro')}</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>{t('privacy.adsPoint1')}</li>
            <li>{t('privacy.adsPoint2')}</li>
            <li>{t('privacy.adsPoint3')}</li>
          </ul>
          <p className="mb-2">{t('privacy.optOutIntro')}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                Google Ads Settings
              </a>
            </li>
            <li>
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                www.aboutads.info
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('privacy.dataTitle')}</h2>
          <p>{t('privacy.data')}</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-charcoal dark:text-cream mb-2">{t('privacy.contactTitle')}</h2>
          <p>{t('privacy.contact')}</p>
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
