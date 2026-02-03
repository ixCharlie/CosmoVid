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
  variant: 'no_watermark' | 'watermark',
  directMediaUrl?: string
): string {
  if (tiktokPageUrl && typeof btoa !== 'undefined') {
    const encoded = btoa(encodeURIComponent(tiktokPageUrl));
    return `${API_URL}/api/download/proxy?tiktok_url=${encodeURIComponent(encoded)}&variant=${variant}&type=mp4`;
  }
  if (directMediaUrl && typeof btoa !== 'undefined') {
    const encoded = btoa(encodeURIComponent(directMediaUrl));
    return `${API_URL}/api/download/proxy?media=${encodeURIComponent(encoded)}&type=mp4`;
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
      <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 p-4 sm:p-6 text-center">
        <p className="text-red-700 dark:text-red-300 font-medium text-sm sm:text-base">{result.error}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {result._submittedUrl && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(result._submittedUrl!)}
              className="min-h-[44px] min-w-[44px] text-sm px-4 py-2.5 rounded-lg bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-medium hover:opacity-90 transition-opacity touch-manipulation"
            >
              {t('common.retry')}
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-sm text-gold hover:underline touch-manipulation px-2"
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
  const hasAnyLink = !!videoUrl;

  /** Sanitize video title for use as download filename; fallback to generic name. */
  function downloadFilename(): string {
    if (!title || typeof title !== 'string') return 'tiktok-video.mp4';
    const safe = title
      .replace(/[/\\:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);
    if (!safe) return 'tiktok-video.mp4';
    return `${safe}.mp4`;
  }

  function DownloadButton({
    href,
    label,
    id,
    primary,
    downloadName,
  }: { href: string; label: string; id: string; primary?: boolean; downloadName: string }) {
    const isCopied = copiedId === id;
    return (
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <a
          href={href}
          download={downloadName}
          className={
            primary
              ? 'inline-flex items-center justify-center min-h-[44px] px-4 py-3 rounded-lg bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-medium hover:opacity-90 transition-opacity flex-1 min-w-0 touch-manipulation text-sm sm:text-base'
              : 'inline-flex items-center justify-center min-h-[44px] px-4 py-3 rounded-lg border border-charcoal dark:border-stone/40 text-charcoal dark:text-cream font-medium hover:bg-stone/5 dark:hover:bg-stone/20 transition-colors flex-1 min-w-0 touch-manipulation text-sm sm:text-base'
          }
        >
          {label}
        </a>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); copyLink(href, id); }}
          className="shrink-0 min-h-[44px] min-w-[44px] p-2 rounded-lg border border-stone/30 dark:border-stone/50 text-stone dark:text-stone/80 hover:bg-stone/10 dark:hover:bg-stone/20 transition-colors touch-manipulation flex items-center justify-center"
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
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {cover && (
            <div className="relative w-full sm:w-48 h-48 sm:h-64 rounded-lg overflow-hidden bg-stone/10 shrink-0">
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
              <p className="font-display text-base sm:text-lg text-charcoal dark:text-cream mb-3 sm:mb-4 line-clamp-2">{title}</p>
            )}
            <div className="flex flex-col gap-3">
              {videoUrl && (
                <DownloadButton
                  href={proxyDownloadUrl(result._submittedUrl, videoVariant, videoUrl)}
                  label={t('home.downloadVideo')}
                  id="mp4-video"
                  primary
                  downloadName={downloadFilename()}
                />
              )}
            </div>
            {!hasAnyLink && (
              <p className="text-sm text-stone dark:text-stone/80 mt-2">No download links available for this video.</p>
            )}
            <button
              type="button"
              onClick={onReset}
              className="mt-4 min-h-[44px] inline-flex items-center justify-center text-sm text-gold hover:underline touch-manipulation -ml-2 pl-2"
            >
              {t('home.tryAnother')}
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-stone/20 dark:border-stone/40 p-3 sm:p-4 bg-stone/5 dark:bg-stone/10">
        <AdSlot id="result-ad" label={t('common.adLabel')} />
      </div>
    </div>
  );
}
