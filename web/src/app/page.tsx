'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  Activity, 
  MapPin, 
  Wind, 
  BarChart3, 
  RefreshCw, 
  Database,
  CloudLightning,
  AlertCircle
} from 'lucide-react';
import DashboardCharts from '@/components/DashboardCharts';

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
  const [stations, setStations] = useState<Station[]>([]);
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const response = await fetch('/api/stations');
      if (!response.ok) throw new Error('Failed to fetch stations');
      const data: Station[] = await response.json();
      setStations(data);
      
      // Default to first station if none is selected
      if (data.length > 0 && !activeStationId) {
        setActiveStationId(data[0].id);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Database connection error. Ensure Docker services are running.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeStationId]);

  const fetchReadings = useCallback(async (stationId: string) => {
    try {
      const response = await fetch(`/api/readings?stationId=${stationId}`);
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
    const interval = setInterval(() => fetchStations(true), 5000);
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
    if (val === null || val === undefined) return { label: 'Offline', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', border: 'border-l-slate-400' };
    if (val <= 12) return { label: 'Good', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50', border: 'border-l-emerald-500' };
    if (val <= 35.4) return { label: 'Moderate', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50', border: 'border-l-amber-500' };
    if (val <= 55.4) return { label: 'Sensitive', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50', border: 'border-l-orange-500' };
    return { label: 'Unhealthy', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50', border: 'border-l-rose-500' };
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation / Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/10">
            <Wind className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">EnviSense</h1>
            <p className="text-xs text-slate-400 font-medium">Environmental Quality Control Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-border">
            {error ? (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-rose-500">Database Offline</span>
              </>
            ) : (
              <>
                <Database className="h-3.5 w-3.5 text-emerald-500" />
                <span>Live Feed Connected</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-border">
            <Activity className={`h-3.5 w-3.5 text-blue-500 ${isRefreshing ? 'animate-pulse' : ''}`} />
            <span>Poll Active (10s)</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl">
          <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-800 dark:text-rose-400 text-sm">System Error</h4>
            <p className="text-xs text-rose-600 dark:text-rose-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Station list */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-sm flex flex-col flex-1 h-[450px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-slate-400" />
                <h3 className="font-bold text-md text-slate-700 dark:text-slate-300">Observation Stations</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{stations.length} Registered</span>
            </div>

            {/* List scroll wrapper */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : stations.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
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
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 relative overflow-hidden ${status.border} border-l-4 ${
                        isActive 
                          ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 shadow-sm' 
                          : 'bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{station.name}</h4>
                          <span className="text-xs text-slate-400 font-medium">Code: {station.code}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      {station.latestReading ? (
                        <div className="grid grid-cols-3 gap-2 mt-1 text-center">
                          <div className="bg-slate-100/50 dark:bg-slate-800/80 p-1.5 rounded-lg border border-border/40">
                            <span className="block text-[9px] font-medium text-slate-400">PM2.5</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{station.latestReading.pm25}</span>
                          </div>
                          <div className="bg-slate-100/50 dark:bg-slate-800/80 p-1.5 rounded-lg border border-border/40">
                            <span className="block text-[9px] font-medium text-slate-400">PM10</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{station.latestReading.pm10}</span>
                          </div>
                          <div className="bg-slate-100/50 dark:bg-slate-800/80 p-1.5 rounded-lg border border-border/40">
                            <span className="block text-[9px] font-medium text-slate-400">TSP</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{station.latestReading.tsp}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-amber-500 italic mt-1 flex items-center gap-1">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Waiting for live stream telemetry...
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

      {/* Selected Station Summary & Charts */}
      {activeStation && (
        <section className="space-y-6">
          {/* Summary Panel */}
          <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-xl">
                <BarChart3 className="h-5.5 w-5.5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{activeStation.name} Telemetry</h3>
                <p className="text-xs text-slate-400 font-medium">Latitude: {activeStation.latitude.toFixed(4)}, Longitude: {activeStation.longitude.toFixed(4)}</p>
              </div>
            </div>

            {activeStation.latestReading && (
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-400">PM2.5:</span>
                  <span className="text-slate-700 dark:text-slate-300">{activeStation.latestReading.pm25} µg/m³</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-400">PM10:</span>
                  <span className="text-slate-700 dark:text-slate-300">{activeStation.latestReading.pm10} µg/m³</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-400">TSP:</span>
                  <span className="text-slate-700 dark:text-slate-300">{activeStation.latestReading.tsp} µg/m³</span>
                </div>
              </div>
            )}
          </div>

          {/* Historical Area Line Charts */}
          <DashboardCharts readings={readings} stationName={activeStation.name} />
        </section>
      )}
    </div>
  );
}
