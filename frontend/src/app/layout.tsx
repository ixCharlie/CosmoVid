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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmovid.example.com'),
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 5 },
  title: {
    default: 'CosmoVid - TikTok Downloader HD | No Watermark',
    template: '%s | CosmoVid',
  },
  description:
    'Download TikTok videos in HD with or without watermark. Free TikTok downloader. MP4 and MP3. No app required. Keywords: TikTok downloader HD, no watermark.',
  keywords: [
    'TikTok downloader',
    'TikTok downloader HD',
    'TikTok no watermark',
    'download TikTok video',
    'TikTok to MP4',
    'TikTok to MP3',
    'تحميل تيك توك',
    'تحميل فيديو تيك توك',
    'تيك توك بدون علامة مائية',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ar_AR'],
  },
  robots: { index: true, follow: true },
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
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
