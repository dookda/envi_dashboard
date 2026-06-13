'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Bug, CheckCircle2, AlertCircle, Minus } from 'lucide-react';

interface Row {
  code: string;
  label: string;
  unit: string;
  value: string | null;
  flag: string;
  mapped: string | null;
}

interface StationResult {
  station: { id: string; code: string };
  error: string | null;
  time?: string;
  data: Row[] | null;
}

interface DebugResponse {
  fetchedAt: string;
  results: StationResult[];
}

export default function DebugPage() {
  const [data, setData]       = useState<DebugResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchDebug() {
    setLoading(true);
    try {
      const res = await fetch('/air/api/debug');
      setData(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <header className="flex items-center justify-between bg-card px-6 py-4 rounded-3xl border border-border">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-2xl hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors">
            <ArrowLeft className="h-4 w-4 text-[#5f6368]" />
          </Link>
          <div className="p-2 bg-[#fce8e6] text-[#ea4335] rounded-2xl">
            <Bug className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed]">API Debug</h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Raw IoT sensor data — all parameter codes</p>
          </div>
        </div>

        <button
          onClick={fetchDebug}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-60 text-white text-sm font-medium transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Fetching…' : 'Fetch from API'}
        </button>
      </header>

      {/* Legend */}
      <div className="bg-card px-6 py-4 rounded-3xl border border-border flex flex-wrap items-center gap-4 text-xs text-[#5f6368]">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#34a853]" />
          <span>Mapped — value stored in DB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-[#fbbc04]" />
          <span>Not mapped — received but ignored</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-[#e8f0fe]" />
          <span>Flag N = Normal</span>
        </div>
        {data && (
          <span className="ml-auto text-[#9aa0a6]">
            Fetched: {new Date(data.fetchedAt).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok' })}
          </span>
        )}
      </div>

      {/* Empty state */}
      {!data && !loading && (
        <div className="bg-card rounded-3xl border border-border flex flex-col items-center justify-center py-20 gap-3">
          <Bug className="h-10 w-10 text-[#dadce0]" />
          <p className="text-sm text-[#5f6368]">Click <strong>Fetch from API</strong> to pull live data from all stations</p>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-4">
          {data.results.map(({ station, error, time, data: rows }) => (
            <div key={station.id} className="bg-card rounded-3xl border border-border overflow-hidden">

              {/* Station header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#202124] dark:text-[#e8eaed] font-mono">{station.code}</p>
                  {time && (
                    <p className="text-xs text-[#5f6368] mt-0.5">
                      Device time: {new Date(time).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                    </p>
                  )}
                </div>
                {error ? (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#fce8e6] text-[#c5221f]">{error}</span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#e6f4ea] text-[#137333]">
                    {rows?.length} codes
                  </span>
                )}
              </div>

              {/* Data table */}
              {rows && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] font-semibold text-[#5f6368] uppercase tracking-wide bg-[#f8f9fa] dark:bg-[#303134]/40">
                        <th className="px-5 py-2.5 text-left">Code</th>
                        <th className="px-5 py-2.5 text-left">Parameter</th>
                        <th className="px-5 py-2.5 text-right">Value</th>
                        <th className="px-5 py-2.5 text-left">Unit</th>
                        <th className="px-5 py-2.5 text-center">Flag</th>
                        <th className="px-5 py-2.5 text-left">DB Field</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map(row => (
                        <tr
                          key={row.code}
                          className={`transition-colors ${
                            row.mapped
                              ? 'hover:bg-[#e6f4ea]/40'
                              : 'hover:bg-[#f8f9fa] dark:hover:bg-[#303134]/40 opacity-70'
                          }`}
                        >
                          <td className="px-5 py-3 font-mono text-xs text-[#5f6368]">{row.code}</td>
                          <td className="px-5 py-3 text-xs font-medium text-[#202124] dark:text-[#e8eaed]">
                            {row.label}
                          </td>
                          <td className="px-5 py-3 text-sm font-bold text-right text-[#202124] dark:text-[#e8eaed]">
                            {row.value ?? <span className="text-[#9aa0a6] font-normal text-xs">—</span>}
                          </td>
                          <td className="px-5 py-3 text-xs text-[#5f6368]">{row.unit}</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              row.flag === 'N'
                                ? 'bg-[#e6f4ea] text-[#137333]'
                                : 'bg-[#fce8e6] text-[#c5221f]'
                            }`}>
                              {row.flag || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {row.mapped ? (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#34a853] shrink-0" />
                                <span className="text-xs font-mono text-[#137333]">{row.mapped}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Minus className="h-3.5 w-3.5 text-[#fbbc04] shrink-0" />
                                <span className="text-xs text-[#9aa0a6]">not mapped</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
