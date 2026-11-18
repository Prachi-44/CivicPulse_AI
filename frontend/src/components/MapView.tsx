import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Incident, HotspotCluster } from '../types';
import { useTheme } from '../context/ThemeContext';

interface MapViewProps {
  incidents: Incident[];
  hotspots?: HotspotCluster[];
  showHotspots?: boolean;
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  onSelectLocation?: (coords: { lat: number; lng: number }) => void;
  isPickerMode?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  incidents,
  hotspots = [],
  showHotspots = true,
  selectedIncident,
  onSelectIncident,
  onSelectLocation,
  isPickerMode = false
}) => {
  const { isDark } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});
  const pickerMarkerRef = useRef<maplibregl.Marker | null>(null);

  const getMapStyle = (dark: boolean): maplibregl.StyleSpecification => {
    const baseTile = dark
      ? 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      : 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    const labelTile = dark
      ? 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
      : 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}';

    return {
      version: 8,
      sources: {
        'esri-base': {
          type: 'raster',
          tiles: [baseTile],
          tileSize: 256,
          attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap'
        },
        'esri-labels': {
          type: 'raster',
          tiles: [labelTile],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'esri-base-layer',
          type: 'raster',
          source: 'esri-base',
          minzoom: 0,
          maxzoom: 19
        },
        {
          id: 'esri-labels-layer',
          type: 'raster',
          source: 'esri-labels',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getMapStyle(isDark),
      center: [73.8567, 18.5204],
      zoom: 12.5,
      pitch: 15
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.current.on('click', (e) => {
      if (onSelectLocation) {
        const { lat, lng } = e.lngLat;
        onSelectLocation({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
        
        if (pickerMarkerRef.current) {
          pickerMarkerRef.current.setLngLat([lng, lat]);
        } else if (map.current) {
          const el = document.createElement('div');
          el.className = 'w-6 h-6 rounded-full bg-[#06b6d4] border-2 border-white shadow-[0_0_12px_#06b6d4] animate-bounce';
          pickerMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map.current);
        }
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style when theme toggles
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(getMapStyle(isDark));
    }
  }, [isDark]);

  // Update markers when incidents change
  useEffect(() => {
    if (!map.current) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    incidents.forEach((inc) => {
      if (!inc.latitude || !inc.longitude) return;

      const el = document.createElement('div');
      el.className = 'cursor-pointer transform hover:scale-125 transition-transform duration-200';

      let colorClass = 'bg-[#06b6d4] shadow-[0_0_10px_#06b6d4] text-white';
      if (inc.priority === 'critical') colorClass = 'bg-[#ef4444] shadow-[0_0_12px_#ef4444] animate-pulse text-white';
      else if (inc.priority === 'high') colorClass = 'bg-[#f59e0b] shadow-[0_0_10px_#f59e0b] text-white';
      else if (inc.status === 'resolved' || inc.status === 'verified') colorClass = 'bg-[#10b981] shadow-[0_0_10px_#10b981] text-white';

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full ${colorClass} border-2 ${isDark ? 'border-[#0d1322]' : 'border-white'} flex items-center justify-center text-[10px] font-bold shadow-md">
            ${inc.category === 'pothole' ? 'P' : inc.category === 'garbage' ? 'G' : inc.category === 'water_leakage' ? 'W' : inc.category === 'streetlight' ? 'L' : 'D'}
          </div>
          ${inc.is_duplicate ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-white"></span>' : ''}
        </div>
      `;

      el.addEventListener('click', () => {
        onSelectIncident?.(inc);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([inc.longitude, inc.latitude])
        .addTo(map.current!);

      markersRef.current[inc.id] = marker;
    });
  }, [incidents, isDark, onSelectIncident]);

  // Center on selected incident
  useEffect(() => {
    if (selectedIncident && map.current && selectedIncident.latitude && selectedIncident.longitude) {
      map.current.flyTo({
        center: [selectedIncident.longitude, selectedIncident.latitude],
        zoom: 14.5,
        duration: 900
      });
    }
  }, [selectedIncident]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-200 dark:border-[#3d494c]/40 shadow-xl transition-colors duration-200">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating HUD info overlay */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-2">
        <div className="px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#0d1322]/90 border border-slate-200 dark:border-[#3d494c]/50 backdrop-blur-md shadow-md flex items-center gap-2 font-mono text-[11px] text-slate-800 dark:text-[#dde2f8]">
          <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-ping"></span>
          <span>
            EPSG:4326 • PUNE URBAN MESH • {incidents.length} NODES
          </span>
        </div>
        {isPickerMode && (
          <div className="px-3.5 py-1.5 rounded-xl bg-[#06b6d4]/15 dark:bg-[#06b6d4]/20 border border-[#06b6d4]/40 backdrop-blur-md text-[11px] font-mono text-[#0891b2] dark:text-[#4cd7f6] font-semibold">
            📍 Click anywhere on map to pin GPS coordinates
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/95 dark:bg-[#0d1322]/90 border border-slate-200 dark:border-[#3d494c]/50 backdrop-blur-md rounded-2xl p-3.5 shadow-lg flex flex-col gap-1.5 font-mono text-[10px] text-slate-600 dark:text-[#bcc9cd]">
        <div className="text-slate-900 dark:text-[#dde2f8] font-bold text-[11px] mb-0.5 uppercase">PRIORITY TIERS</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-sm"></span>
          <span>Critical Emergency</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-sm"></span>
          <span>High Severity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-sm"></span>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-sm"></span>
          <span>Resolved / Verified</span>
        </div>
      </div>
    </div>
  );
};
