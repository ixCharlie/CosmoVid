import type { Metadata } from 'next';
import { LanguagePicker } from '@/components/LanguagePicker';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmovid.example.com').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'CosmoVid - TikTok Downloader HD | No Watermark | Free Download',
  description: 'Download TikTok videos in HD with or without watermark. Free, fast TikTok downloader. Save as MP4 or MP3. No sign-up required.',
  alternates: {
    canonical: baseUrl,
    languages: {
      'en': `${baseUrl}/en`,
      'ar': `${baseUrl}/ar`,
      'x-default': `${baseUrl}/en`,
    },
  },
};

export default function RootPage() {
  return <LanguagePicker />;
}
