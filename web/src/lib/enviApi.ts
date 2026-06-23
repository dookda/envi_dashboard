import crypto from 'crypto';

const API_BASE = 'http://47.236.90.227:57200';
const APP_KEY = process.env.APP_KEY!;
const APP_SECRET = process.env.APP_SECRET!;

// HJ 212-2017 standard factor code → Reading model field mapping
export const CODE_MAP: Record<string, keyof EnviReading> = {
    a34004: 'pm25',
    a34002: 'pm10',
    a34001: 'tsp',
    a01007: 'windSpeed',
    a01008: 'windDirection',
    a01001: 'temperature',
    a01002: 'humidity',
};

export interface EnviReading {
    pm25: number;
    pm10: number;
    tsp: number;
    windSpeed: number;
    windDirection: number;
    temperature: number;
    humidity: number;
    timestamp: Date;
}

export type DataType = 2011 | 2051 | 2061 | 2031;

function buildHeaders() {
    const timestamp = Date.now().toString();
    // Random string: 0-9A-Z, length 10
    const rand = crypto.randomBytes(10).toString('hex').toUpperCase().slice(0, 10);
    const raw = `${timestamp}_${rand}_${APP_SECRET}`;
    const signature = crypto.createHash('sha1').update(raw).digest('hex').toUpperCase();

    return { appkey: APP_KEY, timestamp, rand, signature };
}

interface RawDataItem {
    Code: string;
    Rtd?: string | number;
    Avg?: string | number;
    Flag?: string;
}

interface RawResponse {
    Time: string;
    Data: RawDataItem[];
}

/**
 * Fetch the latest readings for a monitoring point (sn) from the external API.
 * @param sn  Station serial number (maps to Station.code in DB)
 * @param tp  Data type — defaults to 2011 (real-time)
 */
export async function fetchStationReadings(
    sn: string,
    tp: DataType = 2011,
): Promise<EnviReading | null> {
    const headers = buildHeaders();
    const url = `${API_BASE}/api/hj212/querystatus.do?sn=${encodeURIComponent(sn)}&tp=${tp}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: headers as Record<string, string>,
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
        throw new Error(`External API error: ${res.status} ${res.statusText}`);
    }

    const body: RawResponse = await res.json();

    if (!body?.Data?.length) return null;

    // Merge all returned codes into a partial reading
    // body.Time has no UTC offset (e.g. "2026-06-23T13:33:00") and represents
    // Bangkok local time — anchor it explicitly so parsing doesn't depend on
    // the runtime's system timezone (Docker containers default to UTC).
    const partial: Partial<Record<Exclude<keyof EnviReading, 'timestamp'>, number>> & { timestamp?: Date } = {
        timestamp: body.Time ? new Date(`${body.Time}+07:00`) : new Date(),
    };

    for (const item of body.Data) {
        const field = CODE_MAP[item.Code?.toLowerCase()];
        if (!field || field === 'timestamp') continue;
        // Prefer Rtd (real-time), fall back to Avg
        const raw = item.Rtd ?? item.Avg;
        if (raw !== undefined && raw !== null) {
            (partial as Record<string, number>)[field] = parseFloat(String(raw));
        }
    }

    // Only return if we have the minimum required fields
    if (
        partial.pm25 === undefined ||
        partial.pm10 === undefined ||
        partial.tsp === undefined
    ) {
        return null;
    }

    return {
        pm25: partial.pm25,
        pm10: partial.pm10,
        tsp: partial.tsp,
        windSpeed: partial.windSpeed ?? 0,
        windDirection: partial.windDirection ?? 0,
        temperature: partial.temperature ?? 30,
        humidity: partial.humidity ?? 0,
        timestamp: partial.timestamp!,
    };
}
