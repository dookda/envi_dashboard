import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: { iotCard?: string; latitude?: number; longitude?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { iotCard, latitude, longitude } = body;

  try {
    const station = await prisma.station.update({
      where: { id },
      data: {
        ...(iotCard !== undefined && { iotCard: iotCard.trim() }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
      },
    });
    return NextResponse.json(station);
  } catch {
    return NextResponse.json({ error: 'Station not found' }, { status: 404 });
  }
}
