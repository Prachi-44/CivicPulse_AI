import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { dashboardApi, incidentApi, mapApi } from '../api/client';
import { DashboardKPIs, Incident, HotspotCluster } from '../types';
import { IncidentModal } from '../components/IncidentModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const CommandCenter: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { isDark } = useTheme();

  const [kpis, setKpis] = useState<DashboardKPIs>({
    total_reports: 0,
    open_incidents: 0,
    critical_incidents: 0,
    in_progress_incidents: 0,
    resolved_incidents: 0,
    overdue_incidents: 0
  });

  const [categoryDist, setCategoryDist] = useState<any[]>([]);
  const [wardBreakdown, setWardBreakdown] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [inspectModalId, setInspectModalId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'analytics' | 'hotspots'>('queue');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpiRes, incRes, mapRes, analyticsRes] = await Promise.all([
        dashboardApi.getKPIs(),
        incidentApi.list({ limit: 100 }),
        mapApi.getHotspots(),
        dashboardApi.getAnalytics()
      ]);

      if (kpiRes.data?.kpis) setKpis(kpiRes.data.kpis);
      if (kpiRes.data?.category_distribution) setCategoryDist(kpiRes.data.category_distribution);
      if (kpiRes.data?.ward_breakdown) setWardBreakdown(kpiRes.data.ward_breakdown);
      if (incRes.data?.data) setIncidents(incRes.data.data);
      if (mapRes.data?.hotspots) setHotspots(mapRes.data.hotspots);
      if (analyticsRes.data?.daily_trend) setDailyTrend(analyticsRes.data.daily_trend);
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: incidents.map((i) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [i.longitude, i.latitude] },
        properties: { ...i }
      }))
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pune_civicpulse_incidents_${Date.now()}.geojson`;
    a.click();
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter((i) => {
    const matchSearch =
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.incident_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.ward || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchCat = categoryFilter === 'all' || i.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-[#0d1322] text-slate-800 dark:text-[#dde2f8] flex flex-col transition-colors duration-200">
      
      {/* ── COMMAND OPERATIONS HEADER STRIP ────────────────────────── */}
      <div className="w-full px-4 sm:px-8 py-5 border-b border-slate-200 dark:border-[#3d494c]/30 bg-white/95 dark:bg-[#151b2b]/90 backdrop-blur-xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-700 dark:text-[#5de6ff] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#242a3a] font-semibold">
                TELEMETRY NODE: PMC-HQ-CENTRAL
              </span>
              <span className="text-slate-300 dark:text-[#3d494c]">•</span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-[#bcc9cd]">OPERATIONS WATCH: SHIFT-A</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#dde2f8]">
                Municipal Response Deck
              </h1>
              <span className="font-mono text-xs text-cyan-600 dark:text-[#4cd7f6] font-semibold">[PUNE URBAN OBSERVATORY]</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-[#080e1d] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#3d494c]/40 gap-3">
              <div className="flex flex-col text-right">
                <span className="font-mono text-[9px] text-slate-500 dark:text-[#bcc9cd]">INFERENCE PIPELINE</span>
                <span className="font-mono text-xs font-semibold text-cyan-700 dark:text-[#5de6ff]">OpenCV & NLP Engine</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]"></div>
            </div>

            <button
              onClick={handleExportGeoJSON}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#242a3a] dark:hover:bg-[#2f3445] text-xs font-mono font-semibold text-slate-700 dark:text-[#dde2f8] flex items-center gap-1.5 border border-slate-200 dark:border-[#3d494c]/40 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-cyan-600 dark:text-[#4cd7f6]">download</span>
              <span>Export GeoJSON</span>
            </button>

            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-xl bg-[#06b6d4] hover:bg-cyan-500 text-xs font-['Space_Grotesk'] font-bold text-white dark:text-[#003640] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 py-6 space-y-6">
        
        {/* ── TOP KPI TELEMETRY ROW (4 Cards) ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          
          {/* Card 1: Total Reports */}
          <div className="relative bg-white dark:bg-[#151b2b] p-5 rounded-2xl border border-slate-200 dark:border-[#3d494c]/40 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#bcc9cd]">AGGREGATE INTAKE</span>
                <span className="font-['Space_Grotesk'] text-sm font-semibold text-slate-800 dark:text-[#dde2f8] mt-0.5">Total Reported</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#242a3a] flex items-center justify-center text-cyan-600 dark:text-[#4cd7f6]">
                <span className="material-symbols-outlined text-[18px]">inbox</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-slate-900 dark:text-[#dde2f8] tracking-tight">
                {kpis.total_reports}
              </span>
              <div className="flex items-center gap-1 text-cyan-700 dark:text-[#5de6ff] font-mono text-[11px]">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>Live Ingested</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#3d494c]/20 text-[10px] font-mono text-slate-500 dark:text-[#bcc9cd] flex justify-between">
              <span>Citizen + Sensor Grid</span>
              <span className="text-cyan-600 dark:text-[#5de6ff]">100% synced</span>
            </div>
          </div>

          {/* Card 2: Active in Triage */}
          <div className="relative bg-white dark:bg-[#151b2b] p-5 rounded-2xl border border-slate-200 dark:border-[#3d494c]/40 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#bcc9cd]">DISPATCH QUEUE</span>
                <span className="font-['Space_Grotesk'] text-sm font-semibold text-slate-800 dark:text-[#dde2f8] mt-0.5">Active in Triage</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#242a3a] flex items-center justify-center text-sky-600 dark:text-[#5de6ff]">
                <span className="material-symbols-outlined text-[18px]">alt_route</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-sky-600 dark:text-[#5de6ff] tracking-tight">
                {kpis.open_incidents + kpis.in_progress_incidents}
              </span>
              <div className="flex items-center gap-1 text-cyan-700 dark:text-[#4cd7f6] font-mono text-[11px]">
                <span>{kpis.in_progress_incidents} with QRT</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#3d494c]/20 text-[10px] font-mono text-slate-500 dark:text-[#bcc9cd] flex justify-between">
              <span>Dynamic AI Allocation</span>
              <span className="text-cyan-600 dark:text-[#4cd7f6]">&lt;45s Median</span>
            </div>
          </div>

          {/* Card 3: SLA Critical Breach */}
          <div className="relative bg-white dark:bg-[#151b2b] p-5 rounded-2xl border border-slate-200 dark:border-[#3d494c]/40 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-red-600 dark:text-[#ffb4ab]">ESCALATION ALERT</span>
                <span className="font-['Space_Grotesk'] text-sm font-semibold text-slate-800 dark:text-[#dde2f8] mt-0.5">Critical Emergency</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-[#93000a]/30 flex items-center justify-center text-red-600 dark:text-[#ffb4ab]">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-red-600 dark:text-[#ffb4ab] tracking-tight">
                {kpis.critical_incidents}
              </span>
              <div className="flex items-center gap-1 text-red-600 dark:text-[#ffb4ab] font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>Immediate Action</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#3d494c]/20 text-[10px] font-mono text-slate-500 dark:text-[#bcc9cd] flex justify-between">
              <span>Overdue Breaches: {kpis.overdue_incidents}</span>
              <span className="text-red-600 dark:text-[#ffb4ab] font-bold">Urgent</span>
            </div>
          </div>

          {/* Card 4: Resolved / Verified */}
          <div className="relative bg-white dark:bg-[#151b2b] p-5 rounded-2xl border border-slate-200 dark:border-[#3d494c]/40 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-[#34d399]">VERIFICATION LEDGER</span>
                <span className="font-['Space_Grotesk'] text-sm font-semibold text-slate-800 dark:text-[#dde2f8] mt-0.5">Resolved & Verified</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-[#10b981]/20 flex items-center justify-center text-emerald-600 dark:text-[#34d399]">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-emerald-600 dark:text-[#34d399] tracking-tight">
                {kpis.resolved_incidents}
              </span>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-[#34d399] font-mono text-[11px]">
                <span>Citizen Confirmed</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#3d494c]/20 text-[10px] font-mono text-slate-500 dark:text-[#bcc9cd] flex justify-between">
              <span>Proof-of-Work Required</span>
              <span className="text-emerald-600 dark:text-[#34d399] font-semibold">Audit Clean</span>
            </div>
          </div>
        </div>

        {/* ── SUB-TAB NAVIGATION ────────────────────────────────────── */}
        <div className="flex border-b border-slate-200 dark:border-[#3d494c]/30">
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-3 px-5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'border-[#06b6d4] text-cyan-600 dark:text-[#4cd7f6]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#bcc9cd] dark:hover:text-[#dde2f8]'
            }`}
          >
            Incident Dispatch Queue ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-[#06b6d4] text-cyan-600 dark:text-[#4cd7f6]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#bcc9cd] dark:hover:text-[#dde2f8]'
            }`}
          >
            Municipal Analytics & SLA
          </button>
          <button
            onClick={() => setActiveTab('hotspots')}
            className={`py-3 px-5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'hotspots'
                ? 'border-[#06b6d4] text-cyan-600 dark:text-[#4cd7f6]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#bcc9cd] dark:hover:text-[#dde2f8]'
            }`}
          >
            DBSCAN Hotspot Clusters ({hotspots.length})
          </button>
        </div>

        {/* ── TAB CONTENT: INCIDENT QUEUE ────────────────────────────── */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            
            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xs">
              <div className="relative flex-1 min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 dark:text-[#bcc9cd] text-lg">search</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search code, issue title, or ward..."
                  className="w-full bg-slate-50 dark:bg-[#080e1d] text-xs text-slate-900 dark:text-[#dde2f8] placeholder-slate-400 dark:placeholder-[#869397] pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-[#3d494c]/40 focus:outline-none focus:border-[#06b6d4]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-[#080e1d] text-xs font-mono text-slate-800 dark:text-[#dde2f8] px-3 py-2 rounded-lg border border-slate-200 dark:border-[#3d494c]/40 cursor-pointer"
                >
                  <option value="all" className="bg-white dark:bg-[#080e1d]">All Categories</option>
                  <option value="pothole" className="bg-white dark:bg-[#080e1d]">Potholes</option>
                  <option value="garbage" className="bg-white dark:bg-[#080e1d]">Solid Waste</option>
                  <option value="water_leakage" className="bg-white dark:bg-[#080e1d]">Water Mains</option>
                  <option value="drainage" className="bg-white dark:bg-[#080e1d]">Drainage</option>
                  <option value="streetlight" className="bg-white dark:bg-[#080e1d]">Streetlights</option>
                  <option value="road_damage" className="bg-white dark:bg-[#080e1d]">Road Damage</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-[#080e1d] text-xs font-mono text-slate-800 dark:text-[#dde2f8] px-3 py-2 rounded-lg border border-slate-200 dark:border-[#3d494c]/40 cursor-pointer"
                >
                  <option value="all" className="bg-white dark:bg-[#080e1d]">All Statuses</option>
                  <option value="reported" className="bg-white dark:bg-[#080e1d]">Reported</option>
                  <option value="under_review" className="bg-white dark:bg-[#080e1d]">Under Review</option>
                  <option value="assigned" className="bg-white dark:bg-[#080e1d]">Assigned</option>
                  <option value="in_progress" className="bg-white dark:bg-[#080e1d]">In Progress</option>
                  <option value="resolved" className="bg-white dark:bg-[#080e1d]">Resolved</option>
                  <option value="verified" className="bg-white dark:bg-[#080e1d]">Verified</option>
                </select>
              </div>
            </div>

            {/* Incidents Table */}
            <div className="rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-[#191f2f] text-slate-600 dark:text-[#bcc9cd] font-mono text-[10px] uppercase border-b border-slate-200 dark:border-[#3d494c]/40">
                    <tr>
                      <th className="py-3 px-4">Incident Code</th>
                      <th className="py-3 px-4">Title & Context</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Ward / Zone</th>
                      <th className="py-3 px-4">Assigned Dept</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#3d494c]/20 font-['Plus_Jakarta_Sans']">
                    {filteredIncidents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-[#bcc9cd] font-mono">
                          No matching incidents found in database.
                        </td>
                      </tr>
                    ) : (
                      filteredIncidents.map((inc) => (
                        <tr
                          key={inc.id}
                          className="hover:bg-slate-50 dark:hover:bg-[#191f2f]/80 transition-colors group cursor-pointer"
                          onClick={() => setInspectModalId(inc.id)}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-cyan-700 dark:text-[#4cd7f6]">
                            {inc.incident_code}
                            {inc.is_duplicate && (
                              <span className="block text-[9px] text-amber-600 dark:text-[#f59e0b] font-normal">
                                ⚠ Duplicate
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-semibold text-slate-900 dark:text-[#dde2f8] block truncate">
                              {inc.title}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-[#bcc9cd] truncate block mt-0.5">
                              {inc.address || 'Address unrecorded'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono uppercase text-[11px] text-slate-700 dark:text-[#dde2f8]">
                            {inc.category}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                              inc.priority === 'critical' ? 'bg-red-100 dark:bg-[#93000a]/40 text-red-700 dark:text-[#ffb4ab] border border-red-200 dark:border-[#ffb4ab]/30' :
                              inc.priority === 'high' ? 'bg-amber-100 dark:bg-[#e79400]/20 text-amber-800 dark:text-[#ffb95f]' :
                              inc.priority === 'medium' ? 'bg-cyan-100 dark:bg-[#06b6d4]/20 text-cyan-800 dark:text-[#4cd7f6]' :
                              'bg-slate-100 dark:bg-[#3d494c]/30 text-slate-600 dark:text-[#bcc9cd]'
                            }`}>
                              {inc.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 font-mono text-[11px] uppercase font-semibold ${
                              inc.status === 'verified' || inc.status === 'resolved' ? 'text-emerald-600 dark:text-[#34d399]' :
                              inc.status === 'in_progress' ? 'text-amber-600 dark:text-[#ffb95f]' : 'text-cyan-600 dark:text-[#4cd7f6]'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              <span>{inc.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-[#bcc9cd] text-[11px]">
                            {inc.ward || 'Central Pune'}
                          </td>
                          <td className="py-3.5 px-4 font-mono uppercase text-[10px] text-sky-700 dark:text-[#5de6ff]">
                            {inc.assigned_dept || 'Unassigned'}
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setInspectModalId(inc.id)}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-[#06b6d4] hover:text-white dark:bg-[#242a3a] dark:hover:bg-[#06b6d4] dark:hover:text-[#003640] text-cyan-700 dark:text-[#4cd7f6] font-mono text-[11px] font-semibold transition-all cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: ANALYTICS ─────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Breakdown Bar Chart */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-sm space-y-4">
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-[#dde2f8]">
                  Incident Volume by Category
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryDist} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#242a3a' : '#e2e8f0'} />
                      <XAxis dataKey="category" tick={{ fill: isDark ? '#bcc9cd' : '#64748b', fontSize: 10 }} />
                      <YAxis tick={{ fill: isDark ? '#bcc9cd' : '#64748b', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#151b2b' : '#ffffff', borderColor: isDark ? '#3d494c' : '#cbd5e1', color: isDark ? '#dde2f8' : '#0f172a', borderRadius: '0.75rem' }} />
                      <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Total Incidents" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 14-Day Ingestion Trend */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-sm space-y-4">
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-[#dde2f8]">
                  Daily Ingestion & Resolution Trend
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#242a3a' : '#e2e8f0'} />
                      <XAxis dataKey="date" tick={{ fill: isDark ? '#bcc9cd' : '#64748b', fontSize: 10 }} />
                      <YAxis tick={{ fill: isDark ? '#bcc9cd' : '#64748b', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#151b2b' : '#ffffff', borderColor: isDark ? '#3d494c' : '#cbd5e1', color: isDark ? '#dde2f8' : '#0f172a', borderRadius: '0.75rem' }} />
                      <Line type="monotone" dataKey="reports" stroke="#06b6d4" strokeWidth={2} name="Reported" />
                      <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Ward Breakdown Table */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-sm space-y-4">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-[#dde2f8]">
                Pune Ward Health & SLA Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-[#191f2f] text-slate-600 dark:text-[#bcc9cd] uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Ward Jurisdiction</th>
                      <th className="py-2.5 px-4">Active Reports</th>
                      <th className="py-2.5 px-4">Critical Tier</th>
                      <th className="py-2.5 px-4">Resolved Count</th>
                      <th className="py-2.5 px-4">Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#3d494c]/20">
                    {wardBreakdown.map((wb, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#191f2f]">
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-[#dde2f8]">{wb.ward}</td>
                        <td className="py-3 px-4 text-cyan-600 dark:text-[#4cd7f6]">{wb.count}</td>
                        <td className="py-3 px-4 text-red-600 dark:text-[#ffb4ab]">{wb.critical_count}</td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-[#34d399]">{wb.resolved_count}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-[#10b981]/20 dark:text-[#34d399] font-bold">
                            NOMINAL SLA
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: HOTSPOTS ──────────────────────────────────── */}
        {activeTab === 'hotspots' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hotspots.map((hs, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-[#ffb95f]">
                      CLUSTER #{hs.cluster_id || idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-[#ef4444]/20 dark:text-[#ffb4ab] font-mono text-[10px] font-bold">
                      {hs.dominant_priority?.toUpperCase() || 'HIGH'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-[#dde2f8]">
                      {hs.ward}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-[#bcc9cd] font-mono">
                      Dominant: <strong className="text-cyan-700 dark:text-[#4cd7f6] uppercase">{hs.dominant_category}</strong>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080e1d] font-mono text-xs text-slate-600 dark:text-[#bcc9cd] flex justify-between">
                    <span>Incident Density:</span>
                    <span className="text-slate-900 dark:text-[#dde2f8] font-bold">{hs.incident_count} reports</span>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-[#869397]">
                    <span>Centroid: {hs.centroid_lat?.toFixed(4)}, {hs.centroid_lng?.toFixed(4)}</span>
                    <span className="text-cyan-600 dark:text-[#5de6ff]">Radius: ~100m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inspector Modal */}
      {inspectModalId && (
        <IncidentModal
          incidentId={inspectModalId}
          onClose={() => setInspectModalId(null)}
          onUpdated={() => fetchData()}
        />
      )}
    </div>
  );
};
