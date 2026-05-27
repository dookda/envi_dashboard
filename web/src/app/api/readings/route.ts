import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');

    if (!stationId) {
      return NextResponse.json({ error: 'stationId is required' }, { status: 400 });
    }

    const readings = await prisma.reading.findMany({
      where: {
        stationId: stationId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50,
    });

    // Return chronological order for charts
    return NextResponse.json(readings.reverse());
  } catch (error: any) {
    console.error('Error fetching readings:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
