import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Locale } from '@/lib/i18n';
import { isLocale } from '@/lib/i18n';
import { getPostBySlug, getAllSlugs } from '@/lib/blog-posts';
import { baseUrl } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  const locales = ['en', 'ar', 'es', 'fr', 'de', 'pt', 'zh', 'hi', 'ru'] as const;
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const validLocale: Locale = isLocale(locale) ? locale : 'en';
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post | CosmoVid' };
  const canonical = `${baseUrl()}/${validLocale}/blog/${slug}`;
  return {
    title: `${post.title} | CosmoVid Blog`,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonical,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const validLocale: Locale = isLocale(locale) ? locale : 'en';
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 theme-fade min-h-0">
      <p className="mb-6">
        <Link
          href={`/${validLocale}/blog`}
          className="text-gold hover:underline font-medium text-sm"
        >
          ← Back to Blog
        </Link>
      </p>
      <header className="mb-8">
        <time
          dateTime={post.date}
          className="text-stone dark:text-stone/60 text-sm block mb-2"
        >
          {new Date(post.date).toLocaleDateString(validLocale === 'en' ? 'en-US' : validLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-charcoal dark:text-cream tracking-tight">
          {post.title}
        </h1>
        <p className="text-stone dark:text-stone/80 mt-3 text-lg leading-snug">
          {post.excerpt}
        </p>
      </header>
      <div className="prose prose-stone dark:prose-invert max-w-none">
        {post.content.map((paragraph, i) => (
          <p key={i} className="text-stone dark:text-stone/80 leading-relaxed mb-4">
            {paragraph}
          </p>
        ))}
      </div>
      <p className="mt-10">
        <Link href={`/${validLocale}/blog`} className="text-gold hover:underline font-medium text-sm">
          ← Back to Blog
        </Link>
      </p>
    </article>
  );
}
