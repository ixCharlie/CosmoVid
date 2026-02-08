'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';
import { AdSlot } from './AdSlot';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/** Sanitize video title for use as download filename; fallback to generic name. */
function sanitizeFilenameForUrl(title: string | undefined, ext: 'mp4' | 'mp3'): string {
  if (!title || typeof title !== 'string') return ext === 'mp3' ? 'tiktok-audio.mp3' : 'tiktok-video.mp4';
  const safe = title
    .replace(/[/\\:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
  if (!safe) return ext === 'mp3' ? 'tiktok-audio.mp3' : 'tiktok-video.mp4';
  return `${safe}.${ext}`;
}

/** Use TikTok page URL so backend streams via yt-dlp. Fallback: direct media URL if no page URL. */
function proxyDownloadUrl(
  tiktokPageUrl: string | undefined,
  variant: 'no_watermark' | 'watermark',
  directMediaUrl?: string,
  filename?: string
): string {
  const base = (params: string) =>
    `${API_URL}/api/download/proxy?${params}${filename ? `&filename=${encodeURIComponent(filename)}` : ''}`;
  if (tiktokPageUrl && typeof btoa !== 'undefined') {
    const encoded = btoa(encodeURIComponent(tiktokPageUrl));
    return base(`tiktok_url=${encodeURIComponent(encoded)}&variant=${variant}&type=mp4`);
  }
  if (directMediaUrl && typeof btoa !== 'undefined') {
    const encoded = btoa(encodeURIComponent(directMediaUrl));
    return base(`media=${encodeURIComponent(encoded)}&type=mp4`);
  }
  return '#';
}

interface Result {
  success: boolean;
  title?: string;
  author?: string;
  cover?: string;
  duration?: number;
  quality?: string;
  fps?: number;
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
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);

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
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 sm:p-6 text-center">
        <p className="text-red-700 font-medium text-sm sm:text-base">{result.error}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {result._submittedUrl && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(result._submittedUrl!)}
              className="min-h-[44px] min-w-[44px] text-sm px-4 py-2.5 rounded-lg bg-charcoal text-cream font-medium hover:opacity-90 transition-opacity touch-manipulation"
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

  const { title, author, cover, duration, quality, fps, links } = result;
  const videoUrl = links.mp4HdNoWatermark || links.mp4HdWatermark;
  const showDownloadMsg = () => {
    setShowDownloadMessage(true);
    setTimeout(() => setShowDownloadMessage(false), 3000);
  };
  const videoVariant = links.mp4HdNoWatermark ? 'no_watermark' : 'watermark';
  const hasAnyLink = !!videoUrl;

  /** Format duration in seconds as M:SS */
  function formatDuration(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  /** Filename for download (used in Content-Disposition via proxy and as fallback for download attribute). */
  const downloadFilenameVideo = sanitizeFilenameForUrl(title, 'mp4');

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
          <p className="text-sm text-green-600 font-medium" role="status">
            {t('home.downloadStarting')}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <a
          href={href}
          download={downloadName}
          onClick={showDownloadMsg}
          className={
            primary
              ? 'inline-flex items-center justify-center min-h-[44px] px-4 py-3 rounded-lg bg-charcoal text-cream font-medium hover:opacity-90 transition-opacity flex-1 min-w-0 touch-manipulation text-sm sm:text-base'
              : 'inline-flex items-center justify-center min-h-[44px] px-4 py-3 rounded-lg border border-charcoal text-charcoal font-medium hover:bg-stone/5 transition-colors flex-1 min-w-0 touch-manipulation text-sm sm:text-base'
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

  return (
    <div className="rounded-2xl border border-stone/20 bg-white shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
          {/* Video preview / cover with duration overlay */}
          {(videoUrl || cover) && (
            <div className="relative w-full sm:w-56 flex-shrink-0 rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[320px] sm:max-h-[380px] shadow-inner ring-1 ring-stone/10">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                  poster={cover}
                  preload="metadata"
                  aria-label={title || t('home.downloadVideo')}
                />
              ) : cover ? (
                <Image
                  src={cover}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 224px"
                  unoptimized
                />
              ) : null}
              {duration != null && duration > 0 && (
                <span
                  className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-xs font-medium tabular-nums"
                  aria-label={t('home.duration')}
                >
                  {formatDuration(duration)}
                </span>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Username + meta row (quality, fps, duration) */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
              {author && (
                <span className="font-medium text-charcoal">
                  @{author}
                </span>
              )}
              {(quality || fps != null) && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone/15 text-stone-700 text-xs font-medium">
                  {quality && <span>{quality}</span>}
                  {quality && fps != null && <span aria-hidden>·</span>}
                  {fps != null && <span>{t('home.fps')}: {fps}</span>}
                </span>
              )}
              {duration != null && duration > 0 && !cover && !videoUrl && (
                <span className="text-sm text-stone-600 tabular-nums">
                  {formatDuration(duration)}
                </span>
              )}
            </div>
            {title && (
              <p className="font-display text-base sm:text-lg text-charcoal mb-4 line-clamp-3 leading-snug">
                {title}
              </p>
            )}
            <div className="flex flex-col gap-3 mt-auto">
              {videoUrl && (
                <DownloadButton
                  href={proxyDownloadUrl(result._submittedUrl, videoVariant, videoUrl, downloadFilenameVideo)}
                  label={t('home.downloadVideo')}
                  id="mp4-video"
                  primary
                  downloadName={downloadFilenameVideo}
                />
              )}
            </div>
            {!hasAnyLink && (
              <p className="text-sm text-stone mt-2">No download links available for this video.</p>
            )}
            <button
              type="button"
              onClick={onReset}
              className="mt-4 min-h-[44px] inline-flex items-center justify-center text-sm text-gold hover:underline touch-manipulation -ml-2 pl-2 self-start"
            >
              {t('home.tryAnother')}
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-stone/20 p-3 sm:p-4 bg-stone/5">
        <AdSlot id="result-ad" label={t('common.adLabel')} />
      </div>
    </div>
  );
}
