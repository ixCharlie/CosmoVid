'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';
import { AdSlot } from './AdSlot';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function sanitizeFilename(raw: string | undefined, ext: string): string {
  if (!raw || typeof raw !== 'string') return `instagram-story.${ext}`;
  const safe = raw
    .replace(/[/\\:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
  if (!safe) return `instagram-story.${ext}`;
  return `${safe}.${ext}`;
}

function proxyDownloadUrl(mediaUrl: string, filename: string, type: string): string {
  if (typeof btoa !== 'undefined' && mediaUrl) {
    const encoded = btoa(encodeURIComponent(mediaUrl));
    return `${API_URL}/api/instagram/proxy?media_url=${encodeURIComponent(encoded)}&filename=${encodeURIComponent(filename)}&type=${type}`;
  }
  return mediaUrl || '#';
}

interface Result {
  success: boolean;
  title?: string;
  author?: string;
  cover?: string;
  _submittedUrl?: string;
  links: {
    items?: Array<{ url: string; type: 'video' | 'image'; thumbnail?: string }>;
  };
  error?: string;
}

interface InstagramStoriesDownloadResultsProps {
  result: Result;
  onReset: () => void;
  onRetry?: (url: string) => void;
}

export function InstagramStoriesDownloadResults({ result, onReset, onRetry }: InstagramStoriesDownloadResultsProps) {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);

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
            {t('instagramStories.tryAnother')}
          </button>
        </div>
      </div>
    );
  }

  const { author, links } = result;
  const items = links.items || [];

  return (
    <div className="rounded-2xl border border-stone/20 dark:border-stone/40 bg-white dark:bg-stone/5 shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        {author && (
          <p className="font-medium text-charcoal dark:text-cream mb-3">@{author}</p>
        )}
        <p className="text-sm text-stone dark:text-stone/80 mb-4">
          {t('instagramStories.storyCount').replace('{{count}}', String(items.length))}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item, idx) => {
            const ext = item.type === 'video' ? 'mp4' : 'jpg';
            const filename = sanitizeFilename(author ? `${author}-story-${idx + 1}` : `instagram-story-${idx + 1}`, ext);
            const href = proxyDownloadUrl(item.url, filename, ext);
            return (
              <div key={idx} className="rounded-xl overflow-hidden bg-black aspect-[9/16]">
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
                    height={533}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                )}
                <div className="p-2 bg-stone/10">
                  <a
                    href={href}
                    download={filename}
                    onClick={() => {
                      setShowDownloadMessage(true);
                      setTimeout(() => setShowDownloadMessage(false), 3000);
                    }}
                    className="inline-flex items-center justify-center w-full min-h-[36px] px-3 py-2 rounded-lg bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-medium text-xs hover:opacity-90 transition-opacity"
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
          {t('instagramStories.tryAnother')}
        </button>
      </div>
      <div className="border-t border-stone/20 dark:border-stone/40 p-3 sm:p-4 bg-stone/5">
        <AdSlot id="result-ad" label={t('common.adLabel')} />
      </div>
    </div>
  );
}
