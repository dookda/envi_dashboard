'use client';

import { useLiff } from '@/lib/liffContext';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

const LineLogo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#06C755" aria-hidden="true">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.066-.022.136-.033.2-.033.211 0 .39.09.511.252l2.443 3.317V8.108c0-.345.282-.63.63-.63.345 0 .627.285.627.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

export default function LiffGuard({ children }: { children: ReactNode }) {
  const { profile, isReady, error } = useLiff();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a73e8]" />
          <p className="text-sm text-[#5f6368]">Connecting to LINE…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm bg-card rounded-3xl border border-border px-8 py-10 flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-[#e6f4ea] rounded-2xl">
            <LineLogo />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#202124] dark:text-[#e8eaed]">กรุณาเปิดผ่าน LINE</h2>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1">
              แอปนี้ต้องเปิดผ่าน LINE เท่านั้น<br />กรุณาเปิดลิงก์ LIFF จากแชท LINE
            </p>
          </div>
          {error && (
            <p className="text-[11px] text-[#ea4335] font-mono break-all">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
