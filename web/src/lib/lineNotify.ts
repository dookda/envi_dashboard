const LINE_PUSH_API = 'https://api.line.me/v2/bot/message/push';

export interface AlertPayload {
  stationId: string;
  stationName: string;
  stationCode: string;
  pm25: number;
  pm10: number;
  tsp: number;
}

function level(pm25: number): { label: string; color: string; emoji: string } {
  if (pm25 <= 12)   return { label: 'Good',      color: '#34a853', emoji: '🟢' };
  if (pm25 <= 35.4) return { label: 'Moderate',  color: '#fbbc04', emoji: '🟡' };
  if (pm25 <= 55.4) return { label: 'Sensitive', color: '#ea8600', emoji: '🟠' };
  return               { label: 'Unhealthy', color: '#ea4335', emoji: '🔴' };
}

export async function sendLineOA(
  channelAccessToken: string,
  targetId: string,
  payload: AlertPayload,
): Promise<void> {
  const { label, color, emoji } = level(payload.pm25);
  const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

  const body = {
    to: targetId,
    messages: [
      {
        type: 'flex',
        altText: `${emoji} Air Quality Alert — ${label} | PM2.5: ${payload.pm25.toFixed(1)} µg/m³`,
        contents: {
          type: 'bubble',
          styles: {
            header: { backgroundColor: color },
          },
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: `${emoji} Air Quality Alert`,
                color: '#ffffff',
                size: 'lg',
                weight: 'bold',
              },
              {
                type: 'text',
                text: label,
                color: '#ffffff',
                size: 'sm',
              },
            ],
          },
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'md',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '📍 Station', color: '#5f6368', size: 'sm', flex: 2 },
                  { type: 'text', text: `${payload.stationName} (${payload.stationCode})`, size: 'sm', weight: 'bold', flex: 3, wrap: true },
                ],
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '🕐 Time', color: '#5f6368', size: 'sm', flex: 2 },
                  { type: 'text', text: now, size: 'sm', flex: 3, wrap: true },
                ],
              },
              { type: 'separator' },
              {
                type: 'box',
                layout: 'horizontal',
                spacing: 'sm',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      { type: 'text', text: 'PM2.5', size: 'xs', color: '#1a73e8', align: 'center' },
                      { type: 'text', text: `${payload.pm25.toFixed(1)}`, size: 'md', weight: 'bold', color: '#1a73e8', align: 'center' },
                      { type: 'text', text: 'µg/m³', size: 'xxs', color: '#5f6368', align: 'center' },
                    ],
                    backgroundColor: '#e8f0fe',
                    cornerRadius: 'md',
                    paddingAll: 'sm',
                    flex: 1,
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      { type: 'text', text: 'PM10', size: 'xs', color: '#137333', align: 'center' },
                      { type: 'text', text: `${payload.pm10.toFixed(1)}`, size: 'md', weight: 'bold', color: '#137333', align: 'center' },
                      { type: 'text', text: 'µg/m³', size: 'xxs', color: '#5f6368', align: 'center' },
                    ],
                    backgroundColor: '#e6f4ea',
                    cornerRadius: 'md',
                    paddingAll: 'sm',
                    flex: 1,
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      { type: 'text', text: 'TSP', size: 'xs', color: '#b45309', align: 'center' },
                      { type: 'text', text: `${payload.tsp.toFixed(1)}`, size: 'md', weight: 'bold', color: '#b45309', align: 'center' },
                      { type: 'text', text: 'µg/m³', size: 'xxs', color: '#5f6368', align: 'center' },
                    ],
                    backgroundColor: '#fef3c7',
                    cornerRadius: 'md',
                    paddingAll: 'sm',
                    flex: 1,
                  },
                ],
              },
              {
                type: 'text',
                text: '⚠️ PM2.5 exceeds the safe threshold (55.4 µg/m³). Please take precautionary measures.',
                size: 'xs',
                color: '#c5221f',
                wrap: true,
              },
            ],
          },
        },
      },
    ],
  };

  const res = await fetch(LINE_PUSH_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE OA push error ${res.status}: ${text}`);
  }
}
