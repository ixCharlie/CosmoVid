import { notFound } from 'next/navigation';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SkipLink } from '@/components/SkipLink';
import { locales, isLocale, type Locale } from '@/lib/i18n';

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
  const validLocale: Locale | null = isLocale(locale) ? locale : null;
  if (!validLocale) notFound();

  return (
    <LocaleProvider initialLocale={validLocale}>
      <SkipLink />
      <Header />
      <main id="main-content" className="flex-1 theme-fade pt-6 sm:pt-8">{children}</main>
      <Footer />
    </LocaleProvider>
  );
}
