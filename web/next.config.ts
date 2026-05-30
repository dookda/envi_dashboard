import type { NextConfig } from "next";

// Single source of truth: all values come from .env, with fallbacks here.
const base = process.env.APP_BASE_PATH ?? '/air';
const host = process.env.APP_HOST ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  basePath: base,
  env: {
    NEXT_PUBLIC_BASE_PATH: base,
    NEXT_PUBLIC_LINE_NOTIFY_CONFIGURED: process.env.LINE_CHANNEL_ACCESS_TOKEN ? 'true' : 'false',
    NEXT_PUBLIC_LIFF_ID_DASHBOARD: process.env.LIFF_ID_DASHBOARD ?? '',
    NEXT_PUBLIC_LIFF_ID_ACCOUNT:   process.env.LIFF_ID_ACCOUNT   ?? '',
    NEXT_PUBLIC_LIFF_ID_ADMIN:     process.env.LIFF_ID_ADMIN     ?? '',
  },
};

export default nextConfig;
