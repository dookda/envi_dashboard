import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { CODE_MAP } from '@/lib/enviApi';

export const dynamic = 'force-dynamic';

const API_BASE   = 'http://47.236.90.227:57200';
const APP_KEY    = process.env.APP_KEY!;
const APP_SECRET = process.env.APP_SECRET!;

function buildHeaders() {
  const timestamp = Date.now().toString();
  const rand      = crypto.randomBytes(10).toString('hex').toUpperCase().slice(0, 10);
  const signature = crypto.createHash('sha1')
    .update(`${timestamp}_${rand}_${APP_SECRET}`)
    .digest('hex').toUpperCase();
  return { appkey: APP_KEY, timestamp, rand, signature };
}

// Human-readable labels for known HJ212-2017 codes
const CODE_LABELS: Record<string, string> = {
  a34004: 'PM2.5',
  a34002: 'PM10',
  a34001: 'TSP',
  a01007: 'Wind Speed',
  a01008: 'Wind Direction',
  a01001: 'Temperature',
  a01002: 'Humidity',
  a01006: 'Atm. Pressure',
};

// Units for known codes
const CODE_UNITS: Record<string, string> = {
  a34004: 'µg/m³',
  a34002: 'µg/m³',
  a34001: 'µg/m³',
  a01007: 'km/h',
  a01008: '°',
  a01001: '°C',
  a01002: '%',
  a01006: 'hPa',
};

export async function GET() {
  const stations = await prisma.station.findMany({ select: { id: true, code: true } });

  const results = await Promise.all(
    stations.map(async (station) => {
      try {
        const headers = buildHeaders();
        const url = `${API_BASE}/api/hj212/querystatus.do?sn=${encodeURIComponent(station.code)}&tp=2011`;
        const res = await fetch(url, {
          method: 'POST',
          headers: headers as Record<string, string>,
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
          return { station, error: `HTTP ${res.status}`, data: null };
        }

        const body = await res.json();
        if (!body?.Data?.length) {
          return { station, error: 'no_data', data: null };
        }

        const rows = (body.Data as { Code: string; Rtd?: string; Flag?: string }[]).map(item => ({
          code:    item.Code,
          label:   CODE_LABELS[item.Code] ?? '—',
          unit:    CODE_UNITS[item.Code]  ?? '',
          value:   item.Rtd ?? null,
          flag:    item.Flag ?? '',
          mapped:  item.Code in CODE_MAP ? CODE_MAP[item.Code] : null,
        }));

        return { station, error: null, time: body.Time, data: rows };
      } catch (err: any) {
        return { station, error: err.message, data: null };
      }
    })
  );

  return NextResponse.json({ fetchedAt: new Date().toISOString(), results });
}
