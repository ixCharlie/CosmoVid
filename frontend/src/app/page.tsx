import type { Metadata } from 'next';
import { RootPageClient } from '@/components/RootPageClient';
import { getAlternatesForPage } from '@/lib/seo';

const alternates = getAlternatesForPage('home');

export const metadata: Metadata = {
  title: 'CosmoVid - TikTok Downloader HD | No Watermark | Free Download',
  description:
    'Download TikTok videos in HD with or without watermark. Free, fast TikTok downloader. Save as MP4. No sign-up required.',
  alternates: {
    canonical: alternates.canonical,
    languages: alternates.languages,
  },
};

export default function RootPage() {
  return <RootPageClient />;
}
