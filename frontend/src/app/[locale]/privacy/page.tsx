import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n';
import { isLocale } from '@/lib/i18n';
import { PrivacyContent } from '@/components/PrivacyContent';
import { getOgLocale, getOgAlternateLocales } from '@/lib/seo';
import { baseUrl } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const validLocale: Locale = isLocale(locale) ? locale : 'en';
  const canonical = `${baseUrl()}/${validLocale}/privacy`;
  return {
    title: 'Privacy Policy | CosmoVid',
    description: 'Privacy policy for CosmoVid. How we use data, cookies, and third-party advertising (Google AdSense). Your choices and opt-out options.',
    alternates: {
      canonical,
      languages: { 'x-default': `${baseUrl()}/en/privacy`, en: `${baseUrl()}/en/privacy`, ar: `${baseUrl()}/ar/privacy`, es: `${baseUrl()}/es/privacy`, fr: `${baseUrl()}/fr/privacy`, de: `${baseUrl()}/de/privacy`, pt: `${baseUrl()}/pt/privacy`, zh: `${baseUrl()}/zh/privacy`, hi: `${baseUrl()}/hi/privacy`, ru: `${baseUrl()}/ru/privacy` },
    },
    openGraph: {
      title: 'Privacy Policy | CosmoVid',
      description: 'Privacy policy. Cookies, ads, and your choices.',
      url: canonical,
      locale: getOgLocale(validLocale),
      alternateLocale: getOgAlternateLocales(validLocale),
    },
  };
}

export default function PrivacyPage() {
  return (
    <div className="page-content page-section w-full max-w-3xl mx-auto">
      <PrivacyContent />
    </div>
  );
}
