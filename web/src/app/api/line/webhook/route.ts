import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getLineProfile(userId: string, token: string) {
  const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ displayName: string; pictureUrl?: string }>;
}

export async function POST(request: NextRequest) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const body  = await request.json();

  for (const event of body.events ?? []) {
    const userId = event.source?.userId as string | undefined;
    if (!userId) continue;

    if (event.type === 'follow') {
      const profile = token ? await getLineProfile(userId, token) : null;
      await prisma.subscriber.upsert({
        where:  { lineUserId: userId },
        update: { displayName: profile?.displayName, pictureUrl: profile?.pictureUrl },
        create: { lineUserId: userId, displayName: profile?.displayName, pictureUrl: profile?.pictureUrl },
      });
      console.log('[webhook] follow — subscribed:', userId, profile?.displayName);
    }

    if (event.type === 'unfollow') {
      await prisma.subscriber.deleteMany({ where: { lineUserId: userId } });
      console.log('[webhook] unfollow — removed:', userId);
    }
  }

  return NextResponse.json({ ok: true });
}
