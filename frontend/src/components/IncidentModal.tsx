import React, { useState, useEffect } from 'react';
import { Incident, StatusHistory, ResolutionEvidence, CitizenFeedback } from '../types';
import { incidentApi, evidenceApi, feedbackApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface IncidentModalProps {
  incidentId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({ incidentId, onClose, onUpdated }) => {
  const { user, isAdmin } = useAuth();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [evidenceList, setEvidenceList] = useState<ResolutionEvidence[]>([]);
  const [feedbackList, setFeedbackList] = useState<CitizenFeedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Admin actions state
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPriority, setNewPriority] = useState<string>('');
  const [newDept, setNewDept] = useState<string>('');
  const [statusRemark, setStatusRemark] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  // Evidence upload state
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState<string>('');
  const [uploadingEvidence, setUploadingEvidence] = useState<boolean>(false);

  // Citizen feedback state
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isChallenge, setIsChallenge] = useState<boolean>(false);
  const [challengeReason, setChallengeReason] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'evidence' | 'feedback'>('details');

  const fetchDetails = async () => {
    if (!incidentId) return;
    setLoading(true);
    try {
      const res = await incidentApi.getById(incidentId);
      const data = res.data;
      setIncident(data.incident);
      setHistory(data.status_history || []);
      setEvidenceList(data.evidence || []);
      setFeedbackList(data.feedback || []);

      setNewStatus(data.incident.status);
      setNewPriority(data.incident.priority);
      setNewDept(data.incident.assigned_dept || '');
    } catch (err) {
      console.error('Failed to load incident details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [incidentId]);

  if (!incidentId) return null;

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await incidentApi.update(incidentId, {
        status: newStatus,
        priority: newPriority,
        assigned_dept: newDept,
        remark: statusRemark || `Status shifted to ${newStatus.toUpperCase()}`
      });
      setStatusRemark('');
      await fetchDetails();
      onUpdated?.();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleEvidenceUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceFile) return;
    setUploadingEvidence(true);
    try {
      const formData = new FormData();
      formData.append('image', evidenceFile);
      formData.append('notes', evidenceNotes);
      formData.append('evidence_type', 'resolution_photo');

      await evidenceApi.upload(incidentId, formData);
      setEvidenceFile(null);
      setEvidenceNotes('');
      await fetchDetails();
      onUpdated?.();
      alert('Proof-of-work evidence uploaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to upload evidence');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await feedbackApi.submit(incidentId, {
        rating: feedbackRating,
        feedback_text: feedbackText,
        is_satisfied: !isChallenge,
        challenge_flag: isChallenge,
        challenge_reason: isChallenge ? challengeReason : undefined
      });
      setFeedbackText('');
      setChallengeReason('');
      setIsChallenge(false);
      await fetchDetails();
      onUpdated?.();
      alert(isChallenge ? 'Resolution challenge submitted. Incident marked for review.' : 'Thank you for your verification feedback!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#151b2b] rounded-2xl border border-slate-200 dark:border-[#3d494c]/60 shadow-2xl overflow-hidden my-8 text-slate-800 dark:text-[#dde2f8]">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#3d494c]/40 bg-slate-50 dark:bg-[#191f2f]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-cyan-600 dark:text-[#4cd7f6]">
              {incident?.incident_code || 'Loading...'}
            </span>
            {incident && (
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold ${
                incident.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-[#93000a] dark:text-[#ffb4ab]' :
                incident.priority === 'high' ? 'bg-amber-100 text-amber-800 dark:bg-[#e79400]/20 dark:text-[#ffb95f]' :
                'bg-cyan-100 text-cyan-800 dark:bg-[#06b6d4]/20 dark:text-[#4cd7f6]'
              }`}>
                {incident.priority} PRIORITY
              </span>
            )}
            {incident?.is_duplicate && (
              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-amber-100 dark:bg-[#f59e0b]/20 text-amber-800 dark:text-[#f59e0b] border border-amber-300 dark:border-[#f59e0b]/40">
                ⚠ DUPLICATE CLUSTER
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-[#bcc9cd] dark:hover:text-[#dde2f8] hover:bg-slate-200 dark:hover:bg-[#242a3a] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-[#3d494c]/30 px-6 bg-slate-100/60 dark:bg-[#0d1322]">
          {(['details', 'timeline', 'evidence', 'feedback'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab
                  ? 'border-[#06b6d4] text-cyan-700 dark:text-[#4cd7f6]'
                  : 'border-transparent text-slate-500 dark:text-[#bcc9cd] hover:text-slate-800 dark:hover:text-[#dde2f8]'
              }`}
            >
              {tab === 'details' && 'Incident Details'}
              {tab === 'timeline' && `Lifecycle Timeline (${history.length})`}
              {tab === 'evidence' && `Proof-of-Work (${evidenceList.length})`}
              {tab === 'feedback' && `Citizen Audit (${feedbackList.length})`}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <span className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></span>
              <span className="font-mono text-xs text-slate-500 dark:text-[#bcc9cd]">Loading incident telemetry...</span>
            </div>
          ) : !incident ? (
            <div className="py-8 text-center text-sm text-red-600 dark:text-[#ffb4ab]">Incident not found.</div>
          ) : (
            <>
              {/* TAB 1: DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-[#dde2f8]">{incident.title}</h2>
                    <p className="text-xs text-slate-600 dark:text-[#bcc9cd] mt-1 leading-relaxed">{incident.description}</p>
                  </div>

                  {/* Metadata Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#191f2f] border border-slate-200 dark:border-[#3d494c]/30 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-[#bcc9cd] block text-[10px]">CATEGORY</span>
                      <span className="text-cyan-700 dark:text-[#4cd7f6] font-bold uppercase">{incident.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-[#bcc9cd] block text-[10px]">CURRENT STATUS</span>
                      <span className="text-emerald-600 dark:text-[#34d399] font-bold uppercase">{incident.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-[#bcc9cd] block text-[10px]">WARD / ZONE</span>
                      <span className="text-slate-800 dark:text-[#dde2f8] font-bold">{incident.ward || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-[#bcc9cd] block text-[10px]">ASSIGNED DEPT</span>
                      <span className="text-sky-700 dark:text-[#5de6ff] font-bold uppercase">{incident.assigned_dept || 'Pending'}</span>
                    </div>
                  </div>

                  {/* Coordinates & Location */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#080e1d] border border-slate-200 dark:border-[#3d494c]/30 flex items-center justify-between font-mono text-xs text-slate-700 dark:text-[#dde2f8]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-cyan-600 dark:text-[#4cd7f6] text-base">pin_drop</span>
                      <span>{incident.address || `${incident.latitude}° N, ${incident.longitude}° E`}</span>
                    </div>
                    <span className="text-slate-400 dark:text-[#bcc9cd] text-[10px]">
                      GPS: {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                    </span>
                  </div>

                  {/* AI Analysis Result Card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#191f2f] border border-cyan-300 dark:border-[#4cd7f6]/30 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-cyan-600 dark:text-[#4cd7f6] text-lg">psychology</span>
                        <span className="font-mono text-xs font-bold text-cyan-700 dark:text-[#4cd7f6] uppercase tracking-wider">
                          AI Triage & Priority Evaluation
                        </span>
                      </div>
                      {incident.ai_confidence_score && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-[#4cd7f6]/10 text-cyan-800 dark:text-[#4cd7f6] font-mono text-[10px] font-bold">
                          Confidence: {(incident.ai_confidence_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-[#dde2f8] leading-relaxed font-mono bg-white dark:bg-[#080e1d] p-3 rounded-lg border border-slate-200 dark:border-[#3d494c]/30">
                      {incident.ai_analysis_notes || 'Algorithmic heuristic analysis recorded.'}
                    </p>
                  </div>

                  {/* Incident Photo if present */}
                  {incident.image_path && (
                    <div className="space-y-2">
                      <span className="font-mono text-xs uppercase text-slate-500 dark:text-[#bcc9cd]">Citizen Photographic Submission</span>
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#3d494c]/40 max-h-60 bg-slate-100 dark:bg-[#080e1d]">
                        <img
                          src={incident.image_path.startsWith('http') ? incident.image_path : `http://localhost:4000${incident.image_path}`}
                          alt="Incident issue capture"
                          className="w-full h-auto object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Admin Lifecycle Controller */}
                  {isAdmin && (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#080e1d] border border-slate-200 dark:border-[#3d494c]/50 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-cyan-600 dark:text-[#5de6ff] text-lg">admin_panel_settings</span>
                        <h3 className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-[#dde2f8]">
                          Municipal Authority Operations Deck
                        </h3>
                      </div>
                      <form onSubmit={handleStatusUpdate} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd] uppercase mb-1">Update Status</label>
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="w-full bg-white dark:bg-[#151b2b] text-xs text-slate-900 dark:text-[#dde2f8] rounded-lg p-2 border border-slate-300 dark:border-[#3d494c]/50"
                            >
                              <option value="reported">Reported</option>
                              <option value="under_review">Under Review</option>
                              <option value="assigned">Assigned</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="verified">Verified (Confirmed)</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd] uppercase mb-1">Set Priority</label>
                            <select
                              value={newPriority}
                              onChange={(e) => setNewPriority(e.target.value)}
                              className="w-full bg-white dark:bg-[#151b2b] text-xs text-slate-900 dark:text-[#dde2f8] rounded-lg p-2 border border-slate-300 dark:border-[#3d494c]/50"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical Emergency</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd] uppercase mb-1">Department</label>
                            <select
                              value={newDept}
                              onChange={(e) => setNewDept(e.target.value)}
                              className="w-full bg-white dark:bg-[#151b2b] text-xs text-slate-900 dark:text-[#dde2f8] rounded-lg p-2 border border-slate-300 dark:border-[#3d494c]/50"
                            >
                              <option value="roads">Roads & Infrastructure</option>
                              <option value="solid_waste">Solid Waste Management</option>
                              <option value="water_supply">Water Supply Department</option>
                              <option value="storm_water">Storm Water Drainage</option>
                              <option value="street_lighting">Street Lighting</option>
                              <option value="general">General Administration</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd] uppercase mb-1">
                            Official Remark / Dispatch Log
                          </label>
                          <input
                            type="text"
                            value={statusRemark}
                            onChange={(e) => setStatusRemark(e.target.value)}
                            placeholder="e.g. Dispatched QRT Unit #04 with bitumen patching truck"
                            className="w-full bg-white dark:bg-[#151b2b] text-xs text-slate-900 dark:text-[#dde2f8] rounded-lg px-3 py-2 border border-slate-300 dark:border-[#3d494c]/50"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={updating}
                          className="px-4 py-2 rounded-lg bg-[#06b6d4] text-white dark:text-[#003640] font-['Space_Grotesk'] text-xs font-bold hover:brightness-105 cursor-pointer disabled:opacity-50"
                        >
                          {updating ? 'Updating Node...' : 'Commit Status Lifecycle Change'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <h3 className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-[#dde2f8]">
                    Lifecycle Audit Trail & Dispatch History
                  </h3>
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-[#3d494c]/40">
                    {history.map((h, idx) => (
                      <div key={h.id || idx} className="relative pl-8 flex flex-col gap-1">
                        <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#06b6d4] border-2 border-white dark:border-[#151b2b]"></div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-[#34d399] uppercase">
                            {h.to_status}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd]">
                            by {h.changed_by_name || 'System'}
                          </span>
                          <span className="text-slate-300 dark:text-[#3d494c]">•</span>
                          <span className="font-mono text-[10px] text-slate-400 dark:text-[#869397]">
                            {new Date(h.created_at).toLocaleString()}
                          </span>
                        </div>
                        {h.remark && (
                          <p className="text-xs text-slate-700 dark:text-[#dde2f8] bg-slate-50 dark:bg-[#191f2f] p-2.5 rounded-lg border border-slate-200 dark:border-[#3d494c]/30">
                            {h.remark}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: EVIDENCE */}
              {activeTab === 'evidence' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-[#dde2f8]">
                      Contractor Proof-of-Work & Resolution Photos
                    </h3>
                  </div>

                  {evidenceList.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-[#191f2f] rounded-xl border border-slate-200 dark:border-[#3d494c]/30 text-xs text-slate-500 dark:text-[#bcc9cd]">
                      No photographic resolution evidence has been uploaded yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {evidenceList.map((ev) => (
                        <div key={ev.id} className="rounded-xl overflow-hidden bg-slate-50 dark:bg-[#191f2f] border border-slate-200 dark:border-[#3d494c]/40">
                          <img
                            src={ev.image_path.startsWith('http') ? ev.image_path : `http://localhost:4000${ev.image_path}`}
                            alt="Resolution Evidence"
                            className="w-full h-44 object-cover"
                            onError={(e) => {
                              (e.target as any).src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60';
                            }}
                          />
                          <div className="p-3 text-xs space-y-1">
                            <span className="font-mono text-[10px] text-cyan-700 dark:text-[#4cd7f6] uppercase font-bold block">
                              {ev.evidence_type}
                            </span>
                            <p className="text-slate-800 dark:text-[#dde2f8]">{ev.notes || 'Repair completed by municipal unit.'}</p>
                            <span className="font-mono text-[10px] text-slate-400 dark:text-[#869397] block">
                              Uploaded by {ev.uploaded_by_name || 'Officer'} • {new Date(ev.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Evidence Upload Form for Officers & Supervisors */}
                  {isAdmin && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080e1d] border border-slate-200 dark:border-[#3d494c]/50 space-y-3">
                      <span className="font-mono text-xs text-cyan-700 dark:text-[#4cd7f6] uppercase font-bold block">
                        Upload Resolution Photo (Proof-of-Work)
                      </span>
                      <form onSubmit={handleEvidenceUpload} className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                          required
                          className="w-full text-xs text-slate-800 dark:text-[#dde2f8] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-[#06b6d4] file:text-white dark:file:text-[#003640] file:font-bold cursor-pointer"
                        />
                        <input
                          type="text"
                          value={evidenceNotes}
                          onChange={(e) => setEvidenceNotes(e.target.value)}
                          placeholder="Evidence description (e.g. Patching complete, asphalt cooled)"
                          className="w-full bg-white dark:bg-[#151b2b] text-xs text-slate-800 dark:text-[#dde2f8] rounded-lg px-3 py-2 border border-slate-300 dark:border-[#3d494c]/40"
                        />
                        <button
                          type="submit"
                          disabled={uploadingEvidence}
                          className="px-4 py-2 rounded-lg bg-[#06b6d4] text-white dark:text-[#003640] font-['Space_Grotesk'] text-xs font-bold hover:brightness-105 cursor-pointer disabled:opacity-50"
                        >
                          {uploadingEvidence ? 'Uploading...' : 'Submit Resolution Proof'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CITIZEN FEEDBACK & CHALLENGE */}
              {activeTab === 'feedback' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-[#dde2f8]">
                      Citizen Verification & Satisfaction Audits
                    </h3>
                  </div>

                  {feedbackList.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 dark:bg-[#191f2f] rounded-xl border border-slate-200 dark:border-[#3d494c]/30 text-xs text-slate-500 dark:text-[#bcc9cd]">
                      No citizen reviews submitted for this incident yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {feedbackList.map((fb) => (
                        <div key={fb.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#191f2f] border border-slate-200 dark:border-[#3d494c]/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-amber-500">
                              {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  star
                                </span>
                              ))}
                            </div>
                            {fb.challenge_flag ? (
                              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-red-100 dark:bg-[#93000a]/40 text-red-700 dark:text-[#ffb4ab] border border-red-300 dark:border-[#ffb4ab]/40">
                                ⚠ CHALLENGED RESOLUTION
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-emerald-100 dark:bg-[#10b981]/20 text-emerald-700 dark:text-[#34d399]">
                                VERIFIED RESOLVED
                              </span>
                            )}
                          </div>
                          {fb.feedback_text && (
                            <p className="text-xs text-slate-800 dark:text-[#dde2f8]">{fb.feedback_text}</p>
                          )}
                          {fb.challenge_reason && (
                            <div className="p-2 rounded bg-red-50 dark:bg-[#93000a]/20 border border-red-200 dark:border-[#ffb4ab]/30 text-xs text-red-700 dark:text-[#ffb4ab]">
                              <strong>Challenge Reason:</strong> {fb.challenge_reason}
                            </div>
                          )}
                          <span className="font-mono text-[10px] text-slate-400 dark:text-[#869397] block">
                            Logged on {new Date(fb.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Citizen Feedback Submission Form */}
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#080e1d] border border-slate-200 dark:border-[#3d494c]/50 space-y-4">
                    <span className="font-mono text-xs text-cyan-700 dark:text-[#4cd7f6] uppercase font-bold block">
                      Submit Your Civic Co-Audit Review
                    </span>
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="font-mono text-xs text-slate-600 dark:text-[#bcc9cd]">Satisfaction Rating:</label>
                        <select
                          value={feedbackRating}
                          onChange={(e) => setFeedbackRating(parseInt(e.target.value))}
                          className="bg-white dark:bg-[#151b2b] text-xs text-slate-800 dark:text-[#dde2f8] rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-[#3d494c]/40"
                        >
                          <option value="5">★★★★★ Excellent (5/5)</option>
                          <option value="4">★★★★☆ Good (4/5)</option>
                          <option value="3">★★★☆☆ Average (3/5)</option>
                          <option value="2">★★☆☆☆ Poor (2/5)</option>
                          <option value="1">★☆☆☆☆ Unacceptable (1/5)</option>
                        </select>
                      </div>

                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Provide details about whether the issue was adequately addressed..."
                        rows={2}
                        className="w-full bg-white dark:bg-[#151b2b] text-xs text-slate-800 dark:text-[#dde2f8] rounded-lg p-2.5 border border-slate-300 dark:border-[#3d494c]/40"
                      />

                      {/* Challenge Closure Option */}
                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#242a3a] border border-slate-200 dark:border-[#3d494c]/40 flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChallenge}
                            onChange={(e) => setIsChallenge(e.target.checked)}
                            className="rounded bg-white dark:bg-[#151b2b] text-red-600"
                          />
                          <span className="text-xs font-semibold text-red-700 dark:text-[#ffb4ab]">
                            Challenge Closure (The problem was NOT fixed or was repaired improperly)
                          </span>
                        </label>
                        {isChallenge && (
                          <input
                            type="text"
                            value={challengeReason}
                            onChange={(e) => setChallengeReason(e.target.value)}
                            placeholder="Explain why the closure is challenged..."
                            required
                            className="w-full bg-white dark:bg-[#151b2b] text-xs text-slate-900 dark:text-[#dde2f8] rounded-lg p-2 border border-red-300 dark:border-[#ffb4ab]/40"
                          />
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={submittingFeedback}
                        className="px-4 py-2 rounded-lg bg-[#06b6d4] text-white dark:text-[#003640] font-['Space_Grotesk'] text-xs font-bold hover:brightness-105 cursor-pointer disabled:opacity-50"
                      >
                        {submittingFeedback ? 'Submitting Review...' : isChallenge ? 'Submit Formal Challenge' : 'Confirm Resolution Audit'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
