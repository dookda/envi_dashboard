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

export function LiffProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          setError('LIFF_ID not configured');
          setIsReady(true);
          return;
        }
        const { default: liff } = await import('@line/liff');
        await liff.init({ liffId });
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }
        setProfile(await liff.getProfile());
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
