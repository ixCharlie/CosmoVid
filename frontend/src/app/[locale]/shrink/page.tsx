import type { Metadata } from 'next';
import { ShrinkContent } from '@/components/ShrinkContent';
import { getPageMeta, getAlternatesForPageWithLocale, getOgLocale, getOgAlternateLocales } from '@/lib/seo';
import type { Locale } from '@/lib/i18n';
import { isLocale } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const validLocale: Locale = isLocale(locale) ? locale : 'en';
  const meta = getPageMeta(validLocale, 'shrink');
  const alternates = getAlternatesForPageWithLocale(validLocale, 'shrink');
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

export default function ShrinkPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <ShrinkContent />
    </div>
  );
}
