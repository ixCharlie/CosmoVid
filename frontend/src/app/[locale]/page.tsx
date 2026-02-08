import type { Metadata } from 'next';
import { getPageMeta, getAlternatesForPageWithLocale, getOgLocale, getOgAlternateLocales, baseUrl } from '@/lib/seo';
import type { Locale } from '@/lib/i18n';
import { isLocale } from '@/lib/i18n';
import { HomeContent } from '@/components/HomeContent';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const validLocale: Locale = isLocale(locale) ? locale : 'en';
  const meta = getPageMeta(validLocale, 'home');
  const alternates = getAlternatesForPageWithLocale(validLocale, 'home');
  const url = alternates.canonical;
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: url,
      languages: alternates.languages,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      locale: getOgLocale(validLocale),
      alternateLocale: getOgAlternateLocales(validLocale),
      siteName: 'CosmoVid',
      type: 'website',
      images: [{ url: `${baseUrl()}/NEW.png`, width: 512, height: 512, alt: 'CosmoVid - TikTok Downloader' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

export default function HomePage() {
  return <HomeContent />;
}
