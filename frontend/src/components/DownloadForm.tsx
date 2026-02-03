'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface DownloadFormProps {
  onResult: (result: {
    success: boolean;
    title?: string;
    author?: string;
    cover?: string;
    links: {
      mp4HdWatermark?: string;
      mp4HdNoWatermark?: string;
      mp3?: string;
    };
    error?: string;
    _submittedUrl?: string;
  }) => void;
  retryUrl?: string | null;
  onRetryUrlConsumed?: () => void;
}

function isValidTikTokUrl(value: string): boolean {
  const trimmed = value.trim();
  return /(?:tiktok\.com|vm\.tiktok|vt\.tiktok)/i.test(trimmed) && trimmed.length > 10;
}

export function DownloadForm({ onResult, retryUrl, onRetryUrlConsumed }: DownloadFormProps) {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (retryUrl && retryUrl.trim()) {
      setUrl(retryUrl.trim());
      setError('');
      onRetryUrlConsumed?.();
      inputRef.current?.focus();
    }
  }, [retryUrl, onRetryUrlConsumed]);

  const urlValid = url.trim() ? isValidTikTokUrl(url) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = url.trim();
    if (!trimmed) {
      setError(t('home.errorInvalid'));
      return;
    }
    if (!isValidTikTokUrl(trimmed)) {
      setError(t('home.errorInvalid'));
      return;
    }
    setLoading(true);
    const apiBase = API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const downloadUrl = `${apiBase}/api/download`;
    try {
      const res = await fetch(downloadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        onResult({
          success: false,
          links: {},
          error: data.error || 'Request failed. Please try again.',
          _submittedUrl: trimmed,
        });
        return;
      }
      onResult({ ...data, _submittedUrl: trimmed });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (typeof window !== 'undefined') {
        console.error('[CosmoVid] Download API request failed:', message, { url: downloadUrl });
      }
      onResult({
        success: false,
        links: {},
        error: 'Network error. Please check your connection and try again.',
        _submittedUrl: trimmed,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="tiktok-url" className="sr-only">
          {t('home.placeholder')}
        </label>
        <div className="flex-1 min-w-0 relative">
          <input
            ref={inputRef}
            id="tiktok-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('home.placeholder')}
            disabled={loading}
            className="w-full min-h-[44px] px-4 py-3 md:py-3.5 pr-10 rounded-lg border border-stone/30 dark:border-stone/50 bg-white dark:bg-stone/20 text-charcoal dark:text-cream text-base placeholder-stone/60 focus:border-gold focus:ring-1 focus:ring-gold transition-colors disabled:opacity-60 touch-manipulation"
            aria-invalid={!!error}
            aria-describedby={error ? 'url-error' : undefined}
          />
          {url.trim().length > 0 && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-lg"
              aria-hidden
              title={urlValid ? t('home.urlValid') : t('home.urlInvalid')}
            >
              {urlValid === true ? (
                <span className="text-green-600 dark:text-green-400" aria-label={t('home.urlValid')}>✓</span>
              ) : urlValid === false ? (
                <span className="text-red-500" aria-label={t('home.urlInvalid')}>✗</span>
              ) : null}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] px-6 py-3 md:py-3.5 rounded-lg bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-medium hover:bg-charcoal/90 dark:hover:bg-cream/90 focus:ring-2 focus:ring-gold focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0 touch-manipulation active:opacity-90"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-cream/40 border-t-cream dark:border-charcoal/40 dark:border-t-charcoal rounded-full animate-spin" />
              {t('home.loading')}
            </span>
          ) : (
            t('home.submit')
          )}
        </button>
      </div>
      {error && (
        <p id="url-error" className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
