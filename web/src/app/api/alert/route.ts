import { NextRequest, NextResponse } from 'next/server';
import { sendLineOA, type AlertPayload } from '@/lib/lineNotify';
import { canAlert, markAlerted, cooldownRemainingMs } from '@/lib/alertCooldown';

const CRITICAL_THRESHOLD = 55.4;

export async function POST(request: NextRequest) {
  const token    = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const targetId = process.env.LINE_TARGET_ID;

  if (!token || !targetId) {
    return NextResponse.json(
      { error: 'LINE_CHANNEL_ACCESS_TOKEN or LINE_TARGET_ID is not configured' },
      { status: 503 }
    );
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

  if (pm25 <= CRITICAL_THRESHOLD) {
    return NextResponse.json({ skipped: true, reason: 'Below critical threshold' });
  }

  if (!canAlert(stationId)) {
    const remainingMin = Math.ceil(cooldownRemainingMs(stationId) / 60000);
    return NextResponse.json(
      { skipped: true, reason: `Cooldown active — next alert in ${remainingMin} min` },
      { status: 429 }
    );
  }

  try {
    await sendLineOA(token, targetId, { stationId, stationName, stationCode, pm25, pm10, tsp });
    markAlerted(stationId);
    return NextResponse.json({ sent: true, station: stationName, pm25 });
  } catch (err) {
    console.error('[alert] LINE OA push failed:', err);
    return NextResponse.json({ error: 'Failed to send LINE OA notification' }, { status: 502 });
  }
}
