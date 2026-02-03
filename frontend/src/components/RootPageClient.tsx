'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LanguagePicker } from '@/components/LanguagePicker';
import { getStoredLocale, browserLanguageToLocale, setStoredLocale } from '@/lib/locale-preference';

/**
 * Root page: auto-detect language from browser if no stored preference, then redirect.
 * Renders LanguagePicker so user can manually choose if they land here (e.g. no cookie yet).
 */
export function RootPageClient() {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current || typeof window === 'undefined') return;
    hasRun.current = true;

    const stored = getStoredLocale();
    if (stored) {
      router.replace(`/${stored}`);
      return;
    }

    const detected = browserLanguageToLocale(navigator.language || 'en');
    setStoredLocale(detected);
    router.replace(`/${detected}`);
  }, [router]);

  return <LanguagePicker />;
}
