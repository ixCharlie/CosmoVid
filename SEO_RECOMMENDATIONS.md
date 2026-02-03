# SEO recommendations for CosmoVid

This doc summarizes what’s already in place and what you can do next to get more clicks and traffic.

---

## What’s already done

- **Root layout metadata**: Default title, description, keywords, Open Graph, Twitter card, favicon.
- **Per-page meta**: Each page (home, FAQ, about, shrink) has locale-specific `metaTitle` and `metaDescription` in all 9 languages, tuned for keywords and benefits.
- **hreflang**: All locale pages declare alternates so search engines know which language version to show.
- **Sitemap**: `/sitemap.xml` includes all locale routes with sensible priorities (home = 1, others = 0.8).
- **robots.txt**: Allows crawling, disallows `/api/`, points to sitemap.
- **JSON-LD**: WebSite and Organization schema in the root layout for rich results.

---

## Get more clicks (titles & descriptions)

1. **Keep titles under ~60 characters** (including “ | CosmoVid”) so they don’t get cut off in search.
2. **Front-load main keywords** (e.g. “TikTok downloader”, “video compressor”) in the first few words.
3. **Use benefit words**: “free”, “no watermark”, “one click”, “no sign-up”, “HD”.
4. **A/B test**: Change one meta title/description per locale, wait 2–4 weeks, compare impressions/clicks in Search Console.
5. **Match intent**: For “download tiktok” queries, lead with “Download TikTok” or “TikTok Downloader”; for “compress video”, lead with “Video compressor” or “Shrink MP4”.

---

## Content & on-page SEO

1. **Add a short “How to download TikTok without watermark” section** (or similar) with clear H2/H3 and steps. Reuse your existing steps; the structure helps SEO.
2. **FAQ schema**: Add `FAQPage` JSON-LD on the FAQ page so FAQs can show as rich results in search.
3. **One strong H1 per page** with the main keyword; you already do this with the page titles.
4. **Internal links**: Link from home to FAQ, about, and shrink with descriptive anchor text (e.g. “How to download TikTok”, “Compress video”).
5. **Blog or “Tips” page (optional)**: Articles like “How to save TikTok videos without the app” can rank for long-tail keywords and send traffic to the downloader.

---

## Technical & performance

1. **Core Web Vitals**: Keep LCP, FID/INP, CLS good (Next.js + optimised images help). Check in Search Console and PageSpeed Insights.
2. **Mobile-first**: Your site is responsive; keep forms and buttons easy to use on small screens.
3. **Canonical URLs**: Already set via `seo.ts` and layout; ensure `NEXT_PUBLIC_SITE_URL` is `https://cosmovid.com` in production.
4. **HTTPS**: Keep SSL active (you already use it).
5. **404 and error pages**: Custom 404 with link back to home and maybe to shrink/FAQ improves UX and keeps link equity on-site.

---

## Off-site & growth

1. **Google Search Console**: Add the property for `https://cosmovid.com`, verify, and submit sitemap. Use it to see queries, impressions, clicks, and indexing issues.
2. **Bing Webmaster Tools**: Add the site and sitemap for Bing/Yahoo traffic.
3. **Backlinks**: Get listed on “free TikTok downloader” or “video tools” lists, directories, or resource pages. Quality matters more than quantity.
4. **Social**: When you share links, OG/Twitter metadata (already set) will show the right title, description, and image.
5. **Local / language**: For each language version, consider a few links from sites in that language (e.g. Spanish tools roundups for the Spanish version).

---

## Quick wins checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL=https://cosmovid.com` in production and use it in metadata/OG.
- [ ] Add FAQPage JSON-LD on the FAQ page.
- [ ] Submit and monitor sitemap in Google Search Console and Bing.
- [ ] Add 2–3 internal links from homepage to FAQ and shrink with keyword-rich anchors.
- [ ] Once per month: review Search Console for new keyword ideas and titles that get high CTR; refine meta titles/descriptions by locale.

---

## Optional: per-page OG images

Right now the root layout sets one default OG image (e.g. `/NEW.png`) for all pages. If you want different images per section (e.g. a “TikTok downloader” image for home, “Video compressor” for shrink), you can:

- Add optional `openGraph.images` (and `twitter.images`) in each `[locale]` page’s `generateMetadata` using the same base URL and a path like `/og-home.png`, `/og-shrink.png`, etc.
- Keep fallback to the default image in the root layout.

This can improve click-through when links are shared on social by making the preview more specific to the page.
