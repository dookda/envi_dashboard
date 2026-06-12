import { NextRequest, NextResponse } from 'next/server';
import { sendLineMulticast, type AlertPayload } from '@/lib/lineNotify';
import { canAlert, markAlerted, cooldownRemainingMs, setCooldown } from '@/lib/alertCooldown';
import prisma from '@/lib/prisma';

const DEFAULTS = { enabled: true, pm25: 37.4, pm10: 99, tsp: 199, cooldown: 30 };

async function loadConfig() {
  const rows = await prisma.config.findMany({
    where: { key: { in: ['alert.enabled', 'alert.pm25', 'alert.pm10', 'alert.tsp', 'alert.cooldown'] } },
  });
  const m: Record<string, string> = {};
  for (const r of rows) m[r.key] = r.value;
  return {
    enabled:  (m['alert.enabled']  ?? 'true') === 'true',
    pm25:     parseFloat(m['alert.pm25']     ?? String(DEFAULTS.pm25)),
    pm10:     parseFloat(m['alert.pm10']     ?? String(DEFAULTS.pm10)),
    tsp:      parseFloat(m['alert.tsp']      ?? String(DEFAULTS.tsp)),
    cooldown: parseInt(m['alert.cooldown']   ?? String(DEFAULTS.cooldown), 10),
  };
}

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

  const cfg = await loadConfig();

  if (!cfg.enabled) {
    return NextResponse.json({ skipped: true, reason: 'Alerts disabled' });
  }

  const exceeded = pm25 > cfg.pm25 || pm10 > cfg.pm10 || tsp > cfg.tsp;
  if (!exceeded) {
    return NextResponse.json({ skipped: true, reason: 'All pollutants within configured thresholds' });
  }

  setCooldown(cfg.cooldown);
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
    await sendLineMulticast(token, subscribers.map(s => s.lineUserId), { stationId, stationName, stationCode, pm25, pm10, tsp, windSpeed, windDirection, temperature });
    markAlerted(stationId);
    return NextResponse.json({ sent: true, station: stationName, pm25, recipients: subscribers.length });
  } catch (err) {
    console.error('[alert] LINE multicast failed:', err);
    return NextResponse.json({ error: 'Failed to send LINE notification' }, { status: 502 });
  }
}
