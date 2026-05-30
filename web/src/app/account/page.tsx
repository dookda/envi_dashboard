'use client';

import Link from 'next/link';
import { ArrowLeft, User, Bell, BellOff, ExternalLink } from 'lucide-react';
import { useLiff } from '@/lib/liffContext';

export default function AccountPage() {
  const { profile } = useLiff();

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-2xl mx-auto space-y-5">

      <header className="flex items-center justify-between bg-card px-6 py-4 rounded-3xl border border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] text-xs font-medium hover:bg-[#e8eaed] dark:hover:bg-[#3c4043] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#e8f0fe] text-[#1a73e8] rounded-2xl">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed] tracking-tight">My Account</h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">LINE profile</p>
          </div>
        </div>
      </header>

      {/* Profile card */}
      {profile && (
        <div className="bg-card rounded-3xl border border-border px-6 py-6">
          <div className="flex items-center gap-5">
            {profile.pictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.pictureUrl} alt={profile.displayName} width={72} height={72} className="rounded-full ring-4 ring-[#e8f0fe]" />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-[#06C755] flex items-center justify-center text-white text-2xl font-bold ring-4 ring-[#e8f0fe]">
                {profile.displayName[0]}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed]">{profile.displayName}</h2>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 font-mono">{profile.userId}</p>
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34a853] inline-block" />
                LINE Connected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LINE OA Alerts */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">LINE OA Alerts</h3>
          {process.env.NEXT_PUBLIC_LINE_NOTIFY_CONFIGURED === 'true' ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e6f4ea] text-[#137333] text-[10px] font-semibold">
              <Bell className="h-3 w-3" /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f1f3f4] text-[#5f6368] text-[10px] font-semibold">
              <BellOff className="h-3 w-3" /> Not configured
            </span>
          )}
        </div>
        <div className="px-6 py-4 space-y-3">
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
            Alerts are sent via LINE multicast to subscribed members when PM2.5 exceeds{' '}
            <span className="font-semibold text-[#ea4335]">55.4 µg/m³</span>.
            Throttled to once per station per <span className="font-semibold">30 minutes</span>.
          </p>
          {process.env.NEXT_PUBLIC_LIFF_ID && (
            <a
              href={`https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Manage Subscription in LINE
            </a>
          )}
        </div>
      </div>

    </div>
  );
}
