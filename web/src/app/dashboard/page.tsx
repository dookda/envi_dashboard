'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import {
  MapPin,
  BarChart3,
  RefreshCw,
  AlertCircle,
  BellRing,
  CheckCircle2
} from 'lucide-react';
import DashboardCharts from '@/components/DashboardCharts';
import SignOutButton from '@/components/SignOutButton';

interface Reading {
  id: string;
  pm25: number;
  pm10: number;
  tsp: number;
  timestamp: string;
}

interface Station {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  latestReading: Reading | null;
}

// Dynamically import map component to avoid SSR window errors
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] flex flex-col items-center justify-center bg-card text-slate-400 rounded-2xl border border-border">
      <RefreshCw className="h-8 w-8 animate-spin mb-2" />
      <span className="text-sm font-medium">Loading interactive map...</span>
    </div>
  ),
});

export default function Home() {
  const { data: session } = useSession();
  const [stations, setStations] = useState<Station[]>([]);
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testAlertState, setTestAlertState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const triggerAlert = useCallback(async (station: Station) => {
    const r = station.latestReading;
    if (!r) return;
    try {
      await fetch('/air/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: station.id,
          stationName: station.name,
          stationCode: station.code,
          pm25: r.pm25,
          pm10: r.pm10,
          tsp: r.tsp,
        }),
      });
    } catch {
      // Alert is best-effort; don't break the dashboard if it fails
    }
  }, []);

  const sendTestAlert = useCallback(async (station: Station) => {
    const r = station.latestReading;
    if (!r) return;
    setTestAlertState('sending');
    try {
      const res = await fetch('/air/api/alert/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: station.id,
          stationName: station.name,
          stationCode: station.code,
          pm25: r.pm25,
          pm10: r.pm10,
          tsp: r.tsp,
        }),
      });
      setTestAlertState(res.ok ? 'sent' : 'error');
    } catch {
      setTestAlertState('error');
    }
    setTimeout(() => setTestAlertState('idle'), 3000);
  }, []);

  const fetchStations = useCallback(async () => {
    try {
      const response = await fetch('/air/api/stations');
      if (!response.ok) throw new Error('Failed to fetch stations');
      const data: Station[] = await response.json();
      setStations(data);

      // Default to first station if none is selected
      if (data.length > 0 && !activeStationId) {
        setActiveStationId(data[0].id);
      }
      setError(null);

      // Fire LINE Notify for any station with critical PM2.5
      data.forEach(station => {
        if ((station.latestReading?.pm25 ?? 0) > 55.4) {
          triggerAlert(station);
        }
      });
    } catch (err: any) {
      console.error(err);
      setError('Database connection error. Ensure Docker services are running.');
    } finally {
      setIsLoading(false);
    }
  }, [activeStationId, triggerAlert]);

  const fetchReadings = useCallback(async (stationId: string) => {
    try {
      const response = await fetch(`/air/api/readings?stationId=${stationId}`);
      if (!response.ok) throw new Error('Failed to fetch historical readings');
      const data: Reading[] = await response.json();
      setReadings(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Poll stations every 5 seconds
  useEffect(() => {
    fetchStations();
    const interval = setInterval(() => fetchStations(), 5000);
    return () => clearInterval(interval);
  }, [fetchStations]);

  // Poll readings for active station every 5 seconds
  useEffect(() => {
    if (!activeStationId) return;
    fetchReadings(activeStationId);

    const interval = setInterval(() => {
      fetchReadings(activeStationId);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeStationId, fetchReadings]);

  const activeStation = stations.find(s => s.id === activeStationId);

  const getPM25Status = (val: number | null | undefined) => {
    if (val === null || val === undefined) return { label: 'Offline', color: 'text-[#5f6368] bg-[#f1f3f4]', border: 'border-l-[#5f6368]' };
    if (val <= 12) return { label: 'Good', color: 'text-[#137333] bg-[#e6f4ea]', border: 'border-l-[#34a853]' };
    if (val <= 35.4) return { label: 'Moderate', color: 'text-[#b45309] bg-[#fef3c7]', border: 'border-l-[#fbbc04]' };
    if (val <= 55.4) return { label: 'Sensitive', color: 'text-[#b91c1c] bg-[#fce8e6]', border: 'border-l-[#ea8600]' };
    return { label: 'Unhealthy', color: 'text-[#c5221f] bg-[#fce8e6]', border: 'border-l-[#ea4335]' };
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-card px-6 py-4 rounded-3xl border border-border">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH}/logo.png`} alt="Envir Service" width={40} height={40} className="rounded-2xl" />
          <div>
            <h1 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed] tracking-tight">Envir Service</h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Environmental Quality Control Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 sm:mt-0 flex-wrap">
          {error && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3f4] dark:bg-[#303134] text-xs font-medium">
              <AlertCircle className="h-3.5 w-3.5 text-[#ea4335]" />
              <span className="text-[#ea4335]">Database Offline</span>
            </div>
          )}

          {/* User avatar + sign out */}
          {session?.user && (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#f1f3f4] dark:bg-[#303134] hover:bg-[#e8eaed] dark:hover:bg-[#3c4043] transition-colors"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? 'User'}
                    className="h-5 w-5 rounded-full"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-[10px] font-bold">
                    {session.user.name?.[0] ?? '?'}
                  </div>
                )}
                <span className="text-xs font-medium text-[#202124] dark:text-[#e8eaed] hidden sm:block">
                  {session.user.name}
                </span>
              </Link>
              <SignOutButton />
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-[#fce8e6] rounded-3xl">
          <AlertCircle className="h-5 w-5 text-[#ea4335] mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-[#c5221f] text-sm">System Error</h4>
            <p className="text-xs text-[#c5221f]/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Selected Station Summary & Charts */}
      {activeStation && (
        <section className="space-y-5">
          {/* Summary Panel */}
          <div className="bg-card px-6 py-4 rounded-3xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e8f0fe] text-[#1a73e8] rounded-2xl">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#202124] dark:text-[#e8eaed]">{activeStation.name} Telemetry</h3>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">{activeStation.latitude.toFixed(4)}, {activeStation.longitude.toFixed(4)}</p>
              </div>
            </div>

            {activeStation.latestReading && (
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e8f0fe]">
                  <span className="w-2 h-2 rounded-full bg-[#1a73e8]"></span>
                  <span className="text-[#1a73e8]">PM2.5: {activeStation.latestReading.pm25} µg/m³</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e6f4ea]">
                  <span className="w-2 h-2 rounded-full bg-[#34a853]"></span>
                  <span className="text-[#137333]">PM10: {activeStation.latestReading.pm10} µg/m³</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef3c7]">
                  <span className="w-2 h-2 rounded-full bg-[#fbbc04]"></span>
                  <span className="text-[#b45309]">TSP: {activeStation.latestReading.tsp} µg/m³</span>
                </div>
                <button
                  onClick={() => sendTestAlert(activeStation)}
                  disabled={testAlertState !== 'idle'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-60 cursor-pointer
                    bg-[#06C755] hover:bg-[#05b34c] text-white disabled:cursor-not-allowed"
                >
                  {testAlertState === 'sending' && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {testAlertState === 'sent'    && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {testAlertState === 'error'   && <AlertCircle className="h-3.5 w-3.5" />}
                  {testAlertState === 'idle'    && <BellRing className="h-3.5 w-3.5" />}
                  {testAlertState === 'sending' ? 'Sending…' :
                   testAlertState === 'sent'    ? 'Sent!' :
                   testAlertState === 'error'   ? 'Failed' : 'Test Alert'}
                </button>
              </div>
            )}
          </div>

          {/* Historical Area Line Charts */}
          <DashboardCharts readings={readings} stationName={activeStation.name} />
        </section>
      )}

      {/* Main Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left Column: Station list */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          <div className="bg-card px-5 py-5 rounded-3xl border border-border flex flex-col flex-1 h-[450px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#1a73e8]" />
                <h3 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">Observation Stations</h3>
              </div>
              <span className="text-xs text-[#5f6368] bg-[#f1f3f4] dark:bg-[#303134] px-2 py-0.5 rounded-full">{stations.length} Registered</span>
            </div>

            {/* List scroll wrapper */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-[#1a73e8]" />
                </div>
              ) : stations.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-[#5f6368]">
                  No stations registered.
                </div>
              ) : (
                stations.map(station => {
                  const pm25 = station.latestReading?.pm25;
                  const status = getPM25Status(pm25);
                  const isActive = station.id === activeStationId;

                  return (
                    <button
                      key={station.id}
                      onClick={() => setActiveStationId(station.id)}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all duration-150 flex flex-col gap-2 ${isActive
                          ? 'bg-[#f1f3f4] dark:bg-[#303134]'
                          : 'bg-transparent hover:bg-[#f8f9fa] dark:hover:bg-[#303134]/60'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm text-[#202124] dark:text-[#e8eaed] line-clamp-1">{station.name}</h4>
                          <span className="text-xs text-[#5f6368]">{station.code}</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      {station.latestReading ? (
                        <div className="grid grid-cols-3 gap-1.5 mt-0.5 text-center">
                          <div className="bg-[#e8f0fe] p-1.5 rounded-xl">
                            <span className="block text-[9px] font-medium text-[#1a73e8]">PM2.5</span>
                            <span className="text-xs font-semibold text-[#1a73e8]">{station.latestReading.pm25}</span>
                          </div>
                          <div className="bg-[#e6f4ea] p-1.5 rounded-xl">
                            <span className="block text-[9px] font-medium text-[#137333]">PM10</span>
                            <span className="text-xs font-semibold text-[#137333]">{station.latestReading.pm10}</span>
                          </div>
                          <div className="bg-[#fef3c7] p-1.5 rounded-xl">
                            <span className="block text-[9px] font-medium text-[#b45309]">TSP</span>
                            <span className="text-xs font-semibold text-[#b45309]">{station.latestReading.tsp}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#fbbc04] italic mt-0.5 flex items-center gap-1">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Waiting for telemetry...
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Map */}
        <div className="lg:col-span-2 h-[450px]">
          <MapComponent
            stations={stations}
            activeStationId={activeStationId}
            onSelectStation={(id) => setActiveStationId(id)}
          />
        </div>
      </div>

    </div>
  );
}
