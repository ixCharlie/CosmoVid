import type { MetadataRoute } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmovid.example.com').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/faq', '/about'];
  const locales = ['en', 'ar'] as const;

  const entries: MetadataRoute.Sitemap = [];

  // Root: language picker (separate from locale-specific URLs)
  entries.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  });

  // Locale-specific URLs: /en, /ar, /en/faq, /ar/about, etc.
  for (const locale of locales) {
    for (const route of routes) {
      const path = route ? `/${locale}${route}` : `/${locale}`;
      entries.push({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'monthly',
        priority: route === '' ? 1 : 0.8,
      });
    }
  }

  return entries;
}
