'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: process.env.NEXT_PUBLIC_LOGIN_URL ?? '/air/login' })}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] text-xs font-medium hover:bg-[#e8eaed] dark:hover:bg-[#3c4043] transition-colors cursor-pointer"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>Sign out</span>
    </button>
  );
}
