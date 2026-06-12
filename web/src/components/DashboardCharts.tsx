'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

export type Range = '1h' | '6h' | '24h' | '3d' | '7d';

interface Reading {
  id: string;
  pm25: number;
  pm10: number;
  tsp: number;
  windSpeed: number;
  windDirection: number;
  temperature: number;
  timestamp: string;
}

interface DashboardChartsProps {
  readings: Reading[];
  stationName: string;
  range: Range;
  onRangeChange: (r: Range) => void;
}

const RANGES: { value: Range; label: string }[] = [
  { value: '1h',  label: '1H'  },
  { value: '6h',  label: '6H'  },
  { value: '24h', label: '24H' },
  { value: '3d',  label: '3D'  },
  { value: '7d',  label: '7D'  },
];

function formatTick(ts: string, range: Range): string {
  const d = new Date(ts);
  if (range === '1h' || range === '6h') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (range === '24h') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
         d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function degToCompass(deg: number): string {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export default function DashboardCharts({ readings, stationName, range, onRangeChange }: DashboardChartsProps) {
  const chartData = readings.map(r => ({
    ...r,
    tick: formatTick(r.timestamp, range),
  }));

  const avg = (key: keyof Omit<Reading, 'id' | 'timestamp'>) => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((sum, r) => sum + (r[key] as number), 0) / chartData.length;
  };

  const renderChart = (
    dataKey: keyof Omit<Reading, 'id' | 'timestamp'>,
    title: string,
    color: string,
    gradientId: string,
    unit: string = 'µg/m³',
    formatter?: (v: number) => string,
  ) => {
    const avgValue = avg(dataKey);
    return (
      <div className="bg-card px-5 py-5 rounded-3xl border border-border flex flex-col h-[280px]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">{title}</h4>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6]">
              <span className="inline-block w-4 border-t-2 border-dashed" style={{ borderColor: color }} />
              Avg {formatter ? formatter(avgValue) : avgValue.toFixed(1)}
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6]">
              {unit}
            </span>
          </div>
        </div>
        <div className="flex-1 w-full min-h-0">
          {chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#5f6368]">
              No data for this period yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaed" opacity={0.8} />
                <XAxis
                  dataKey="tick"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#9aa0a6', fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#9aa0a6', fontSize: 10 }}
                  tickFormatter={formatter}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8eaed',
                    borderRadius: '1rem',
                    fontSize: '11px',
                    color: '#202124',
                    boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value) => [
                    typeof value === 'number'
                      ? (formatter ? formatter(value) : `${value.toFixed(1)} ${unit}`)
                      : String(value),
                    title,
                  ]}
                />
                <ReferenceLine
                  y={avgValue}
                  stroke={color}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{ value: 'Avg', position: 'insideTopRight', fill: color, fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey={dataKey as string}
                  stroke={color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${gradientId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Range selector */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
          {stationName} — {range === '24h' || range === '3d' || range === '7d' ? 'Hourly averages' : 'Real-time readings'}
        </p>
        <div className="flex items-center gap-1 bg-[#f1f3f4] dark:bg-[#303134] p-1 rounded-2xl">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => onRangeChange(r.value)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                range === r.value
                  ? 'bg-white dark:bg-[#2d2e30] text-[#1a73e8] shadow-sm'
                  : 'text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#202124] dark:hover:text-[#e8eaed]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dust particles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {renderChart('tsp',  'TSP Trend',   '#9c27b0', 'colorTsp',   'µg/m³')}
        {renderChart('pm25', 'PM2.5 Trend', '#1a73e8', 'colorPm25',  'µg/m³')}
        {renderChart('pm10', 'PM10 Trend',  '#34a853', 'colorPm10',  'µg/m³')}
      </div>
      {/* Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {renderChart('temperature',   'Temperature',    '#ea4335', 'colorTemp',  '°C')}
        {renderChart('windSpeed',     'Wind Speed',     '#00bcd4', 'colorWind',  'm/s')}
        {renderChart('windDirection', 'Wind Direction', '#ff9800', 'colorWDir',  '°', degToCompass)}
      </div>
    </div>
  );
}
