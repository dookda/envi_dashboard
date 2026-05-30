import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const subscriber = await prisma.subscriber.findUnique({ where: { lineUserId: userId } });
  return NextResponse.json({ subscribed: !!subscriber });
}

export async function POST(request: NextRequest) {
  let body: { userId: string; displayName?: string; pictureUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { userId, displayName, pictureUrl } = body;
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const subscriber = await prisma.subscriber.upsert({
    where: { lineUserId: userId },
    update: { displayName, pictureUrl },
    create: { lineUserId: userId, displayName, pictureUrl },
  });

  return NextResponse.json({ subscribed: true, id: subscriber.id });
}

export async function DELETE(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  await prisma.subscriber.deleteMany({ where: { lineUserId: userId } });
  return NextResponse.json({ subscribed: false });
}
