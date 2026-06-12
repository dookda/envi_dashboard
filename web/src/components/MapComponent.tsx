'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapComponentProps {
  stations: unknown[];
  activeStationId: string | null;
  onSelectStation: (stationId: string) => void;
}

export default function MapComponent({ }: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
            maxzoom: 19,
          },
        },
        layers: [
          { id: 'osm', type: 'raster', source: 'osm' },
        ],
      },
      center: [101.0, 15.0],
      zoom: 3,
      pitch: 20,
    });

    map.on('load', () => {
      (map as any).setProjection({ type: 'globe' });
    });

    map.addControl(new maplibregl.NavigationControl({}), 'top-right');

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return <div ref={containerRef} className="w-full h-full rounded-3xl overflow-hidden" />;
}
