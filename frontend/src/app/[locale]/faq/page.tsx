import type { Metadata } from 'next';
import { FaqContent } from '@/components/FaqContent';
import { getPageMeta, getAlternatesForPageWithLocale, getOgLocale, getOgAlternateLocales } from '@/lib/seo';
import type { Locale } from '@/lib/i18n';
import { isLocale } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const validLocale: Locale = isLocale(locale) ? locale : 'en';
  const meta = getPageMeta(validLocale, 'faq');
  const alternates = getAlternatesForPageWithLocale(validLocale, 'faq');
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: getOgLocale(validLocale),
      alternateLocale: getOgAlternateLocales(validLocale),
    },
  };
}

export default function FaqPage() {
  return (
    <div className="page-content page-section w-full max-w-3xl mx-auto">
      <FaqContent />
    </div>
  );
}
