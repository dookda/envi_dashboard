'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { readingStatus } from '@/lib/airQuality';
import {
  ArrowLeft, RefreshCw, AlertCircle, BellRing, CheckCircle2,
} from 'lucide-react';
import DashboardCharts, { type Range } from '@/components/DashboardCharts';
import FaceIcon from '@/components/FaceIcon';

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

interface Station {
  id: string;
  code: string;
  iotCard: string;
  latitude: number;
  longitude: number;
  latestReading: Reading | null;
}

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-card rounded-3xl border border-border">
      <RefreshCw className="h-6 w-6 animate-spin text-[#1a73e8]" />
    </div>
  ),
});

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [station, setStation] = useState<Station | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [range, setRange] = useState<Range>('1h');
  const [alertState, setAlertState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchStation = useCallback(async () => {
    try {
      const res = await fetch('/air/api/stations');
      if (!res.ok) throw new Error('fetch failed');
      const all: Station[] = await res.json();
      const found = all.find(s => s.id === id) ?? null;
      setStation(found);
      setError(found ? null : 'Station not found');
    } catch {
      setError('Failed to load station data');
    }
  }, [id]);

  const fetchReadings = useCallback(async (r: Range) => {
    try {
      const res = await fetch(`/air/api/readings?stationId=${id}&range=${r}`);
      if (!res.ok) return;
      setReadings(await res.json());
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    fetchStation();
    const t = setInterval(fetchStation, 60000);
    return () => clearInterval(t);
  }, [fetchStation]);

  useEffect(() => {
    fetchReadings(range);
    const t = setInterval(() => fetchReadings(range), 60000);
    return () => clearInterval(t);
  }, [range, fetchReadings]);

  async function sendTestAlert() {
    if (!station?.latestReading) return;
    const r = station.latestReading;
    setAlertState('sending');
    try {
      const res = await fetch('/air/api/alert/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: station.id,
          stationName: station.code,
          stationCode: station.code,
          pm25: r.pm25, pm10: r.pm10, tsp: r.tsp,
          windSpeed: r.windSpeed, windDirection: r.windDirection, temperature: r.temperature,
        }),
      });
      setAlertState(res.ok ? 'sent' : 'error');
    } catch {
      setAlertState('error');
    }
    setTimeout(() => setAlertState('idle'), 3000);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-[#ea4335] mx-auto" />
          <p className="text-sm text-[#c5221f]">{error}</p>
          <Link href="/dashboard" className="text-xs text-[#1a73e8] underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[#1a73e8]" />
      </div>
    );
  }

  const status = readingStatus(station.latestReading?.pm25, station.latestReading?.pm10, station.latestReading?.tsp);
  const r = station.latestReading;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <header className="flex items-center justify-between bg-card px-6 py-4 rounded-3xl border border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-2xl hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[#5f6368]" />
          </Link>
          <FaceIcon level={status.level} size={40} />
          <div>
            <h1 className="text-sm font-semibold text-[#202124] dark:text-[#e8eaed] font-mono tracking-tight">{station.code}</h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
              {station.latitude !== 0 && station.longitude !== 0
                ? `${station.latitude.toFixed(4)}, ${station.longitude.toFixed(4)}`
                : 'Location not set'}
            </p>
          </div>
        </div>

        {r && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e8f0fe]">
              <span className="w-2 h-2 rounded-full bg-[#1a73e8]" />
              <span className="text-[#1a73e8]">PM2.5: {r.pm25}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e6f4ea]">
              <span className="w-2 h-2 rounded-full bg-[#34a853]" />
              <span className="text-[#137333]">PM10: {r.pm10}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef3c7]">
              <span className="w-2 h-2 rounded-full bg-[#fbbc04]" />
              <span className="text-[#b45309]">TSP: {r.tsp}</span>
            </div>
            <button
              onClick={sendTestAlert}
              disabled={alertState !== 'idle'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-60 cursor-pointer bg-[#06C755] hover:bg-[#05b34c] text-white disabled:cursor-not-allowed"
            >
              {alertState === 'sending' && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              {alertState === 'sent'    && <CheckCircle2 className="h-3.5 w-3.5" />}
              {alertState === 'error'   && <AlertCircle className="h-3.5 w-3.5" />}
              {alertState === 'idle'    && <BellRing className="h-3.5 w-3.5" />}
              {alertState === 'sending' ? 'Sending…' : alertState === 'sent' ? 'Sent!' : alertState === 'error' ? 'Failed' : 'Test Alert'}
            </button>
          </div>
        )}
      </header>

      {/* Map */}
      <div className="h-[400px]">
        <MapComponent
          stations={[station]}
          activeStationId={station.id}
          onSelectStation={() => {}}
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        readings={readings}
        stationName={station.code}
        range={range}
        onRangeChange={setRange}
      />

    </div>
  );
}
