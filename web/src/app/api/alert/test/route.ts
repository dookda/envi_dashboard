import { NextRequest, NextResponse } from 'next/server';
import { sendLineMulticast, type AlertPayload } from '@/lib/lineNotify';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'LINE_CHANNEL_ACCESS_TOKEN is not configured' }, { status: 503 });
  }

  let body: AlertPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { stationId, stationName, stationCode, pm25, pm10, tsp, windSpeed, windDirection, temperature } = body;
  if (!stationId || !stationName || pm25 === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const subscribers = await prisma.subscriber.findMany({ select: { lineUserId: true } });
  if (subscribers.length === 0) {
    return NextResponse.json({ skipped: true, reason: 'No subscribers yet' });
  }

  try {
    await sendLineMulticast(token, subscribers.map(s => s.lineUserId), { stationId, stationName, stationCode, pm25, pm10, tsp, windSpeed, windDirection, temperature });
    return NextResponse.json({ sent: true, station: stationName, pm25, recipients: subscribers.length, test: true });
  } catch (err) {
    console.error('[alert/test] LINE multicast failed:', err);
    return NextResponse.json({ error: 'Failed to send LINE notification' }, { status: 502 });
  }
}
