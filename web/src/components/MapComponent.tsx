'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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

interface MapComponentProps {
  stations: Station[];
  activeStationId: string | null;
  onSelectStation: (stationId: string) => void;
}

// Map center controller to pan map when active station changes
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapComponent({ stations, activeStationId, onSelectStation }: MapComponentProps) {
  const defaultCenter: [number, number] = [13.7563, 100.5018];
  
  const activeStation = stations.find(s => s.id === activeStationId);
  const center: [number, number] = activeStation 
    ? [activeStation.latitude, activeStation.longitude] 
    : defaultCenter;

  const getPM25Color = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'bg-slate-400';
    if (val <= 12) return 'bg-emerald-500';
    if (val <= 35.4) return 'bg-amber-500';
    if (val <= 55.4) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  const createCustomMarker = (pm25: number | null | undefined, isActive: boolean) => {
    const colorClass = getPM25Color(pm25);
    const borderClass = isActive ? 'border-2 border-white ring-4 ring-blue-500/40 scale-110' : 'border-2 border-white';
    
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full ${colorClass} opacity-30"></span>
          <div class="relative flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold shadow-md transition-all duration-300 ${colorClass} ${borderClass}">
            ${pm25 !== null && pm25 !== undefined ? Math.round(pm25) : '-'}
          </div>
        </div>
      `,
      className: 'custom-leaflet-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {stations.map(station => {
          const pm25 = station.latestReading?.pm25;
          const isActive = station.id === activeStationId;
          const markerIcon = createCustomMarker(pm25, isActive);

          return (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onSelectStation(station.id),
              }}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{station.name}</h4>
                  <p className="text-xs text-slate-500 mb-2">Code: {station.code}</p>
                  {station.latestReading ? (
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mt-1">
                      <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded">
                        <div className="text-slate-400 font-medium">PM2.5</div>
                        <div className="font-bold text-slate-700 dark:text-white">{station.latestReading.pm25}</div>
                      </div>
                      <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded">
                        <div className="text-slate-400 font-medium">PM10</div>
                        <div className="font-bold text-slate-700 dark:text-white">{station.latestReading.pm10}</div>
                      </div>
                      <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded">
                        <div className="text-slate-400 font-medium">TSP</div>
                        <div className="font-bold text-slate-700 dark:text-white">{station.latestReading.tsp}</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-500">No recent data available</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        {activeStation && <MapController center={[activeStation.latitude, activeStation.longitude]} />}
      </MapContainer>
    </div>
  );
}
