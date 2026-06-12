'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, MapPin, Signal, RefreshCw } from 'lucide-react';

interface Station {
  id: string;
  code: string;
  iotCard: string;
  latitude: number;
  longitude: number;
  latestReading: {
    pm25: number; pm10: number; tsp: number; timestamp: string;
  } | null;
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/air/api/stations')
      .then(r => r.json())
      .then(setStations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <header className="flex items-center gap-3 bg-card px-6 py-4 rounded-3xl border border-border">
        <Link href="/dashboard" className="p-2 rounded-2xl hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors">
          <ArrowLeft className="h-4 w-4 text-[#5f6368]" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-[#e8f0fe] text-[#1a73e8] rounded-2xl">
            <Signal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed]">Station Monitor</h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">{stations.length} stations registered</p>
          </div>
        </div>
      </header>

      {/* Station table */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#1a73e8]" />
          <h2 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">Stations</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-[#1a73e8]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-[#5f6368] uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Serial Number</th>
                  <th className="px-6 py-3 text-left">IoT Card</th>
                  <th className="px-6 py-3 text-left">Latitude</th>
                  <th className="px-6 py-3 text-left">Longitude</th>
                  <th className="px-6 py-3 text-left">Last Data</th>
                  <th className="px-6 py-3 text-left">PM2.5</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stations.map(s => {
                  const r = s.latestReading;
                  const locSet = s.latitude !== 0 && s.longitude !== 0;
                  return (
                    <tr key={s.id} className="hover:bg-[#f8f9fa] dark:hover:bg-[#303134]/60 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-[#202124] dark:text-[#e8eaed] font-medium">{s.code}</td>
                      <td className="px-6 py-4 font-mono text-xs text-[#5f6368]">{s.iotCard || '—'}</td>
                      <td className="px-6 py-4 text-xs text-[#5f6368]">
                        {locSet ? s.latitude.toFixed(4) : <span className="text-[#fbbc04]">—</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#5f6368]">
                        {locSet ? s.longitude.toFixed(4) : <span className="text-[#fbbc04]">—</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#5f6368]">
                        {r ? new Date(r.timestamp).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : <span className="text-[#fbbc04]">No data</span>}
                      </td>
                      <td className="px-6 py-4">
                        {r ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#1a73e8]">
                            {r.pm25} µg/m³
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/stations/${s.id}/edit`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#f1f3f4] hover:bg-[#e8f0fe] text-[#5f6368] hover:text-[#1a73e8] text-xs font-medium transition-colors"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
