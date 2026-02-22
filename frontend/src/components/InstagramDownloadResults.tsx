'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';
import { AdSlot } from './AdSlot';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function sanitizeFilename(raw: string | undefined, ext: string): string {
  if (!raw || typeof raw !== 'string') return `instagram.${ext}`;
  const safe = raw
    .replace(/[/\\:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
  if (!safe) return `instagram.${ext}`;
  return `${safe}.${ext}`;
}

function proxyDownloadUrl(mediaUrl: string, filename: string, type: string): string {
  if (typeof btoa !== 'undefined' && mediaUrl) {
    const encoded = btoa(encodeURIComponent(mediaUrl));
    const base = `${API_URL}/api/instagram/proxy?media_url=${encodeURIComponent(encoded)}&filename=${encodeURIComponent(filename)}&type=${type}`;
    return base;
  }
  return mediaUrl || '#';
}

interface Result {
  success: boolean;
  title?: string;
  author?: string;
  cover?: string;
  duration?: number;
  quality?: string;
  _submittedUrl?: string;
  links: {
    video?: string;
    image?: string;
    items?: Array<{ url: string; type: 'video' | 'image'; thumbnail?: string }>;
  };
  error?: string;
}

interface InstagramDownloadResultsProps {
  result: Result;
  onReset: () => void;
  onRetry?: (url: string) => void;
}

export function InstagramDownloadResults({ result, onReset, onRetry }: InstagramDownloadResultsProps) {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);

  const copyLink = useCallback(async (href: string, id: string) => {
    try {
      await navigator.clipboard.writeText(href);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  }, []);

  if (!result.success) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800 p-4 sm:p-6 text-center">
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
            {t('instagram.tryAnother')}
          </button>
        </div>
      </div>
    );
  }

  const { title, author, cover, duration, quality, links } = result;
  const items = links.items;
  const singleVideo = links.video;
  const singleImage = links.image;

  function formatDuration(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
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
      <div className="flex flex-col gap-2">
        {showDownloadMessage && (
          <p className="text-sm text-green-600 dark:text-green-400 font-medium" role="status">
            {t('home.downloadStarting')}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <a
            href={href}
            download={downloadName}
            onClick={() => {
              setShowDownloadMessage(true);
              setTimeout(() => setShowDownloadMessage(false), 3000);
            }}
            className={
              primary
                ? 'inline-flex items-center justify-center min-h-[44px] px-4 py-3 rounded-lg bg-charcoal dark:bg-cream text-cream dark:bg-charcoal font-medium hover:opacity-90 transition-opacity flex-1 min-w-0 touch-manipulation text-sm sm:text-base'
                : 'inline-flex items-center justify-center min-h-[44px] px-4 py-3 rounded-lg border border-charcoal dark:border-cream text-charcoal dark:text-cream font-medium hover:bg-stone/5 transition-colors flex-1 min-w-0 touch-manipulation text-sm sm:text-base'
            }
          >
            {label}
          </a>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); copyLink(href, id); }}
            className="shrink-0 min-h-[44px] min-w-[44px] p-2 rounded-lg border border-stone/30 text-stone hover:bg-stone/10 transition-colors touch-manipulation flex items-center justify-center"
            title={t('common.copyLink')}
            aria-label={isCopied ? t('common.copied') : t('common.copyLink')}
          >
            {isCopied ? (
              <span className="text-green-600 text-sm font-medium">{t('common.copied')}</span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Carousel: multiple items
  if (items && items.length > 0) {
    return (
      <div className="rounded-2xl border border-stone/20 dark:border-stone/40 bg-white dark:bg-stone/5 shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
            {author && <span className="font-medium text-charcoal dark:text-cream">@{author}</span>}
            {quality && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone/15 text-stone-700 dark:text-stone-300 text-xs font-medium">
                {quality}
              </span>
            )}
          </div>
          {title && (
            <p className="font-display text-base sm:text-lg text-charcoal dark:text-cream mb-4 line-clamp-3 leading-snug">
              {title}
            </p>
          )}
          <p className="text-sm text-stone dark:text-stone/80 mb-4">
            {t('instagram.carouselCount').replace('{{count}}', String(items.length))}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item, idx) => {
              const ext = item.type === 'video' ? 'mp4' : 'jpg';
              const filename = sanitizeFilename(title ? `${title}-${idx + 1}` : `instagram-${idx + 1}`, ext);
              const href = proxyDownloadUrl(item.url, filename, ext);
              return (
                <div key={idx} className="rounded-xl overflow-hidden bg-black aspect-square">
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  ) : (
                    <Image
                      src={item.url}
                      alt=""
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  )}
                  <div className="p-2 bg-stone/10 flex flex-col gap-1">
                    <a
                      href={href}
                      download={filename}
                      onClick={() => {
                        setShowDownloadMessage(true);
                        setTimeout(() => setShowDownloadMessage(false), 3000);
                      }}
                      className="inline-flex items-center justify-center min-h-[36px] px-3 py-2 rounded-lg bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-medium text-xs hover:opacity-90 transition-opacity"
                    >
                      {item.type === 'video' ? t('instagram.downloadVideo') : t('instagram.downloadPhoto')}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onReset}
            className="mt-4 min-h-[44px] inline-flex items-center justify-center text-sm text-gold hover:underline touch-manipulation -ml-2 pl-2 self-start"
          >
            {t('instagram.tryAnother')}
          </button>
        </div>
        <div className="border-t border-stone/20 dark:border-stone/40 p-3 sm:p-4 bg-stone/5">
          <AdSlot id="result-ad" label={t('common.adLabel')} />
        </div>
      </div>
    );
  }

  // Single video or image
  const mediaUrl = singleVideo || singleImage;
  const isVideo = !!singleVideo;
  const ext = isVideo ? 'mp4' : 'jpg';
  const downloadFilename = sanitizeFilename(title, ext);
  const href = proxyDownloadUrl(mediaUrl!, downloadFilename, ext);

  return (
    <div className="rounded-2xl border border-stone/20 dark:border-stone/40 bg-white dark:bg-stone/5 shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
          {(mediaUrl || cover) && (
            <div className="relative w-full sm:w-56 flex-shrink-0 rounded-xl overflow-hidden bg-black aspect-[9/16] sm:aspect-video max-h-[320px] sm:max-h-[380px] shadow-inner ring-1 ring-stone/10">
              {isVideo ? (
                <video
                  src={mediaUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                  poster={cover}
                  preload="metadata"
                  aria-label={title || t('instagram.downloadVideo')}
                />
              ) : (
                <Image
                  src={mediaUrl!}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 224px"
                  unoptimized
                />
              )}
              {duration != null && duration > 0 && isVideo && (
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-xs font-medium tabular-nums">
                  {formatDuration(duration)}
                </span>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
              {author && <span className="font-medium text-charcoal dark:text-cream">@{author}</span>}
              {quality && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone/15 text-stone-700 dark:text-stone-300 text-xs font-medium">
                  {quality}
                </span>
              )}
            </div>
            {title && (
              <p className="font-display text-base sm:text-lg text-charcoal dark:text-cream mb-4 line-clamp-3 leading-snug">
                {title}
              </p>
            )}
            <div className="flex flex-col gap-3 mt-auto">
              {mediaUrl && (
                <DownloadButton
                  href={href}
                  label={isVideo ? t('instagram.downloadVideo') : t('instagram.downloadPhoto')}
                  id="media"
                  primary
                  downloadName={downloadFilename}
                />
              )}
            </div>
            <button
              type="button"
              onClick={onReset}
              className="mt-4 min-h-[44px] inline-flex items-center justify-center text-sm text-gold hover:underline touch-manipulation -ml-2 pl-2 self-start"
            >
              {t('instagram.tryAnother')}
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-stone/20 dark:border-stone/40 p-3 sm:p-4 bg-stone/5">
        <AdSlot id="result-ad" label={t('common.adLabel')} />
      </div>
    </div>
  );
}
