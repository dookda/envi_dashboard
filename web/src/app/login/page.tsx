'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, User, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const redirect = process.env.NEXT_PUBLIC_AUTH_REDIRECT ?? '/air/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn('credentials', { email: username, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError('Invalid username or password.');
    } else {
      router.push(redirect);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">

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

          <div className="border-t border-border" />

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="text-center space-y-0.5 mb-4">
              <h2 className="text-sm font-semibold text-[#202124] dark:text-[#e8eaed]">Sign in to continue</h2>
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
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
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
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-[#f8f9fa] dark:bg-[#303134] text-sm text-[#202124] dark:text-[#e8eaed] placeholder:text-[#9aa0a6] focus:outline-none focus:border-[#1a73e8] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-60 rounded-full text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
          <Shield className="h-3 w-3" />
          <span>Authorized personnel only</span>
        </div>
      </div>
    </div>
  );
}
