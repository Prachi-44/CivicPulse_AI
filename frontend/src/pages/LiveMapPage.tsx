import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '../components/MapView';
import { IncidentModal } from '../components/IncidentModal';
import { mapApi } from '../api/client';
import { Incident, HotspotCluster } from '../types';

export const LiveMapPage: React.FC = () => {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [inspectModalId, setInspectModalId] = useState<string | null>(null);

  const [isPickerMode, setIsPickerMode] = useState<boolean>(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (wardFilter !== 'all') params.ward = wardFilter;

      const [mapRes, hotspotRes] = await Promise.all([
        mapApi.getGeoJSON(params),
        mapApi.getHotspots()
      ]);

      const features = mapRes.data?.features || [];
      const incList: Incident[] = features.map((f: any) => ({
        id: f.properties.id,
        incident_code: f.properties.incident_code,
        title: f.properties.title,
        description: f.properties.description,
        category: f.properties.category,
        priority: f.properties.priority,
        status: f.properties.status,
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
        address: f.properties.address,
        ward: f.properties.ward,
        ai_confidence_score: f.properties.ai_confidence_score,
        is_duplicate: f.properties.is_duplicate,
        severity_score: f.properties.severity_score,
        created_at: f.properties.created_at,
        updated_at: f.properties.updated_at
      }));

      setIncidents(incList);
      setHotspots(hotspotRes.data?.hotspots || []);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, statusFilter, priorityFilter, wardFilter]);

  // Counts by category
  const catCounts = {
    all: incidents.length,
    pothole: incidents.filter((i) => i.category === 'pothole').length,
    garbage: incidents.filter((i) => i.category === 'garbage').length,
    water_leakage: incidents.filter((i) => i.category === 'water_leakage').length,
    streetlight: incidents.filter((i) => i.category === 'streetlight').length,
    drainage: incidents.filter((i) => i.category === 'drainage').length
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-[#0d1322] text-slate-800 dark:text-[#dde2f8] transition-colors duration-200">
      
      {/* ── TOP TELEMETRY & MULTI-FILTER CONTROL DECK ──────────────── */}
      <section className="w-full px-4 sm:px-8 py-4 border-b border-slate-200 dark:border-[#3d494c]/30 bg-white/95 dark:bg-[#151b2b]/90 backdrop-blur-md shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Location & Ward Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-[#242a3a] text-cyan-600 dark:text-[#4cd7f6] shadow-xs flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">satellite_alt</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-slate-900 dark:text-[#dde2f8]">
                  Pune Urban Spatial Ops
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-[#4cd7f6]/10 text-cyan-800 dark:text-[#4cd7f6] font-mono text-[10px] uppercase font-bold tracking-wider">
                  PostGIS Live Layer
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#bcc9cd] flex items-center gap-2 font-mono">
                <span>EPSG:4326 / WGS84</span>
                <span className="text-slate-300 dark:text-[#3d494c]">•</span>
                <span className="text-cyan-600 dark:text-[#5de6ff]">PMC-KOTHRUD-GATEWAY-09</span>
              </p>
            </div>
          </div>

          {/* Ward Selector & Global Stats Summary */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#242a3a] border border-slate-200 dark:border-[#3d494c]/40">
                <span className="material-symbols-outlined text-cyan-600 dark:text-[#4cd7f6] text-[18px]">account_balance</span>
                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 dark:text-[#dde2f8] font-mono focus:outline-none w-full cursor-pointer pr-4"
                >
                  <option value="all" className="bg-white dark:bg-[#151b2b]">All Pune Administrative Wards</option>
                  <option value="Kothrud" className="bg-white dark:bg-[#151b2b]">PMC Ward 14 - Kothrud</option>
                  <option value="Shivajinagar" className="bg-white dark:bg-[#151b2b]">PMC Ward 09 - Shivajinagar</option>
                  <option value="Hadapsar" className="bg-white dark:bg-[#151b2b]">PMC Ward 21 - Hadapsar</option>
                  <option value="Aundh" className="bg-white dark:bg-[#151b2b]">PMC Ward 08 - Aundh</option>
                  <option value="Baner" className="bg-white dark:bg-[#151b2b]">PMC Ward 02 - Baner</option>
                  <option value="Kasba" className="bg-white dark:bg-[#151b2b]">PMC Ward 16 - Kasba Peth</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#080e1d] border border-slate-200 dark:border-[#3d494c]/40">
              <span className="font-mono text-[10px] uppercase text-slate-500 dark:text-[#bcc9cd]">Active Incidents</span>
              <span className="font-mono text-xs font-bold text-cyan-600 dark:text-[#4cd7f6]">{incidents.length}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping ml-0.5"></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#080e1d] border border-slate-200 dark:border-[#3d494c]/40">
              <span className="font-mono text-[10px] uppercase text-slate-500 dark:text-[#bcc9cd]">Clusters</span>
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-[#ffb95f]">{hotspots.length}</span>
            </div>

            {/* Location Picker Toggle */}
            <button
              onClick={() => setIsPickerMode(!isPickerMode)}
              className={`px-3 py-2 rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPickerMode
                  ? 'bg-[#06b6d4] text-white dark:text-[#003640] shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#242a3a] dark:hover:bg-[#2f3445] text-cyan-700 dark:text-[#4cd7f6]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
              <span>{isPickerMode ? 'Picker Active' : 'Pick Location'}</span>
            </button>

            {/* Refresh */}
            <button
              onClick={loadData}
              title="Refresh spatial telemetry"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#242a3a] dark:hover:bg-[#2f3445] text-slate-600 dark:text-[#bcc9cd] hover:text-cyan-600 dark:hover:text-[#4cd7f6] transition-all cursor-pointer border border-slate-200 dark:border-[#3d494c]/40"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
          </div>
        </div>

        {/* Filter Matrix: Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-200 dark:border-[#3d494c]/20">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Incidents', count: catCounts.all },
              { id: 'pothole', label: 'Potholes', count: catCounts.pothole, icon: 'warning', color: 'text-amber-500' },
              { id: 'garbage', label: 'Solid Waste', count: catCounts.garbage, icon: 'delete_sweep', color: 'text-sky-500' },
              { id: 'water_leakage', label: 'Water Mains', count: catCounts.water_leakage, icon: 'water_drop', color: 'text-cyan-500' },
              { id: 'streetlight', label: 'Streetlights', count: catCounts.streetlight, icon: 'lightbulb', color: 'text-blue-500' },
              { id: 'drainage', label: 'Drainage / Flooding', count: catCounts.drainage, icon: 'flood', color: 'text-red-500' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-[#06b6d4] text-white dark:text-[#003640] font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#242a3a] dark:hover:bg-[#2f3445] text-slate-700 dark:text-[#dde2f8]'
                }`}
              >
                {cat.icon && (
                  <span className={`material-symbols-outlined text-[14px] ${categoryFilter === cat.id ? 'text-white dark:text-[#003640]' : cat.color}`}>
                    {cat.icon}
                  </span>
                )}
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full font-bold text-[10px] ${
                  categoryFilter === cat.id
                    ? 'bg-white/20 text-white dark:bg-[#003640]/30 dark:text-[#003640]'
                    : 'bg-white dark:bg-[#080e1d] text-slate-600 dark:text-[#bcc9cd]'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-100 dark:bg-[#242a3a] text-xs font-mono text-slate-800 dark:text-[#dde2f8] rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-[#3d494c]/40 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#151b2b]">All Statuses</option>
              <option value="reported" className="bg-white dark:bg-[#151b2b]">Reported</option>
              <option value="under_review" className="bg-white dark:bg-[#151b2b]">Under Review</option>
              <option value="assigned" className="bg-white dark:bg-[#151b2b]">Assigned</option>
              <option value="in_progress" className="bg-white dark:bg-[#151b2b]">In Progress</option>
              <option value="resolved" className="bg-white dark:bg-[#151b2b]">Resolved</option>
              <option value="verified" className="bg-white dark:bg-[#151b2b]">Verified</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-100 dark:bg-[#242a3a] text-xs font-mono text-slate-800 dark:text-[#dde2f8] rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-[#3d494c]/40 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#151b2b]">All Priorities</option>
              <option value="critical" className="bg-white dark:bg-[#151b2b]">Critical</option>
              <option value="high" className="bg-white dark:bg-[#151b2b]">High</option>
              <option value="medium" className="bg-white dark:bg-[#151b2b]">Medium</option>
              <option value="low" className="bg-white dark:bg-[#151b2b]">Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── MAP CONTAINER & SLIDEOVER DETAILS ─────────────────────── */}
      <div className="relative flex-1 w-full grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
        
        {/* Main Map View */}
        <div className={`${selectedIncident ? 'lg:col-span-8' : 'lg:col-span-12'} h-[calc(100vh-13rem)] w-full transition-all duration-300`}>
          <MapView
            incidents={incidents}
            hotspots={hotspots}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onSelectLocation={(coords) => {
              setPickedLocation(coords);
              if (isPickerMode) {
                // Pre-fill location and prompt citizen submission
                if (window.confirm(`Selected Location: ${coords.lat}, ${coords.lng}. Proceed to report an issue at this location?`)) {
                  navigate(`/citizen?lat=${coords.lat}&lng=${coords.lng}`);
                }
              }
            }}
            isPickerMode={isPickerMode}
          />
        </div>

        {/* Selected Incident Drawer */}
        {selectedIncident && (
          <div className="lg:col-span-4 bg-white dark:bg-[#151b2b] border-l border-slate-200 dark:border-[#3d494c]/40 p-6 flex flex-col justify-between overflow-y-auto h-[calc(100vh-13rem)] shadow-lg animate-slide-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-600 dark:text-[#4cd7f6]">
                  {selectedIncident.incident_code}
                </span>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-[#bcc9cd] dark:hover:text-[#dde2f8] hover:bg-slate-100 dark:hover:bg-[#242a3a]"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-[#dde2f8]">
                  {selectedIncident.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#bcc9cd] mt-1 leading-relaxed">
                  {selectedIncident.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#191f2f] border border-slate-200 dark:border-[#3d494c]/30 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 dark:text-[#869397] block text-[10px]">CATEGORY</span>
                  <span className="text-sky-700 dark:text-[#5de6ff] uppercase font-semibold">{selectedIncident.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-[#869397] block text-[10px]">PRIORITY</span>
                  <span className={`uppercase font-bold ${
                    selectedIncident.priority === 'critical' ? 'text-red-600 dark:text-[#ffb4ab]' :
                    selectedIncident.priority === 'high' ? 'text-amber-600 dark:text-[#ffb95f]' : 'text-cyan-600 dark:text-[#4cd7f6]'
                  }`}>
                    {selectedIncident.priority}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-[#869397] block text-[10px]">STATUS</span>
                  <span className="text-emerald-600 dark:text-[#34d399] uppercase font-bold">{selectedIncident.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-[#869397] block text-[10px]">WARD</span>
                  <span className="text-slate-800 dark:text-[#dde2f8]">{selectedIncident.ward || 'Pune'}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#080e1d] border border-slate-200 dark:border-[#3d494c]/30 font-mono text-[11px] text-slate-600 dark:text-[#bcc9cd] flex items-center justify-between">
                <span>Coordinates:</span>
                <span className="text-slate-900 dark:text-[#dde2f8] font-bold">
                  {selectedIncident.latitude.toFixed(4)}° N, {selectedIncident.longitude.toFixed(4)}° E
                </span>
              </div>

              {selectedIncident.is_duplicate && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-[#f59e0b]/15 border border-amber-200 dark:border-[#f59e0b]/30 text-xs text-amber-800 dark:text-[#ffb95f]">
                  ⚠ <strong>Proximity Alert:</strong> Multiple complaints registered in this 35m zone. Grouped for collective municipal dispatch.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-[#3d494c]/30 flex flex-col gap-2">
              <button
                onClick={() => setInspectModalId(selectedIncident.id)}
                className="w-full py-2.5 rounded-xl bg-[#06b6d4] text-white dark:text-[#003640] font-['Space_Grotesk'] text-xs font-bold shadow-md hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Inspect Full Telemetry & Logs</span>
              </button>
              <button
                onClick={() => setSelectedIncident(null)}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-[#242a3a] text-slate-700 dark:text-[#bcc9cd] font-mono text-xs hover:bg-slate-200 dark:hover:bg-[#2f3445] transition-all cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Modal Viewer */}
      {inspectModalId && (
        <IncidentModal
          incidentId={inspectModalId}
          onClose={() => setInspectModalId(null)}
          onUpdated={() => loadData()}
        />
      )}
    </div>
  );
};
