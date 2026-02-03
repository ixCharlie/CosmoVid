import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmovid.example.com').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/shrink', '/faq', '/about'];
  const entries: MetadataRoute.Sitemap = [];

  entries.push({
    url: base,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  });

  for (const locale of locales) {
    for (const route of routes) {
      const path = route ? `/${locale}${route}` : `/${locale}`;
      entries.push({
        url: `${base}${path}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'monthly',
        priority: route === '' ? 1 : 0.8,
      });
    }
  }

  return entries;
}
