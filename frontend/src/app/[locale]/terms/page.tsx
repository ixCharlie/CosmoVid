import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n';
import { isLocale } from '@/lib/i18n';
import { TermsContent } from '@/components/TermsContent';
import { getOgLocale, getOgAlternateLocales } from '@/lib/seo';
import { baseUrl } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const validLocale: Locale = isLocale(locale) ? locale : 'en';
  const canonical = `${baseUrl()}/${validLocale}/terms`;
  return {
    title: 'Terms of Service | CosmoVid',
    description: 'Terms of Service for CosmoVid. Use of our video downloader tools. Personal use, copyright, and disclaimers.',
    alternates: { canonical },
    openGraph: {
      title: 'Terms of Service | CosmoVid',
      description: 'Terms of Service. Use of CosmoVid tools.',
      url: canonical,
      locale: getOgLocale(validLocale),
      alternateLocale: getOgAlternateLocales(validLocale),
    },
  };
}

export default function TermsPage() {
  return (
    <div className="page-content page-section w-full max-w-3xl mx-auto">
      <TermsContent />
    </div>
  );
}
