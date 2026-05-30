'use client';

import { useEffect, useState } from 'react';
import { BellRing, BellOff, CheckCircle2, Loader2, AlertCircle, Wind } from 'lucide-react';

interface Profile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

type Status = 'initializing' | 'subscribed' | 'unsubscribed' | 'error';

export default function LiffPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<Status>('initializing');
  const [working, setWorking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const liffModule = await import('@line/liff');
        const liff = liffModule.default;

        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const p = await liff.getProfile();
        setProfile(p);

        const res = await fetch(`/air/api/subscribe?userId=${p.userId}`);
        const data = await res.json();
        setStatus(data.subscribed ? 'subscribed' : 'unsubscribed');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to initialize LINE';
        setErrorMsg(msg);
        setStatus('error');
      }
    })();
  }, []);

  async function subscribe() {
    if (!profile) return;
    setWorking(true);
    const res = await fetch('/air/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      }),
    });
    setWorking(false);
    if (res.ok) setStatus('subscribed');
  }

  async function unsubscribe() {
    if (!profile) return;
    setWorking(true);
    const res = await fetch(`/air/api/subscribe?userId=${profile.userId}`, { method: 'DELETE' });
    setWorking(false);
    if (res.ok) setStatus('unsubscribed');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">

        {/* Header */}
        <div className="bg-card rounded-3xl border border-border px-6 py-6 flex flex-col items-center gap-3 text-center">
          <div className="p-3 bg-[#e8f0fe] rounded-2xl">
            <Wind className="h-7 w-7 text-[#1a73e8]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed]">Air Quality Alerts</h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1">
              Get notified when PM2.5 exceeds the safe threshold
            </p>
          </div>
        </div>

        {/* State: initializing */}
        {status === 'initializing' && (
          <div className="bg-card rounded-3xl border border-border px-6 py-8 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#1a73e8]" />
            <p className="text-sm text-[#5f6368]">Connecting to LINE…</p>
          </div>
        )}

        {/* State: error */}
        {status === 'error' && (
          <div className="bg-[#fce8e6] rounded-3xl px-6 py-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-8 w-8 text-[#ea4335]" />
            <p className="text-sm font-medium text-[#c5221f]">Something went wrong</p>
            <p className="text-xs text-[#c5221f]/80">{errorMsg}</p>
          </div>
        )}

        {/* Profile + subscription card */}
        {(status === 'subscribed' || status === 'unsubscribed') && profile && (
          <div className="bg-card rounded-3xl border border-border overflow-hidden">

            {/* Profile row */}
            <div className="px-6 py-4 flex items-center gap-3 border-b border-border">
              {profile.pictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.pictureUrl} alt={profile.displayName} className="h-10 w-10 rounded-full" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-[#06C755] flex items-center justify-center text-white font-bold">
                  {profile.displayName[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#202124] dark:text-[#e8eaed] truncate">{profile.displayName}</p>
                <p className="text-xs text-[#5f6368] truncate">{profile.userId}</p>
              </div>
              {status === 'subscribed' && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e6f4ea] text-[#137333] text-[10px] font-semibold shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              )}
            </div>

            {/* Description */}
            <div className="px-6 py-4 space-y-4">
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                {status === 'subscribed'
                  ? 'You will receive a LINE message when any pollutant reaches the red level (PM2.5 > 37.5 · PM10 > 100 · TSP > 200 µg/m³). Alerts are sent at most once per station every 30 minutes.'
                  : 'Subscribe to receive LINE alerts when any pollutant reaches the red level (PM2.5 > 37.5 · PM10 > 100 · TSP > 200 µg/m³).'}
              </p>

              {status === 'unsubscribed' ? (
                <button
                  onClick={subscribe}
                  disabled={working}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#06C755] hover:bg-[#05b34c] disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
                  Subscribe to Alerts
                </button>
              ) : (
                <button
                  onClick={unsubscribe}
                  disabled={working}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#f1f3f4] hover:bg-[#e8eaed] disabled:opacity-60 text-[#5f6368] text-sm font-medium transition-colors cursor-pointer"
                >
                  {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
                  Unsubscribe
                </button>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
          Envir Service — Environmental Quality Control Terminal
        </p>
      </div>
    </div>
  );
}
