import type { NextConfig } from "next";

// Single source of truth: all values come from .env, with fallbacks here.
const base = process.env.APP_BASE_PATH ?? '/air';
const host = process.env.APP_HOST ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  basePath: base,
  env: {
    // Baked into the client bundle at build time.
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? `${host}${base}/api/auth`,
    NEXT_PUBLIC_AUTH_REDIRECT: process.env.NEXT_PUBLIC_AUTH_REDIRECT ?? `${base}/dashboard`,
    NEXT_PUBLIC_LOGIN_URL: `${base}/login`,
    NEXT_PUBLIC_BASE_PATH: base,
    NEXT_PUBLIC_LINE_NOTIFY_CONFIGURED: process.env.LINE_CHANNEL_ACCESS_TOKEN ? 'true' : 'false',
    NEXT_PUBLIC_LIFF_ID: process.env.LIFF_ID ?? '',
  },
};

export default nextConfig;
