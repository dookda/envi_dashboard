'use client';

import Link from 'next/link';
import { ArrowLeft, User, Bell, BellOff } from 'lucide-react';

export default function AccountPage() {
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
            <h1 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed] tracking-tight">Account</h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">LINE OA Alerts</p>
          </div>
        </div>
      </header>

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
        <div className="px-6 py-4">
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
            Alerts are sent via LINE multicast to subscribed members when any pollutant reaches the red level
            (PM2.5 &gt; 37.5 · PM10 &gt; 100 · TSP &gt; 200 µg/m³).
            Throttled to once per station per <span className="font-semibold">30 minutes</span>.
          </p>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-2">
            Members are subscribed automatically when they add <span className="font-semibold">@231hohun</span> as a friend on LINE.
          </p>
        </div>
      </div>

    </div>
  );
}
