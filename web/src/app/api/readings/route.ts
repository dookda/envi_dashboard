import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Range = '1h' | '6h' | '24h' | '3d' | '7d';

const RANGE_HOURS: Record<Range, number> = {
  '1h':  1,
  '6h':  6,
  '24h': 24,
  '3d':  72,
  '7d':  168,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('stationId');
  const range = (searchParams.get('range') ?? '1h') as Range;

  if (!stationId) {
    return NextResponse.json({ error: 'stationId is required' }, { status: 400 });
  }

  const hours = RANGE_HOURS[range] ?? 1;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const aggregate = hours > 6;

  try {
    if (!aggregate) {
      const readings = await prisma.reading.findMany({
        where: { stationId, timestamp: { gte: since } },
        orderBy: { timestamp: 'asc' },
      });
      return NextResponse.json(readings);
    }

    // Hourly aggregates for longer ranges
    const rows = await prisma.$queryRaw<Array<{
      hour: Date;
      pm25: number;
      pm10: number;
      tsp: number;
      windSpeed: number;
      windDirection: number;
      temperature: number;
    }>>`
      SELECT
        date_trunc('hour', timestamp)                  AS hour,
        ROUND(AVG(pm25)::numeric, 1)                   AS pm25,
        ROUND(AVG(pm10)::numeric, 1)                   AS pm10,
        ROUND(AVG(tsp)::numeric, 1)                    AS tsp,
        ROUND(AVG("windSpeed")::numeric, 2)            AS "windSpeed",
        ROUND(AVG("windDirection")::numeric, 1)        AS "windDirection",
        ROUND(AVG(temperature)::numeric, 1)            AS temperature
      FROM "Reading"
      WHERE "stationId" = ${stationId}
        AND timestamp >= ${since}
      GROUP BY hour
      ORDER BY hour ASC
    `;

    const normalized = rows.map((r, i) => ({
      id: `agg-${i}`,
      stationId,
      pm25: Number(r.pm25),
      pm10: Number(r.pm10),
      tsp: Number(r.tsp),
      windSpeed: Number(r.windSpeed),
      windDirection: Number(r.windDirection),
      temperature: Number(r.temperature),
      timestamp: r.hour.toISOString(),
    }));

    return NextResponse.json(normalized);
  } catch (error: any) {
    console.error('Error fetching readings:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
