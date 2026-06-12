import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULTS = {
  'alert.enabled':  'true',
  'alert.pm25':     '37.4',
  'alert.pm10':     '99',
  'alert.tsp':      '199',
  'alert.cooldown': '30',
};

async function getConfig() {
  const rows = await prisma.config.findMany();
  const map: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) map[row.key] = row.value;
  return {
    alertEnabled:    map['alert.enabled'] === 'true',
    pm25Threshold:   parseFloat(map['alert.pm25']),
    pm10Threshold:   parseFloat(map['alert.pm10']),
    tspThreshold:    parseFloat(map['alert.tsp']),
    cooldownMinutes: parseInt(map['alert.cooldown'], 10),
  };
}

export async function GET() {
  try {
    return NextResponse.json(await getConfig());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  let body: {
    alertEnabled?: boolean;
    pm25Threshold?: number;
    pm10Threshold?: number;
    tspThreshold?: number;
    cooldownMinutes?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates: { key: string; value: string }[] = [];
  if (body.alertEnabled   !== undefined) updates.push({ key: 'alert.enabled',  value: String(body.alertEnabled) });
  if (body.pm25Threshold  !== undefined) updates.push({ key: 'alert.pm25',     value: String(body.pm25Threshold) });
  if (body.pm10Threshold  !== undefined) updates.push({ key: 'alert.pm10',     value: String(body.pm10Threshold) });
  if (body.tspThreshold   !== undefined) updates.push({ key: 'alert.tsp',      value: String(body.tspThreshold) });
  if (body.cooldownMinutes !== undefined) updates.push({ key: 'alert.cooldown', value: String(body.cooldownMinutes) });

  await Promise.all(
    updates.map(u =>
      prisma.config.upsert({
        where: { key: u.key },
        update: { value: u.value },
        create: { key: u.key, value: u.value },
      })
    )
  );

  return NextResponse.json(await getConfig());
}
