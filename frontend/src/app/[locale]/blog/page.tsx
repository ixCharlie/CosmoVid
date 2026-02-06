import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n';
import { isLocale } from '@/lib/i18n';
import { BlogContent } from '@/components/BlogContent';
import { getOgLocale, getOgAlternateLocales } from '@/lib/seo';
import { baseUrl } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const validLocale: Locale = isLocale(locale) ? locale : 'en';
  const canonical = `${baseUrl()}/${validLocale}/blog`;
  return {
    title: 'Blog | CosmoVid',
    description: 'CosmoVid blog. Tips, guides, and updates about video downloaders and our tools.',
    alternates: { canonical },
    openGraph: {
      title: 'Blog | CosmoVid',
      description: 'Tips, guides, and updates about video downloaders.',
      url: canonical,
      locale: getOgLocale(validLocale),
      alternateLocale: getOgAlternateLocales(validLocale),
    },
  };
}

export default function BlogPage() {
  return <BlogContent />;
}
