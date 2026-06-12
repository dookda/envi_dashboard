import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { fetchStationReadings, DataType } from '@/lib/enviApi';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * POST /api/readings/sync
 *
 * Pulls the latest reading from the external IoT API for one or all stations
 * and persists it into the local database.
 *
 * Body (JSON):
 *   { stationId?: string, tp?: 2011 | 2051 | 2061 | 2031 }
 *
 * - If stationId is provided, syncs only that station.
 * - If omitted, syncs all stations.
 * - tp defaults to 2011 (real-time data).
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const tp: DataType = body.tp ?? 2011;

        const stations = body.stationId
            ? await prisma.station.findMany({ where: { id: body.stationId } })
            : await prisma.station.findMany();

        if (stations.length === 0) {
            return NextResponse.json({ error: 'No stations found' }, { status: 404 });
        }

        const results: { station: string; status: 'ok' | 'no_data' | 'error'; error?: string }[] = [];

        for (const station of stations) {
            try {
                const reading = await fetchStationReadings(station.code, tp);

                if (!reading) {
                    results.push({ station: station.name, status: 'no_data' });
                    continue;
                }

                // Skip if device hasn't reported a new reading since the last stored one
                const last = await prisma.reading.findFirst({
                    where: { stationId: station.id },
                    orderBy: { timestamp: 'desc' },
                    select: { timestamp: true },
                });
                if (last && last.timestamp.getTime() === reading.timestamp.getTime()) {
                    results.push({ station: station.name, status: 'no_data' });
                    continue;
                }

                await prisma.reading.create({
                    data: {
                        id: crypto.randomUUID(),
                        stationId: station.id,
                        pm25: reading.pm25,
                        pm10: reading.pm10,
                        tsp: reading.tsp,
                        windSpeed: reading.windSpeed,
                        windDirection: reading.windDirection,
                        temperature: reading.temperature,
                        timestamp: reading.timestamp,
                    },
                });

                results.push({ station: station.name, status: 'ok' });
            } catch (err: any) {
                results.push({ station: station.name, status: 'error', error: err.message });
            }
        }

        const synced = results.filter(r => r.status === 'ok').length;
        return NextResponse.json({ synced, total: stations.length, results });
    } catch (error: any) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
