'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

interface Reading {
  id: string;
  pm25: number;
  pm10: number;
  tsp: number;
  timestamp: string;
}

interface DashboardChartsProps {
  readings: Reading[];
  stationName: string;
}

export default function DashboardCharts({ readings, stationName }: DashboardChartsProps) {
  const chartData = readings.map(r => ({
    ...r,
    formattedTime: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }));

  const avg = (key: 'pm25' | 'pm10' | 'tsp') => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((sum, r) => sum + r[key], 0) / chartData.length;
  };

  const renderChart = (
    dataKey: 'pm25' | 'pm10' | 'tsp',
    title: string,
    color: string,
    gradientId: string,
    unit: string = 'µg/m³'
  ) => {
    const avgValue = avg(dataKey);
    return (
      <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-sm flex flex-col h-[280px]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{title}</h4>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
              <span className="inline-block w-4 border-t-2 border-dashed" style={{ borderColor: color }}></span>
              Avg {avgValue.toFixed(1)}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {unit}
            </span>
          </div>
        </div>
        <div className="flex-1 w-full min-h-0">
          {chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
              Waiting for real-time readings...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="formattedTime"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: 'var(--foreground)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                  }}
                />
                <ReferenceLine
                  y={avgValue}
                  stroke={color}
                  strokeDasharray="4 4"
                  strokeOpacity={0.7}
                  label={{ value: `Avg`, position: 'insideTopRight', fill: color, fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey={dataKey}
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {renderChart('pm25', 'PM2.5 Trend', '#3b82f6', 'colorPm25')}
      {renderChart('pm10', 'PM10 Trend', '#10b981', 'colorPm10')}
      {renderChart('tsp', 'TSP Trend', '#f59e0b', 'colorTsp')}
    </div>
  );
}
