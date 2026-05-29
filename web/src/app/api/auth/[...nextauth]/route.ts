import { NextRequest } from 'next/server';
import { handlers } from '@/auth';

const basePath = process.env.APP_BASE_PATH ?? '';

// Next.js strips the basePath before the handler receives the request.
// Auth.js needs the full path for action parsing and OAuth callback URL
// generation. We restore it here using APP_BASE_PATH from .env.
function withBasePath(request: NextRequest): NextRequest {
  if (!basePath) return request;
  const url = new URL(request.url);
  if (!url.pathname.startsWith(basePath)) {
    url.pathname = basePath + url.pathname;
  }
  return new NextRequest(url.toString(), request);
}

export function GET(request: NextRequest) {
  return handlers.GET(withBasePath(request));
}

export function POST(request: NextRequest) {
  return handlers.POST(withBasePath(request));
}
