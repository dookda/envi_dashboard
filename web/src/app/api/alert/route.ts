import { NextRequest, NextResponse } from 'next/server';
import { sendLineMulticast, type AlertPayload } from '@/lib/lineNotify';
import { canAlert, markAlerted, cooldownRemainingMs } from '@/lib/alertCooldown';
import { isUnhealthy } from '@/lib/airQuality';
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

  const { stationId, stationName, stationCode, pm25, pm10, tsp } = body;
  if (!stationId || !stationName || pm25 === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!isUnhealthy(pm25, pm10, tsp)) {
    return NextResponse.json({ skipped: true, reason: 'All pollutants within safe range' });
  }

  if (!canAlert(stationId)) {
    const remainingMin = Math.ceil(cooldownRemainingMs(stationId) / 60000);
    return NextResponse.json(
      { skipped: true, reason: `Cooldown active — next alert in ${remainingMin} min` },
      { status: 429 }
    );
  }

  const subscribers = await prisma.subscriber.findMany({ select: { lineUserId: true } });
  if (subscribers.length === 0) {
    return NextResponse.json({ skipped: true, reason: 'No subscribers' });
  }

  try {
    await sendLineMulticast(token, subscribers.map(s => s.lineUserId), { stationId, stationName, stationCode, pm25, pm10, tsp });
    markAlerted(stationId);
    return NextResponse.json({ sent: true, station: stationName, pm25, recipients: subscribers.length });
  } catch (err) {
    console.error('[alert] LINE multicast failed:', err);
    return NextResponse.json({ error: 'Failed to send LINE notification' }, { status: 502 });
  }
}
