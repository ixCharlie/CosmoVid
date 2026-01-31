import { notFound } from 'next/navigation';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SkipLink } from '@/components/SkipLink';
import { locales, defaultLocale, type Locale } from '@/lib/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === 'en' || locale === 'ar' ? (locale as Locale) : null;
  if (!validLocale) notFound();

  return (
    <LocaleProvider initialLocale={validLocale}>
      <SkipLink />
      <Header locales={locales} defaultLocale={defaultLocale} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer defaultLocale={defaultLocale} />
    </LocaleProvider>
  );
}
