import { pm25Level, pm10Level, tspLevel, compositeLevel, getStatus, isUnhealthy } from './airQuality';

const LINE_MULTICAST_API = 'https://api.line.me/v2/bot/message/multicast';

export interface AlertPayload {
  stationId: string;
  stationName: string;
  stationCode: string;
  pm25: number;
  pm10: number;
  tsp: number;
  windSpeed?: number;
  windDirection?: number;
  temperature?: number;
}

function degToCompass(deg: number): string {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function levelEmoji(level: string): string {
  if (level === 'good')      return '🟢';
  if (level === 'moderate')  return '🟡';
  return '🔴';
}

function buildMessages(payload: AlertPayload) {
  const overall = compositeLevel(payload.pm25, payload.pm10, payload.tsp);
  const { label, color } = getStatus(overall);
  const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

  const pm25l = pm25Level(payload.pm25);
  const pm10l = pm10Level(payload.pm10);
  const tspl  = tspLevel(payload.tsp);

  const pm25Status = getStatus(pm25l);
  const pm10Status = getStatus(pm10l);
  const tspStatus  = getStatus(tspl);

  const overallEmoji = levelEmoji(overall);

  return [
    {
      type: 'flex',
      altText: `${overallEmoji} แจ้งเตือนคุณภาพอากาศ — ${label} | PM2.5: ${payload.pm25.toFixed(1)} µg/m³`,
      contents: {
        type: 'bubble',
        styles: { header: { backgroundColor: color } },
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'text', text: `${overallEmoji} แจ้งเตือนคุณภาพอากาศ`, color: '#ffffff', size: 'lg', weight: 'bold' },
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
                { type: 'text', text: '📍 สถานี', color: '#5f6368', size: 'sm', flex: 2 },
                { type: 'text', text: `${payload.stationName} (${payload.stationCode})`, size: 'sm', weight: 'bold', flex: 3, wrap: true },
              ],
            },
            {
              type: 'box', layout: 'baseline', spacing: 'sm',
              contents: [
                { type: 'text', text: '🕐 เวลา', color: '#5f6368', size: 'sm', flex: 2 },
                { type: 'text', text: now, size: 'sm', flex: 3, wrap: true },
              ],
            },
            { type: 'separator' },
            {
              type: 'box', layout: 'horizontal', spacing: 'sm',
              contents: [
                {
                  type: 'box', layout: 'vertical', flex: 1,
                  backgroundColor: tspStatus.bgColor, cornerRadius: 'md', paddingAll: 'sm',
                  contents: [
                    { type: 'text', text: `${levelEmoji(tspl)} TSP`, size: 'xs', color: tspStatus.textColor, align: 'center' },
                    { type: 'text', text: payload.tsp.toFixed(1), size: 'md', weight: 'bold', color: tspStatus.textColor, align: 'center' },
                    { type: 'text', text: 'µg/m³', size: 'xxs', color: '#5f6368', align: 'center' },
                  ],
                },
                {
                  type: 'box', layout: 'vertical', flex: 1,
                  backgroundColor: pm25Status.bgColor, cornerRadius: 'md', paddingAll: 'sm',
                  contents: [
                    { type: 'text', text: `${levelEmoji(pm25l)} PM2.5`, size: 'xs', color: pm25Status.textColor, align: 'center' },
                    { type: 'text', text: payload.pm25.toFixed(1), size: 'md', weight: 'bold', color: pm25Status.textColor, align: 'center' },
                    { type: 'text', text: 'µg/m³', size: 'xxs', color: '#5f6368', align: 'center' },
                  ],
                },
                {
                  type: 'box', layout: 'vertical', flex: 1,
                  backgroundColor: pm10Status.bgColor, cornerRadius: 'md', paddingAll: 'sm',
                  contents: [
                    { type: 'text', text: `${levelEmoji(pm10l)} PM10`, size: 'xs', color: pm10Status.textColor, align: 'center' },
                    { type: 'text', text: payload.pm10.toFixed(1), size: 'md', weight: 'bold', color: pm10Status.textColor, align: 'center' },
                    { type: 'text', text: 'µg/m³', size: 'xxs', color: '#5f6368', align: 'center' },
                  ],
                },
              ],
            },
            ...(payload.temperature != null || payload.windSpeed != null ? [{
              type: 'box', layout: 'horizontal', spacing: 'sm',
              contents: [
                {
                  type: 'box', layout: 'vertical', flex: 1,
                  backgroundColor: '#fce8e6', cornerRadius: 'md', paddingAll: 'sm',
                  contents: [
                    { type: 'text', text: '🌡️ อุณหภูมิ', size: 'xs', color: '#c5221f', align: 'center' },
                    { type: 'text', text: payload.temperature != null ? `${payload.temperature.toFixed(1)}` : '—', size: 'md', weight: 'bold', color: '#c5221f', align: 'center' },
                    { type: 'text', text: '°C', size: 'xxs', color: '#5f6368', align: 'center' },
                  ],
                },
                {
                  type: 'box', layout: 'vertical', flex: 1,
                  backgroundColor: '#e0f7fa', cornerRadius: 'md', paddingAll: 'sm',
                  contents: [
                    { type: 'text', text: '💨 ลม', size: 'xs', color: '#00838f', align: 'center' },
                    { type: 'text', text: payload.windSpeed != null ? `${payload.windSpeed.toFixed(1)}` : '—', size: 'md', weight: 'bold', color: '#00838f', align: 'center' },
                    { type: 'text', text: 'km/h', size: 'xxs', color: '#5f6368', align: 'center' },
                  ],
                },
                {
                  type: 'box', layout: 'vertical', flex: 1,
                  backgroundColor: '#fff3e0', cornerRadius: 'md', paddingAll: 'sm',
                  contents: [
                    { type: 'text', text: '🧭 ทิศลม', size: 'xs', color: '#e65100', align: 'center' },
                    { type: 'text', text: payload.windDirection != null ? degToCompass(payload.windDirection) : '—', size: 'md', weight: 'bold', color: '#e65100', align: 'center' },
                    { type: 'text', text: payload.windDirection != null ? `${payload.windDirection.toFixed(0)}°` : '', size: 'xxs', color: '#5f6368', align: 'center' },
                  ],
                },
              ],
            }] : []),
            ...(isUnhealthy(payload.pm25, payload.pm10, payload.tsp) ? [{
              type: 'text',
              text: '⚠️ ค่าฝุ่นละอองเกินมาตรฐาน กรุณาระมัดระวังและดูแลสุขภาพ',
              size: 'xs', color: '#c5221f', wrap: true,
            }] : []),
          ],
        },
      },
    },
  ];
}

export async function sendLineMulticast(
  channelAccessToken: string,
  userIds: string[],
  payload: AlertPayload,
): Promise<void> {
  if (userIds.length === 0) return;
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
