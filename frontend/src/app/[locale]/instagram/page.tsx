import type { Metadata } from 'next';
import { getPageMeta, getAlternatesForPageWithLocale, getOgLocale, getOgAlternateLocales } from '@/lib/seo';
import type { Locale } from '@/lib/i18n';
import { isLocale } from '@/lib/i18n';
import { InstagramPageClient } from '@/components/InstagramPageClient';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const validLocale: Locale = isLocale(locale) ? locale : 'en';
  const meta = getPageMeta(validLocale, 'instagram');
  const alternates = getAlternatesForPageWithLocale(validLocale, 'instagram');
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

export default function InstagramPage() {
  return <InstagramPageClient />;
}
