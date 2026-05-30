const LINE_MULTICAST_API = 'https://api.line.me/v2/bot/message/multicast';

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

function buildMessages(payload: AlertPayload) {
  const { label, color, emoji } = level(payload.pm25);
  const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

  return [
    {
      type: 'flex',
      altText: `${emoji} Air Quality Alert — ${label} | PM2.5: ${payload.pm25.toFixed(1)} µg/m³`,
      contents: {
        type: 'bubble',
        styles: { header: { backgroundColor: color } },
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'text', text: `${emoji} Air Quality Alert`, color: '#ffffff', size: 'lg', weight: 'bold' },
            { type: 'text', text: label, color: '#ffffff', size: 'sm' },
          ],
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            {
              type: 'box', layout: 'baseline', spacing: 'sm',
              contents: [
                { type: 'text', text: '📍 Station', color: '#5f6368', size: 'sm', flex: 2 },
                { type: 'text', text: `${payload.stationName} (${payload.stationCode})`, size: 'sm', weight: 'bold', flex: 3, wrap: true },
              ],
            },
            {
              type: 'box', layout: 'baseline', spacing: 'sm',
              contents: [
                { type: 'text', text: '🕐 Time', color: '#5f6368', size: 'sm', flex: 2 },
                { type: 'text', text: now, size: 'sm', flex: 3, wrap: true },
              ],
            },
            { type: 'separator' },
            {
              type: 'box', layout: 'horizontal', spacing: 'sm',
              contents: [
                {
                  type: 'box', layout: 'vertical', flex: 1,
                  backgroundColor: '#e8f0fe', cornerRadius: 'md', paddingAll: 'sm',
                  contents: [
                    { type: 'text', text: 'PM2.5', size: 'xs', color: '#1a73e8', align: 'center' },
                    { type: 'text', text: payload.pm25.toFixed(1), size: 'md', weight: 'bold', color: '#1a73e8', align: 'center' },
                    { type: 'text', text: 'µg/m³', size: 'xxs', color: '#5f6368', align: 'center' },
                  ],
                },
                {
                  type: 'box', layout: 'vertical', flex: 1,
                  backgroundColor: '#e6f4ea', cornerRadius: 'md', paddingAll: 'sm',
                  contents: [
                    { type: 'text', text: 'PM10', size: 'xs', color: '#137333', align: 'center' },
                    { type: 'text', text: payload.pm10.toFixed(1), size: 'md', weight: 'bold', color: '#137333', align: 'center' },
                    { type: 'text', text: 'µg/m³', size: 'xxs', color: '#5f6368', align: 'center' },
                  ],
                },
                {
                  type: 'box', layout: 'vertical', flex: 1,
                  backgroundColor: '#fef3c7', cornerRadius: 'md', paddingAll: 'sm',
                  contents: [
                    { type: 'text', text: 'TSP', size: 'xs', color: '#b45309', align: 'center' },
                    { type: 'text', text: payload.tsp.toFixed(1), size: 'md', weight: 'bold', color: '#b45309', align: 'center' },
                    { type: 'text', text: 'µg/m³', size: 'xxs', color: '#5f6368', align: 'center' },
                  ],
                },
              ],
            },
            {
              type: 'text',
              text: '⚠️ PM2.5 exceeds the safe threshold (55.4 µg/m³). Please take precautionary measures.',
              size: 'xs', color: '#c5221f', wrap: true,
            },
          ],
        },
      },
    },
  ];
}

// Send to a list of LINE userIds (max 500 per call)
export async function sendLineMulticast(
  channelAccessToken: string,
  userIds: string[],
  payload: AlertPayload,
): Promise<void> {
  if (userIds.length === 0) return;

  // Batch into chunks of 500
  for (let i = 0; i < userIds.length; i += 500) {
    const chunk = userIds.slice(i, i + 500);
    const res = await fetch(LINE_MULTICAST_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${channelAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: chunk, messages: buildMessages(payload) }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LINE multicast error ${res.status}: ${text}`);
    }
  }
}
