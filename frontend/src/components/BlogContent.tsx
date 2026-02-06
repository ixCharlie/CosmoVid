'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';
import { blogPosts } from '@/lib/blog-posts';

export function BlogContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="page-content page-section theme-fade min-h-0 w-full max-w-3xl mx-auto">
      <section className="text-center mb-8 sm:mb-10 md:mb-12">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-charcoal dark:text-cream tracking-tight mb-2 sm:mb-3 px-2">
          {t('blog.title')}
        </h1>
        <p className="text-stone dark:text-stone/80 text-base sm:text-lg max-w-xl mx-auto leading-snug px-1">
          {t('blog.intro')}
        </p>
      </section>

      <section className="space-y-6 sm:space-y-8" aria-label={t('blog.title')}>
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="rounded-xl border border-stone/20 dark:border-stone/40 bg-white dark:bg-stone/10 p-5 sm:p-6 hover:border-gold dark:hover:border-gold transition-colors touch-manipulation"
          >
            <time
              dateTime={post.date}
              className="text-stone dark:text-stone/60 text-sm block mb-2"
            >
              {new Date(post.date).toLocaleDateString(locale === 'en' ? 'en-US' : locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <h2 className="font-display text-xl sm:text-2xl text-charcoal dark:text-cream tracking-tight mb-2">
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="hover:text-gold dark:hover:text-gold transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            <p className="text-stone dark:text-stone/80 text-base leading-snug line-clamp-2">
              {post.excerpt}
            </p>
            <p className="mt-4">
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="text-gold font-medium text-sm hover:underline inline-flex items-center gap-1"
              >
                {t('blog.readMore')}
                <span aria-hidden>→</span>
              </Link>
            </p>
          </article>
        ))}
      </section>

      <p className="mt-8 sm:mt-10">
        <Link href={`/${locale}`} className="text-gold hover:underline font-medium text-sm min-h-[44px] inline-flex items-center touch-manipulation">
          ← {t('common.backToHome')}
        </Link>
      </p>
    </div>
  );
}
