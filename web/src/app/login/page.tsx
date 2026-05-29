'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const redirect = process.env.NEXT_PUBLIC_AUTH_REDIRECT ?? '/air/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'credentials' | 'google' | 'line' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading('credentials');
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(null);
    if (result?.error) {
      setError('Invalid email or password.');
    } else {
      router.push(redirect);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border px-8 py-10 space-y-7">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/logo.png`}
              alt="Envir Service"
              width={72}
              height={72}
              className="rounded-2xl"
            />
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

          {/* Credentials form */}
          <form onSubmit={handleCredentials} className="space-y-3">
            <div className="text-center space-y-0.5 mb-4">
              <h2 className="text-sm font-semibold text-[#202124] dark:text-[#e8eaed]">
                Sign in to continue
              </h2>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                Access real-time environmental telemetry data
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#fce8e6] text-[#c5221f] text-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-[#f8f9fa] dark:bg-[#303134] text-sm text-[#202124] dark:text-[#e8eaed] placeholder:text-[#9aa0a6] focus:outline-none focus:border-[#1a73e8] transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-[#f8f9fa] dark:bg-[#303134] text-sm text-[#202124] dark:text-[#e8eaed] placeholder:text-[#9aa0a6] focus:outline-none focus:border-[#1a73e8] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-60 rounded-full text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {loading === 'credentials' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-[#5f6368]">or continue with</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={() => { setLoading('google'); signIn('google', { callbackUrl: redirect }); }}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white dark:bg-[#303134] border border-[#e8eaed] dark:border-[#3c4043] rounded-full text-[#202124] dark:text-[#e8eaed] text-sm font-medium hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043] disabled:opacity-60 transition-colors shadow-sm cursor-pointer"
            >
              {loading === 'google' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                </svg>
              )}
              Continue with Google
            </button>

            {/* LINE — shown only when credentials are configured */}
            {process.env.NEXT_PUBLIC_LINE_LOGIN_ENABLED === 'true' && (
              <button
                onClick={() => { setLoading('line'); signIn('line', { callbackUrl: redirect }); }}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#06C755] hover:bg-[#05b34c] disabled:opacity-60 rounded-full text-white text-sm font-medium transition-colors shadow-sm cursor-pointer"
              >
                {loading === 'line' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.066-.022.136-.033.2-.033.211 0 .39.09.511.252l2.443 3.317V8.108c0-.345.282-.63.63-.63.345 0 .627.285.627.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                )}
                Continue with LINE
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
          <Shield className="h-3 w-3" />
          <span>Authorized personnel only</span>
        </div>
      </div>
    </div>
  );
}
