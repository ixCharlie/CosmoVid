import type { Metadata } from 'next';
import { getPageMeta, getAlternatesForPageWithLocale, getOgLocale } from '@/lib/seo';
import type { Locale } from '@/lib/i18n';
import { HomeContent } from '@/components/HomeContent';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const validLocale: Locale = locale === 'ar' ? 'ar' : 'en';
  const meta = getPageMeta(validLocale, 'home');
  const alternates = getAlternatesForPageWithLocale(validLocale, 'home');
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
      alternateLocale: validLocale === 'en' ? ['ar_AR'] : ['en_US'],
    },
  };
}

export default function HomePage() {
  return <HomeContent />;
}
