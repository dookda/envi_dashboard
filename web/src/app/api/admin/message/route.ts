import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const LINE_MULTICAST_API = 'https://api.line.me/v2/bot/message/multicast';

export async function POST(request: NextRequest) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'LINE_CHANNEL_ACCESS_TOKEN is not configured' }, { status: 503 });
  }

  let body: { message: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  const subscribers = await prisma.subscriber.findMany({ select: { lineUserId: true } });
  if (subscribers.length === 0) {
    return NextResponse.json({ skipped: true, reason: 'No subscribers' });
  }

  const res = await fetch(LINE_MULTICAST_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: subscribers.map(s => s.lineUserId),
      messages: [{ type: 'text', text: body.message.trim() }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `LINE error ${res.status}: ${text}` }, { status: 502 });
  }

  return NextResponse.json({ sent: true, recipients: subscribers.length });
}
