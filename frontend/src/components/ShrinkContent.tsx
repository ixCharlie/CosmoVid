'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { getTranslations } from '@/lib/translations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function ShrinkContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [maxMb, setMaxMb] = useState<number>(100);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/shrink/limit`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.maxMb === 'number') setMaxMb(data.maxMb);
      })
      .catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess(false);
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    const maxBytes = maxMb * 1024 * 1024;
    if (f.size > maxBytes) {
      setError(t('shrink.errorFileTooBig').replace('{{maxMb}}', String(maxMb)));
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError(t('shrink.errorInvalid'));
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('video', file);
      const res = await fetch(`${API_URL}/api/shrink`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t('shrink.errorNetwork'));
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shrunk-${file.name.replace(/\.[^.]+$/, '')}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
      setFile(null);
      const input = document.getElementById('shrink-file') as HTMLInputElement;
      if (input) input.value = '';
    } catch {
      setError(t('shrink.errorNetwork'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="animate-fade-in theme-fade">
      <h1 className="font-display text-3xl md:text-4xl text-charcoal dark:text-cream tracking-tight mb-4">
        {t('shrink.title')}
      </h1>
      <p className="text-stone dark:text-stone/80 text-lg mb-8 leading-relaxed">
        {t('shrink.intro')}
      </p>
      <p className="text-sm text-stone dark:text-stone/70 mb-6">
        {t('shrink.maxSize').replace('{{maxMb}}', String(maxMb))}
      </p>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div>
          <label htmlFor="shrink-file" className="block text-sm font-medium text-charcoal dark:text-cream mb-2">
            {t('shrink.chooseFile')}
          </label>
          <input
            id="shrink-file"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv"
            onChange={handleFileChange}
            disabled={loading}
            className="block w-full text-sm text-stone dark:text-stone/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-charcoal file:text-cream dark:file:bg-cream dark:file:text-charcoal file:font-medium file:cursor-pointer hover:file:opacity-90"
          />
          {file && (
            <p className="mt-2 text-sm text-stone dark:text-stone/70">
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 dark:text-green-400">
            {t('shrink.success')}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !file}
          className="min-h-[48px] px-6 py-3 rounded-lg bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-cream/40 border-t-cream dark:border-charcoal/40 dark:border-t-charcoal rounded-full animate-spin" />
              {t('shrink.loading')}
            </span>
          ) : (
            t('shrink.submit')
          )}
        </button>
      </form>
      <p className="mt-8">
        <Link
          href={`/${locale}/tools`}
          className="text-gold hover:underline"
        >
          {t('shrink.backToTools')}
        </Link>
      </p>
    </article>
  );
}
