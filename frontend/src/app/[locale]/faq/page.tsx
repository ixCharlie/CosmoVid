import type { Metadata } from 'next';
import { FaqContent } from '@/components/FaqContent';
import { getPageMeta, getAlternatesForPageWithLocale, getOgLocale } from '@/lib/seo';
import type { Locale } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const validLocale: Locale = locale === 'ar' ? 'ar' : 'en';
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
      alternateLocale: validLocale === 'en' ? ['ar_AR'] : ['en_US'],
    },
  };
}

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <FaqContent />
    </div>
  );
}
