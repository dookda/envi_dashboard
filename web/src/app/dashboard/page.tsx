'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { readingStatus, pm25Level, pm10Level, tspLevel, getStatus } from '@/lib/airQuality';
import {
  MapPin, RefreshCw, AlertCircle, Settings, Pencil,
} from 'lucide-react';
import FaceIcon from '@/components/FaceIcon';

interface Reading {
  id: string;
  pm25: number;
  pm10: number;
  tsp: number;
  windSpeed: number;
  windDirection: number;
  temperature: number;
  humidity: number;
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

function degToCompass(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export default function DashboardPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    try {
      await fetch('/air/api/readings/sync', { method: 'POST' }).catch(() => {});
      const res = await fetch('/air/api/stations');
      if (!res.ok) throw new Error('Failed to fetch stations');
      setStations(await res.json());
      setError(null);
    } catch {
      setError('Database connection error. Ensure Docker services are running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
    const t = setInterval(fetchStations, 60000);
    return () => clearInterval(t);
  }, [fetchStations]);

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
          <Link
            href="/stations"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] text-xs font-medium hover:bg-[#e8eaed] transition-colors"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Stations</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] text-xs font-medium hover:bg-[#e8eaed] transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Admin</span>
          </Link>
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

      {/* Station grid */}
      <div className="bg-card px-5 py-5 rounded-3xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#1a73e8]" />
            <h3 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">S.P.S.Consulting</h3>
          </div>
          <span className="text-xs text-[#5f6368] bg-[#f1f3f4] dark:bg-[#303134] px-2 py-0.5 rounded-full">
            {stations.length} Registered
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-[#1a73e8]" />
          </div>
        ) : stations.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-[#5f6368]">
            No stations registered.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stations.map(station => {
              const status = readingStatus(station.latestReading?.pm25, station.latestReading?.pm10, station.latestReading?.tsp);
              const r = station.latestReading;

              return (
                <div key={station.id} className="relative group rounded-2xl border border-border hover:border-[#1a73e8] transition-colors bg-[#f8f9fa] dark:bg-[#303134]/40">
                  {/* Edit shortcut */}
                  <Link
                    href={`/stations/${station.id}/edit`}
                    className="absolute top-3 right-3 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-[#e8f0fe] text-[#9aa0a6] hover:text-[#1a73e8] transition-all z-10"
                    title="Edit station"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>

                  {/* Card body → navigates to detail */}
                  <Link href={`/detail/${station.id}`} className="flex flex-col gap-3 p-4 rounded-2xl">
                    <div className="flex items-center gap-3 pr-7">
                      <FaceIcon level={status.level} size={40} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#202124] dark:text-[#e8eaed] font-mono truncate">{station.code}</p>
                        <span
                          className="inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: status.bgColor, color: status.textColor }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {r ? (
                      <div className="flex flex-col gap-1.5 text-center">
                        {/* AQ row */}
                        {(() => {
                          const s25  = getStatus(pm25Level(r.pm25));
                          const s10  = getStatus(pm10Level(r.pm10));
                          const stsp = getStatus(tspLevel(r.tsp));
                          return (
                            <div className="grid grid-cols-3 gap-1.5">
                              <div className="p-1.5 rounded-xl" style={{ background: s25.bgColor }}>
                                <span className="block text-[9px] font-medium" style={{ color: s25.textColor }}>PM2.5</span>
                                <span className="text-xs font-semibold" style={{ color: s25.textColor }}>{r.pm25}</span>
                              </div>
                              <div className="p-1.5 rounded-xl" style={{ background: s10.bgColor }}>
                                <span className="block text-[9px] font-medium" style={{ color: s10.textColor }}>PM10</span>
                                <span className="text-xs font-semibold" style={{ color: s10.textColor }}>{r.pm10}</span>
                              </div>
                              <div className="p-1.5 rounded-xl" style={{ background: stsp.bgColor }}>
                                <span className="block text-[9px] font-medium" style={{ color: stsp.textColor }}>TSP</span>
                                <span className="text-xs font-semibold" style={{ color: stsp.textColor }}>{r.tsp}</span>
                              </div>
                            </div>
                          );
                        })()}
                        {/* Weather row */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <div className="bg-[#fce8e6] p-1.5 rounded-xl">
                            <span className="block text-[9px] font-medium text-[#c5221f]">Temp</span>
                            <span className="text-xs font-semibold text-[#c5221f]">{r.temperature}°C</span>
                          </div>
                          <div className="bg-[#e8f0fe] p-1.5 rounded-xl">
                            <span className="block text-[9px] font-medium text-[#1a73e8]">Hum</span>
                            <span className="text-xs font-semibold text-[#1a73e8]">{r.humidity}%</span>
                          </div>
                          <div className="bg-[#e0f7fa] p-1.5 rounded-xl">
                            <span className="block text-[9px] font-medium text-[#00838f]">Wind</span>
                            <span className="text-xs font-semibold text-[#00838f]">{r.windSpeed} m/s</span>
                          </div>
                          <div className="bg-[#fff3e0] p-1.5 rounded-xl">
                            <span className="block text-[9px] font-medium text-[#e65100]">Dir</span>
                            <span className="text-xs font-semibold text-[#e65100]">{degToCompass(r.windDirection)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-[#fbbc04] italic">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Waiting for telemetry…
                      </div>
                    )}

                    {r && (
                      <p className="text-[10px] text-[#9aa0a6] text-right">
                        {new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}
                      </p>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
