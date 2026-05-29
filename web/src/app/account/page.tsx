'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Shield, Globe } from 'lucide-react';
import SignOutButton from '@/components/SignOutButton';

export default function AccountPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <header className="flex items-center justify-between bg-card px-6 py-4 rounded-3xl border border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] text-xs font-medium hover:bg-[#e8eaed] dark:hover:bg-[#3c4043] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#e8f0fe] text-[#1a73e8] rounded-2xl">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed] tracking-tight">My Account</h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Manage your profile</p>
          </div>
        </div>
      </header>

      {/* Profile card */}
      <div className="bg-card rounded-3xl border border-border px-6 py-6">
        <div className="flex items-center gap-5">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? 'User'}
              width={72}
              height={72}
              className="rounded-full ring-4 ring-[#e8f0fe]"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-2xl font-bold ring-4 ring-[#e8f0fe]">
              {user?.name?.[0] ?? '?'}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed]">
              {user?.name ?? '—'}
            </h2>
            <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
              {user?.email ?? '—'}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34a853] inline-block"></span>
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">Account Information</h3>
        </div>

        <div className="divide-y divide-border">
          {/* Name row */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="p-2 bg-[#f1f3f4] dark:bg-[#303134] rounded-2xl shrink-0">
              <User className="h-4 w-4 text-[#5f6368] dark:text-[#9aa0a6]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] font-medium">Full Name</p>
              <p className="text-sm font-medium text-[#202124] dark:text-[#e8eaed] truncate mt-0.5">
                {user?.name ?? '—'}
              </p>
            </div>
          </div>

          {/* Email row */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="p-2 bg-[#f1f3f4] dark:bg-[#303134] rounded-2xl shrink-0">
              <Mail className="h-4 w-4 text-[#5f6368] dark:text-[#9aa0a6]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] font-medium">Email Address</p>
              <p className="text-sm font-medium text-[#202124] dark:text-[#e8eaed] truncate mt-0.5">
                {user?.email ?? '—'}
              </p>
            </div>
          </div>

          {/* Role row */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="p-2 bg-[#f1f3f4] dark:bg-[#303134] rounded-2xl shrink-0">
              <Shield className="h-4 w-4 text-[#5f6368] dark:text-[#9aa0a6]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] font-medium">Role</p>
              <p className="text-sm font-medium text-[#202124] dark:text-[#e8eaed] mt-0.5">
                Operator
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected account */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">Connected Account</h3>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#f1f3f4] dark:bg-[#303134] rounded-2xl">
              <Globe className="h-4 w-4 text-[#5f6368] dark:text-[#9aa0a6]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#202124] dark:text-[#e8eaed]">Google</p>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">{user?.email ?? '—'}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#e6f4ea] text-[#137333] text-[10px] font-semibold">
            Connected
          </span>
        </div>
      </div>

      {/* Sign out */}
      <div className="bg-card rounded-3xl border border-border px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#202124] dark:text-[#e8eaed]">Sign out</p>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
              You will be redirected to the login page
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>

    </div>
  );
}
