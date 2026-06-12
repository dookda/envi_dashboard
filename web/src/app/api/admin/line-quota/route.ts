import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'LINE_CHANNEL_ACCESS_TOKEN not configured' }, { status: 503 });
  }

  try {
    const [quotaRes, consumptionRes] = await Promise.all([
      fetch('https://api.line.me/v2/bot/message/quota', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch('https://api.line.me/v2/bot/message/quota/consumption', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const quota       = await quotaRes.json();
    const consumption = await consumptionRes.json();

    return NextResponse.json({
      type:       quota.type,
      value:      quota.value ?? null,
      totalUsage: consumption.totalUsage ?? 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
