import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { incidentApi, aiApi } from '../api/client';
import { Incident } from '../types';
import { IncidentModal } from '../components/IncidentModal';
import { useAuth } from '../context/AuthContext';

export const CitizenPortal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Form states
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('pothole');
  const [latitude, setLatitude] = useState<number>(() => {
    const latParam = searchParams.get('lat');
    return latParam ? parseFloat(latParam) : 18.5074;
  });
  const [longitude, setLongitude] = useState<number>(() => {
    const lngParam = searchParams.get('lng');
    return lngParam ? parseFloat(lngParam) : 73.8077;
  });
  const [address, setAddress] = useState<string>('Paud Road, Kothrud, Pune, Maharashtra');
  const [ward, setWard] = useState<string>('Ward 14 - Kothrud');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Real-time AI preview state
  const [aiPreview, setAiPreview] = useState<any | null>(null);
  const [analyzingAi, setAnalyzingAi] = useState<boolean>(false);

  // Submissions & tracking states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [myIncidents, setMyIncidents] = useState<Incident[]>([]);
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');

  const [inspectModalId, setInspectModalId] = useState<string | null>(null);

  // Fetch complaints
  const loadIncidents = async () => {
    setLoadingList(true);
    try {
      const [allRes, myRes] = await Promise.all([
        incidentApi.list({ limit: 50 }),
        incidentApi.getMyIncidents().catch(() => ({ data: { data: [] } }))
      ]);
      setAllIncidents(allRes.data?.data || []);
      setMyIncidents(myRes.data?.data || allRes.data?.data?.slice(0, 5) || []);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // Run real-time AI triage preview when title/desc is typed
  const triggerAiPreview = async () => {
    if (title.length < 5 && description.length < 10) return;
    setAnalyzingAi(true);
    try {
      const form = new FormData();
      form.append('incident_id', 'preview');
      form.append('title', title);
      form.append('description', description);
      form.append('category', category);
      form.append('latitude', latitude.toString());
      form.append('longitude', longitude.toString());
      if (imageFile) form.append('image', imageFile);

      const res = await aiApi.quickAnalyze(form);
      setAiPreview(res.data);
    } catch (err) {
      console.warn('AI preview endpoint error:', err);
    } finally {
      setAnalyzingAi(false);
    }
  };

  // Submit report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('address', address);
      formData.append('ward', ward);
      if (imageFile) formData.append('image', imageFile);

      const res = await incidentApi.create(formData);
      const newInc = res.data?.incident;

      setSubmitSuccess(`Report submitted successfully! Incident code: ${newInc?.incident_code || 'PUN-2025'}`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setAiPreview(null);

      // Reload
      await loadIncidents();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to submit report. Please log in first.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-[#0d1322] text-slate-800 dark:text-[#dde2f8] px-4 sm:px-8 lg:px-12 py-6 space-y-6 transition-colors duration-200">
      
      {/* ── TOP CONTEXT & LIVE CITIZEN TELEMETRY STRIP ─────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-[#4cd7f6] font-mono text-xs uppercase tracking-wider mb-1 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06b6d4]"></span>
            </span>
            Citizen Co-Audit Grid • Pune Municipal Ward 14 (Kothrud)
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#dde2f8]">
              Citizen Action & Resolution Portal
            </h1>
            <span className="hidden sm:inline-block font-mono text-[10px] text-slate-600 dark:text-[#bcc9cd] bg-slate-100 dark:bg-[#242a3a] px-2 py-0.5 rounded-full">
              v2.4 Direct
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#242a3a] border border-slate-200 dark:border-[#3d494c]/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-cyan-600 dark:text-[#5de6ff]">verified_user</span>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-slate-500 dark:text-[#bcc9cd] uppercase">Contributor Status</span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-800 dark:text-[#dde2f8]">
                {user ? user.name : 'Verified Resident'}
              </span>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#242a3a] border border-slate-200 dark:border-[#3d494c]/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-500">bolt</span>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-slate-500 dark:text-[#bcc9cd] uppercase">Impact Index</span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-amber-600 dark:text-[#ffb95f]">
                98.4<span className="text-[10px] text-slate-400 dark:text-[#bcc9cd]">/100</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ASYMMETRIC GRID (5 COLS LEFT / 7 COLS RIGHT) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: AI Fast-Report Drawer */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Geo-Telemetry Sensor Card */}
          <div className="bg-white dark:bg-[#151b2b] rounded-2xl p-5 border border-slate-200 dark:border-[#3d494c]/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-700 dark:text-[#5de6ff] font-bold">
                <span className="material-symbols-outlined text-base">my_location</span>
                <span>GEO-TELEMETRY SENSOR</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#242a3a] text-cyan-700 dark:text-[#4cd7f6] font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse"></span>
                <span>GPS POSITION ACTIVE</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080e1d] border border-slate-200 dark:border-[#3d494c]/30 font-mono text-xs text-slate-600 dark:text-[#bcc9cd] flex justify-between items-center">
              <span>{address}</span>
              <span className="text-cyan-600 dark:text-[#4cd7f6] font-bold">{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
            </div>
          </div>

          {/* Issue Submission Form */}
          <div className="bg-white dark:bg-[#151b2b] rounded-2xl p-6 border border-slate-200 dark:border-[#3d494c]/40 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#06b6d4] text-xl">report_problem</span>
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-[#dde2f8]">Log Civic Anomaly</h2>
              </div>
              <span className="font-mono text-[10px] text-cyan-700 dark:text-[#5de6ff] uppercase bg-slate-100 dark:bg-[#242a3a] px-2 py-0.5 rounded font-semibold">
                AI Vision & Triage
              </span>
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[#10b981]/20 border border-emerald-200 dark:border-[#10b981]/40 text-emerald-700 dark:text-[#34d399] text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{submitSuccess}</span>
              </div>
            )}
            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-[#93000a]/30 border border-red-200 dark:border-[#ffb4ab]/40 text-red-700 dark:text-[#ffb4ab] text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category Radio Pills */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 dark:text-[#dde2f8]">
                  Issue Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pothole', label: 'Pothole', icon: 'warning' },
                    { id: 'garbage', label: 'Garbage', icon: 'delete_sweep' },
                    { id: 'water_leakage', label: 'Water Leak', icon: 'water_drop' },
                    { id: 'drainage', label: 'Drainage', icon: 'flood' },
                    { id: 'streetlight', label: 'Streetlight', icon: 'lightbulb' },
                    { id: 'road_damage', label: 'Road Sink', icon: 'construction' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-xl font-mono text-xs flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        category === cat.id
                          ? 'bg-cyan-50 border-[#06b6d4] text-cyan-800 dark:bg-[#06b6d4]/20 dark:border-[#06b6d4] dark:text-[#4cd7f6] font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-[#191f2f] dark:border-[#3d494c]/40 dark:text-[#bcc9cd] dark:hover:bg-[#242a3a]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{cat.icon}</span>
                      <span className="text-[10px]">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 dark:text-[#dde2f8]">
                  Issue Summary (Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={triggerAiPreview}
                  placeholder="e.g. Deep crater pothole near Nal Stop chowk"
                  required
                  className="w-full bg-slate-50 dark:bg-[#080e1d] text-xs text-slate-900 dark:text-[#dde2f8] placeholder-slate-400 dark:placeholder-[#869397] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#3d494c]/40 focus:outline-none focus:border-[#06b6d4]"
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 dark:text-[#dde2f8]">
                  Detailed Telemetry Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={triggerAiPreview}
                  rows={3}
                  placeholder="Describe severity, dimensions, duration, and safety hazards..."
                  required
                  className="w-full bg-slate-50 dark:bg-[#080e1d] text-xs text-slate-900 dark:text-[#dde2f8] placeholder-slate-400 dark:placeholder-[#869397] p-3 rounded-xl border border-slate-300 dark:border-[#3d494c]/40 focus:outline-none focus:border-[#06b6d4]"
                />
              </div>

              {/* Photographic Capture */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 dark:text-[#dde2f8]">
                  Camera / Photo Evidence
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-300 dark:border-[#3d494c] bg-slate-50 dark:bg-[#191f2f] hover:bg-slate-100 dark:hover:bg-[#242a3a] cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-cyan-600 dark:text-[#4cd7f6] text-xl">add_a_photo</span>
                    <span className="text-[11px] text-slate-600 dark:text-[#bcc9cd] mt-0.5">Attach Photo (JPG/PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#06b6d4]">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute top-0 right-0 bg-black/70 p-0.5 text-white"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Real-Time Preview Card */}
              {aiPreview && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080e1d] border border-cyan-300 dark:border-[#4cd7f6]/40 space-y-1.5 animate-fade-in font-mono text-xs">
                  <div className="flex items-center justify-between text-cyan-700 dark:text-[#4cd7f6]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">psychology</span>
                      <strong>AI Triage Prediction</strong>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-[#34d399]">Confidence: {(aiPreview.confidence_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-[#bcc9cd]">
                    Predicted: <span className="text-slate-900 dark:text-[#dde2f8] uppercase font-bold">{aiPreview.category_suggestion}</span> • Priority: <span className="text-amber-600 dark:text-[#ffb95f] uppercase font-bold">{aiPreview.priority_suggestion}</span>
                  </div>
                  {aiPreview.is_duplicate && (
                    <div className="text-[10px] text-red-700 dark:text-[#ffb4ab] bg-red-50 dark:bg-[#93000a]/20 p-1.5 rounded border border-red-200 dark:border-[#ffb4ab]/30">
                      ⚠ Proximity Warning: Potential duplicate incident found nearby!
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-[#06b6d4] hover:bg-cyan-500 text-white dark:text-[#003640] font-['Space_Grotesk'] text-sm font-bold shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white dark:border-[#003640] border-t-transparent rounded-full animate-spin"></span>
                    <span>Transmitting to PMC Operations Hub...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">send</span>
                    <span>Submit Civic Report for Triage</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Complaint Tracking & Resolution Auditing */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sub-tabs: My Reports vs All Audits */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#3d494c]/30 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('my')}
                className={`py-2 px-4 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                  activeTab === 'my'
                    ? 'bg-[#06b6d4] text-white dark:text-[#003640] shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-[#bcc9cd] dark:hover:bg-[#242a3a] dark:hover:text-[#dde2f8]'
                }`}
              >
                My Reported Complaints ({myIncidents.length})
              </button>
              <button
                onClick={() => setActiveTab('public')}
                className={`py-2 px-4 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                  activeTab === 'public'
                    ? 'bg-[#06b6d4] text-white dark:text-[#003640] shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-[#bcc9cd] dark:hover:bg-[#242a3a] dark:hover:text-[#dde2f8]'
                }`}
              >
                Public Ward Stream ({allIncidents.length})
              </button>
            </div>

            <button
              onClick={loadIncidents}
              title="Refresh complaint ledger"
              className="p-2 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-slate-200 dark:text-[#bcc9cd] dark:hover:text-[#4cd7f6] dark:hover:bg-[#242a3a] transition-colors"
            >
              <span className="material-symbols-outlined text-base">sync</span>
            </button>
          </div>

          {/* List of complaints */}
          <div className="space-y-4">
            {loadingList ? (
              <div className="py-16 text-center text-xs font-mono text-slate-500 dark:text-[#bcc9cd]">
                Syncing civic complaint telemetry...
              </div>
            ) : (activeTab === 'my' ? myIncidents : allIncidents).length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#151b2b] rounded-2xl border border-slate-200 dark:border-[#3d494c]/40 text-xs text-slate-500 dark:text-[#bcc9cd]">
                No reports found in this view. Use the left form to submit your first issue!
              </div>
            ) : (
              (activeTab === 'my' ? myIncidents : allIncidents).map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setInspectModalId(inc.id)}
                  className="p-5 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xs hover:shadow-md hover:border-cyan-500/40 dark:hover:bg-[#191f2f] transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-600 dark:text-[#4cd7f6]">
                        {inc.incident_code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full font-mono text-[9px] uppercase bg-slate-100 dark:bg-[#242a3a] text-slate-800 dark:text-[#dde2f8]">
                        {inc.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold ${
                        inc.status === 'verified' || inc.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-[#10b981]/20 dark:text-[#34d399]'
                          : inc.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800 dark:bg-[#e79400]/20 dark:text-[#ffb95f]'
                          : 'bg-cyan-100 text-cyan-800 dark:bg-[#4cd7f6]/15 dark:text-[#4cd7f6]'
                      }`}>
                        {inc.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-[#dde2f8]">
                      {inc.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-[#bcc9cd] line-clamp-2 mt-1">
                      {inc.description}
                    </p>
                  </div>

                  {/* Lifecycle Progression Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between font-mono text-[9px] text-slate-500 dark:text-[#bcc9cd] uppercase">
                      <span className={inc.status === 'reported' ? 'text-cyan-600 dark:text-[#4cd7f6] font-bold' : ''}>Reported</span>
                      <span className={inc.status === 'under_review' ? 'text-cyan-600 dark:text-[#4cd7f6] font-bold' : ''}>Review</span>
                      <span className={inc.status === 'assigned' ? 'text-cyan-600 dark:text-[#4cd7f6] font-bold' : ''}>Assigned</span>
                      <span className={inc.status === 'in_progress' ? 'text-amber-600 dark:text-[#ffb95f] font-bold' : ''}>In Progress</span>
                      <span className={inc.status === 'resolved' ? 'text-emerald-600 dark:text-[#34d399] font-bold' : ''}>Resolved</span>
                      <span className={inc.status === 'verified' ? 'text-emerald-600 dark:text-[#34d399] font-bold' : ''}>Verified</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#080e1d] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          inc.status === 'verified' ? 'w-full bg-emerald-500' :
                          inc.status === 'resolved' ? 'w-5/6 bg-emerald-400' :
                          inc.status === 'in_progress' ? 'w-4/6 bg-amber-500' :
                          inc.status === 'assigned' ? 'w-3/6 bg-cyan-500' :
                          inc.status === 'under_review' ? 'w-2/6 bg-cyan-400' :
                          'w-1/6 bg-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#3d494c]/20 flex items-center justify-between font-mono text-[10px] text-slate-500 dark:text-[#869397]">
                    <span>Ward: {inc.ward || 'Kothrud'}</span>
                    <span className="text-cyan-600 dark:text-[#4cd7f6] font-bold hover:underline">Click to Inspect & Verify Proof →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Full Modal Viewer */}
      {inspectModalId && (
        <IncidentModal
          incidentId={inspectModalId}
          onClose={() => setInspectModalId(null)}
          onUpdated={() => loadIncidents()}
        />
      )}
    </div>
  );
};
