import type { Metadata } from 'next';
import { LanguagePicker } from '@/components/LanguagePicker';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmovid.example.com').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'CosmoVid - Choose language',
  description: 'Choose your language: English or العربية.',
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
