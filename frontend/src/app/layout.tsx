import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmovid.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 5 },
  title: {
    default: 'TikTok Downloader HD — Save TikTok Videos Without Watermark Free',
    template: '%s | CosmoVid',
  },
  description:
    'Save TikTok videos in HD with one click. No watermark, no app — free TikTok downloader. Paste link, get MP4. Fast, private, works on all devices.',
  keywords: [
    'TikTok downloader',
    'TikTok downloader HD',
    'download TikTok without watermark',
    'save TikTok video',
    'TikTok to MP4',
    'free TikTok downloader',
    'TikTok video download',
    'تحميل تيك توك',
    'تحميل فيديو تيك توك',
    'تيك توك بدون علامة مائية',
    'descargar TikTok',
    'télécharger TikTok',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ar_AR', 'es_ES', 'fr_FR', 'de_DE', 'pt_BR', 'zh_CN', 'hi_IN', 'ru_RU'],
    images: [{ url: '/NEW.png', width: 512, height: 512, alt: 'CosmoVid - TikTok Downloader' }],
    siteName: 'CosmoVid',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TikTok Downloader HD — Save Videos Without Watermark Free',
    description: 'Save TikTok videos in HD with one click. No app, no watermark. Free & fast.',
    images: ['/NEW.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/NEW.png' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Theme script runs only in browser; extensions can reorder/remove scripts — suppress hydration mismatch */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');})();`,
          }}
        />
        {/* Google AdSense - replace with your publisher ID */}
        <script
          suppressHydrationWarning
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
          crossOrigin="anonymous"
        />
        {/* Google Analytics - replace with your GA4 measurement ID */}
        <script
          suppressHydrationWarning
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}');
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-cream text-charcoal dark:bg-charcoal dark:text-cream">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: 'CosmoVid',
                  url: siteUrl,
                  description: 'Free TikTok downloader. Save TikTok videos in HD with or without watermark. No app required.',
                  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/en?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
                },
                {
                  '@type': 'Organization',
                  name: 'CosmoVid',
                  url: siteUrl,
                  logo: `${siteUrl}/NEW.png`,
                },
              ],
            }),
          }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
