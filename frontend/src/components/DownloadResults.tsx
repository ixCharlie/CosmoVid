'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';
import { AdSlot } from './AdSlot';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/** Prefer TikTok page URL so backend fetches a fresh CDN link (avoids expired links). Fallback: direct media URL. */
function proxyDownloadUrl(
  tiktokPageUrl: string | undefined,
  variant: 'no_watermark' | 'watermark' | 'mp3',
  directMediaUrl?: string
): string {
  if (tiktokPageUrl && typeof btoa !== 'undefined') {
    const encoded = btoa(encodeURIComponent(tiktokPageUrl));
    const type = variant === 'mp3' ? 'mp3' : 'mp4';
    return `${API_URL}/api/download/proxy?tiktok_url=${encodeURIComponent(encoded)}&variant=${variant}&type=${type}`;
  }
  if (directMediaUrl && typeof btoa !== 'undefined') {
    const encoded = btoa(encodeURIComponent(directMediaUrl));
    const type = variant === 'mp3' ? 'mp3' : 'mp4';
    return `${API_URL}/api/download/proxy?media=${encodeURIComponent(encoded)}&type=${type}`;
  }
  return '#';
}

interface Result {
  success: boolean;
  title?: string;
  author?: string;
  cover?: string;
  _submittedUrl?: string;
  links: {
    mp4HdWatermark?: string;
    mp4HdNoWatermark?: string;
    mp3?: string;
  };
  error?: string;
}

interface DownloadResultsProps {
  result: Result;
  onReset: () => void;
  onRetry?: (url: string) => void;
}

export function DownloadResults({ result, onReset, onRetry }: DownloadResultsProps) {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = useCallback(async (href: string, id: string) => {
    try {
      await navigator.clipboard.writeText(href);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback: open in new tab or ignore
    }
  }, []);

  if (!result.success) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 p-6 text-center">
        <p className="text-red-700 dark:text-red-300 font-medium">{result.error}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {result._submittedUrl && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(result._submittedUrl!)}
              className="text-sm px-4 py-2 rounded-lg bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-medium hover:opacity-90 transition-opacity"
            >
              {t('common.retry')}
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-gold hover:underline"
          >
            {t('home.tryAnother')}
          </button>
        </div>
      </div>
    );
  }

  const { title, author, cover, links } = result;
  const videoUrl = links.mp4HdNoWatermark || links.mp4HdWatermark;
  const videoVariant = links.mp4HdNoWatermark ? 'no_watermark' : 'watermark';
  const hasAnyLink = videoUrl || links.mp3;

  function DownloadButton({
    href,
    label,
    id,
    primary,
  }: { href: string; label: string; id: string; primary?: boolean }) {
    const isCopied = copiedId === id;
    return (
      <div className="flex items-center gap-2">
        <a
          href={href}
          download={id.includes('mp3') ? 'tiktok-audio.mp3' : 'tiktok-video.mp4'}
          className={
            primary
              ? 'inline-flex items-center justify-center px-4 py-3 rounded-lg bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-medium hover:opacity-90 transition-opacity flex-1 min-w-0'
              : 'inline-flex items-center justify-center px-4 py-3 rounded-lg border border-charcoal dark:border-stone/40 text-charcoal dark:text-cream font-medium hover:bg-stone/5 dark:hover:bg-stone/20 transition-colors flex-1 min-w-0'
          }
        >
          {label}
        </a>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); copyLink(href, id); }}
          className="shrink-0 p-2 rounded-lg border border-stone/30 dark:border-stone/50 text-stone dark:text-stone/80 hover:bg-stone/10 dark:hover:bg-stone/20 transition-colors"
          title={t('common.copyLink')}
          aria-label={isCopied ? t('common.copied') : t('common.copyLink')}
        >
          {isCopied ? (
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">{t('common.copied')}</span>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone/20 dark:border-stone/40 bg-white dark:bg-stone/10 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {cover && (
            <div className="relative w-full sm:w-48 h-64 sm:h-64 rounded-lg overflow-hidden bg-stone/10 shrink-0">
              <Image
                src={cover}
                alt=""
                fill
                className="object-cover"
                sizes="192px"
                unoptimized
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {author && (
              <p className="text-sm text-stone dark:text-stone/80 mb-1">@{author}</p>
            )}
            {title && (
              <p className="font-display text-lg text-charcoal dark:text-cream mb-4 line-clamp-2">{title}</p>
            )}
            <div className="flex flex-col gap-3">
              {videoUrl && (
                <DownloadButton
                  href={proxyDownloadUrl(result._submittedUrl, videoVariant, videoUrl)}
                  label={t('home.downloadVideo')}
                  id="mp4-video"
                  primary
                />
              )}
              {links.mp3 && (
                <DownloadButton
                  href={proxyDownloadUrl(result._submittedUrl, 'mp3', links.mp3)}
                  label={t('home.downloadMp3')}
                  id="mp3"
                />
              )}
            </div>
            {!hasAnyLink && (
              <p className="text-sm text-stone dark:text-stone/80 mt-2">No download links available for this video.</p>
            )}
            <button
              type="button"
              onClick={onReset}
              className="mt-4 text-sm text-gold hover:underline"
            >
              {t('home.tryAnother')}
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-stone/20 dark:border-stone/40 p-4 bg-stone/5 dark:bg-stone/10">
        <AdSlot id="result-ad" label={t('common.adLabel')} />
      </div>
    </div>
  );
}
