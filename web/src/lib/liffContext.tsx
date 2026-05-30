'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

interface LiffContextValue {
  profile: LiffProfile | null;
  isReady: boolean;
  error: string | null;
}

const LiffContext = createContext<LiffContextValue>({ profile: null, isReady: false, error: null });

function resolveLiffId(): string {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  if (path.includes('/admin'))   return process.env.NEXT_PUBLIC_LIFF_ID_ADMIN   ?? '';
  if (path.includes('/account')) return process.env.NEXT_PUBLIC_LIFF_ID_ACCOUNT ?? '';
  return process.env.NEXT_PUBLIC_LIFF_ID_DASHBOARD ?? '';
}

async function autoSubscribe(p: LiffProfile): Promise<void> {
  try {
    const res = await fetch('/air/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: p.userId,
        displayName: p.displayName,
        pictureUrl: p.pictureUrl,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[LIFF] subscribe failed:', res.status, text);
    }
  } catch (err) {
    console.error('[LIFF] subscribe error:', err);
  }
}

export function LiffProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const liffId = resolveLiffId();
        console.log('[LIFF] init with ID:', liffId, '| path:', window.location.pathname);

        if (!liffId) {
          console.error('[LIFF] No LIFF ID configured for this page');
          setError('LIFF ID not configured');
          setIsReady(true);
          return;
        }

        const { default: liff } = await import('@line/liff');
        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const p = await liff.getProfile();
        console.log('[LIFF] profile:', p.userId, p.displayName);
        setProfile(p);

        await autoSubscribe(p);

        setIsReady(true);
      } catch (err) {
        console.error('[LIFF] init error:', err);
        setError(err instanceof Error ? err.message : 'LIFF init failed');
        setIsReady(true);
      }
    })();
  }, []);

  return <LiffContext.Provider value={{ profile, isReady, error }}>{children}</LiffContext.Provider>;
}

export function useLiff() {
  return useContext(LiffContext);
}
