'use client';

import { signIn } from 'next-auth/react';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border px-8 py-10 space-y-8">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH}/logo.png`} alt="Envir Service" width={72} height={72} className="rounded-2xl" />
            <div>
              <h1 className="text-xl font-semibold text-[#202124] dark:text-[#e8eaed] tracking-tight">
                Envir Service
              </h1>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1">
                Environmental Quality Control Terminal
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Sign-in section */}
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-sm font-semibold text-[#202124] dark:text-[#e8eaed]">
                Sign in to continue
              </h2>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                Access real-time environmental telemetry data
              </p>
            </div>

            {/* Google sign-in button — client-side signIn for reliable cookie handling */}
            <button
              onClick={() => signIn('google', { callbackUrl: process.env.NEXT_PUBLIC_AUTH_REDIRECT ?? '/air/dashboard' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white dark:bg-[#303134] border border-[#e8eaed] dark:border-[#3c4043] rounded-full text-[#202124] dark:text-[#e8eaed] text-sm font-medium hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043] transition-colors shadow-sm cursor-pointer"
            >
              {/* Google logo */}
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        {/* Footer note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
          <Shield className="h-3 w-3" />
          <span>Authorized personnel only</span>
        </div>
      </div>
    </div>
  );
}
