'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

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

function getPM25Color(val: number | null | undefined): string {
  if (val === null || val === undefined) return '#94a3b8';
  if (val <= 12) return '#10b981';
  if (val <= 35.4) return '#f59e0b';
  if (val <= 55.4) return '#f97316';
  return '#f43f5e';
}

function createMarkerElement(pm25: number | null | undefined, isActive: boolean): HTMLElement {
  const color = getPM25Color(pm25);
  const label = pm25 !== null && pm25 !== undefined ? Math.round(pm25).toString() : '-';
  const ring = isActive ? 'box-shadow:0 0 0 4px rgba(59,130,246,0.4);transform:scale(1.1);' : '';

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;cursor:pointer;';

  const ping = document.createElement('span');
  ping.style.cssText = `position:absolute;width:24px;height:24px;border-radius:50%;background:${color};opacity:0.3;animation:ml-ping 1.5s cubic-bezier(0,0,0.2,1) infinite;`;

  const circle = document.createElement('div');
  circle.style.cssText = `position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:${color};color:white;font-size:10px;font-weight:700;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.25);transition:all 0.3s;${ring}`;
  circle.textContent = label;

  wrapper.appendChild(ping);
  wrapper.appendChild(circle);
  return wrapper;
}

function createPopupHTML(station: Station): string {
  const r = station.latestReading;
  const cell = (label: string, val: number) =>
    `<div style="padding:4px;background:#f1f3f4;border-radius:4px;text-align:center;">
      <div style="color:#9aa0a6;font-size:10px;font-weight:500;">${label}</div>
      <div style="font-weight:700;color:#202124;font-size:12px;">${val}</div>
    </div>`;

  const body = r
    ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px;">${cell('PM2.5', r.pm25)}${cell('PM10', r.pm10)}${cell('TSP', r.tsp)}</div>`
    : `<p style="font-size:11px;color:#f59e0b;margin:4px 0 0;">No recent data available</p>`;

  return `<div style="font-family:system-ui,sans-serif;padding:2px;">
    <h4 style="font-weight:600;font-size:13px;margin:0 0 2px;color:#202124;">${station.name}</h4>
    <p style="font-size:11px;color:#5f6368;margin:0;">${station.code}</p>
    ${body}
  </div>`;
}

export default function MapComponent({ stations, activeStationId, onSelectStation }: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
      },
      center: [100.5018, 13.7563],
      zoom: 11,
    });

    map.addControl(new maplibregl.NavigationControl({}), 'top-right');
    mapRef.current = map;

    if (!document.getElementById('ml-ping-style')) {
      const style = document.createElement('style');
      style.id = 'ml-ping-style';
      style.textContent = '@keyframes ml-ping{75%,100%{transform:scale(2);opacity:0}}';
      document.head.appendChild(style);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    stations.forEach(station => {
      const pm25 = station.latestReading?.pm25;
      const isActive = station.id === activeStationId;
      const el = createMarkerElement(pm25, isActive);
      el.addEventListener('click', () => onSelectStation(station.id));

      const popup = new maplibregl.Popup({ offset: 20, closeButton: false, maxWidth: '220px' })
        .setHTML(createPopupHTML(station));

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current[station.id] = marker;
    });
  }, [stations, activeStationId, onSelectStation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeStationId) return;
    const station = stations.find(s => s.id === activeStationId);
    if (station) {
      map.easeTo({ center: [station.longitude, station.latitude] });
    }
  }, [activeStationId, stations]);

  return <div ref={containerRef} className="w-full h-full" />;
}
