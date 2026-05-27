import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stations = await prisma.station.findMany({
      include: {
        readings: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
    });

    const stationsWithLatest = stations.map(station => ({
      id: station.id,
      name: station.name,
      code: station.code,
      latitude: station.latitude,
      longitude: station.longitude,
      latestReading: station.readings[0] || null,
    }));

    return NextResponse.json(stationsWithLatest);
  } catch (error: any) {
    console.error('Error fetching stations:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
