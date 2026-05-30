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

export function LiffProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const liffId = resolveLiffId();
        if (!liffId) {
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
        setProfile(p);

        // Auto-save userId to subscriber list
        await fetch('/air/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: p.userId,
            displayName: p.displayName,
            pictureUrl: p.pictureUrl,
          }),
        }).catch(() => {});

        setIsReady(true);
      } catch (err) {
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
