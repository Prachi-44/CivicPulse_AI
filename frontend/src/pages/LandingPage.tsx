import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full bg-slate-50 dark:bg-[#0d1322] text-slate-800 dark:text-[#dde2f8] transition-colors duration-200">
      
      {/* ── SECTION 1: HERO SECTION ─────────────────────────────────── */}
      <section className="relative w-full pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-8 lg:px-12 overflow-hidden">
        {/* Atmospheric Ambient Glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-cyan-400/10 dark:bg-[#4cd7f6]/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 -right-48 w-[480px] h-[480px] bg-sky-400/10 dark:bg-[#00cbe6]/10 rounded-full blur-[160px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#242a3a]/90 shadow-sm dark:shadow-md backdrop-blur-md mb-8 border border-slate-200 dark:border-[#3d494c]/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06b6d4]"></span>
            </span>
            <span className="font-mono text-xs text-cyan-700 dark:text-[#4cd7f6] tracking-widest uppercase font-semibold">
              PUNE URBAN INTELLIGENCE PROTOTYPE • SIMULATED CIVIC TELEMETRY
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl lg:text-6xl max-w-5xl tracking-tight text-slate-900 dark:text-[#dde2f8] font-bold mb-6 leading-tight">
            Understand the City. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 dark:from-[#4cd7f6] dark:via-[#5de6ff] dark:to-[#acedff] bg-clip-text text-transparent">
              Identify Problems.
            </span>{' '}
            Make Change Happen.
          </h1>

          {/* Refined Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-[#bcc9cd] max-w-3xl leading-relaxed mb-10 font-['Plus_Jakarta_Sans']">
            Autonomous urban civic infrastructure monitoring powered by Computer Vision, PostGIS spatial clustering, and automated duplicate triage for Pune metropolitan areas.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-16">
            <Link
              to="/command-center"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#06b6d4] text-white dark:text-[#003640] font-['Space_Grotesk'] font-bold text-sm shadow-md hover:shadow-cyan-500/20 hover:brightness-105 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Explore Live Command Center</span>
            </Link>
            <Link
              to="/citizen"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white dark:bg-[#242a3a] text-cyan-700 dark:text-[#4cd7f6] font-['Space_Grotesk'] font-semibold text-sm hover:bg-slate-50 dark:hover:bg-[#2f3445] border border-slate-300 dark:border-[#3d494c]/40 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">radar</span>
              <span>Try Citizen AI Reporter</span>
            </Link>
          </div>

          {/* High-Level Metric Highlights Bar */}
          <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 lg:p-8 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xl">
            <div className="flex flex-col items-center justify-center text-center p-3">
              <span className="font-['Space_Grotesk'] text-3xl sm:text-4xl text-cyan-600 dark:text-[#4cd7f6] font-bold tracking-tight mb-1">45s</span>
              <span className="font-['Space_Grotesk'] text-sm sm:text-base text-slate-800 dark:text-[#dde2f8] font-semibold mb-0.5">Citizen Report Time</span>
              <span className="font-mono text-xs text-slate-500 dark:text-[#bcc9cd]">Instant GPS & AI Edge Verification</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-3">
              <span className="font-['Space_Grotesk'] text-3xl sm:text-4xl text-sky-600 dark:text-[#5de6ff] font-bold tracking-tight mb-1">35m</span>
              <span className="font-['Space_Grotesk'] text-sm sm:text-base text-slate-800 dark:text-[#dde2f8] font-semibold mb-0.5">DBSCAN Radius</span>
              <span className="font-mono text-xs text-slate-500 dark:text-[#bcc9cd]">PostGIS Dynamic Triage Zone</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-3">
              <span className="font-['Space_Grotesk'] text-3xl sm:text-4xl text-blue-600 dark:text-[#acedff] font-bold tracking-tight mb-1">94.8%</span>
              <span className="font-['Space_Grotesk'] text-sm sm:text-base text-slate-800 dark:text-[#dde2f8] font-semibold mb-0.5">Defect Accuracy</span>
              <span className="font-mono text-xs text-slate-500 dark:text-[#bcc9cd]">Vision & Heuristic Triage</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-3">
              <span className="font-['Space_Grotesk'] text-3xl sm:text-4xl text-amber-600 dark:text-[#ffb95f] font-bold tracking-tight mb-1">68%</span>
              <span className="font-['Space_Grotesk'] text-sm sm:text-base text-slate-800 dark:text-[#dde2f8] font-semibold mb-0.5">Admin Hours Saved</span>
              <span className="font-mono text-xs text-slate-500 dark:text-[#bcc9cd]">Automated Municipal Routing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: ARCHITECTURAL VALUE PILLARS ─────────────────── */}
      <section className="w-full py-16 px-4 sm:px-8 lg:px-12 bg-slate-100/70 dark:bg-[#080e1d]/60 border-y border-slate-200 dark:border-[#3d494c]/20">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <span className="font-mono text-xs text-cyan-600 dark:text-[#4cd7f6] tracking-widest uppercase mb-2 font-semibold">
              INTELLIGENT MUNICIPAL PIPELINE
            </span>
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl text-slate-900 dark:text-[#dde2f8] font-bold tracking-tight mb-3">
              Architectural Value Pillars
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#bcc9cd]">
              From citizen image capture to contractor closure verification, our continuous telemetry pipeline eliminates administrative overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-sm hover:shadow-md hover:border-cyan-500/40 dark:hover:bg-[#191f2f] transition-all">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-[#242a3a] flex items-center justify-center text-cyan-600 dark:text-[#4cd7f6] shadow-inner">
                  <span className="material-symbols-outlined text-[28px]">view_in_ar</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] text-cyan-700 dark:text-[#5de6ff]">MODULE 01 • INFERENCE ENGINE</span>
                  <h3 className="font-['Space_Grotesk'] text-lg text-slate-900 dark:text-[#dde2f8] font-bold">Instant Computer Vision Triage</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#bcc9cd] leading-relaxed mt-1">
                    Lightweight edge inference and rule-based NLP classifying potholes, garbage dumps, pipeline bursts, and damaged streetlights in milliseconds.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#3d494c]/30 flex items-center justify-between">
                <span className="font-mono text-[11px] text-cyan-700 dark:text-[#4cd7f6] bg-cyan-50 dark:bg-[#4cd7f6]/10 px-2.5 py-0.5 rounded-full font-semibold">
                  Latency: &lt;140ms
                </span>
                <span className="material-symbols-outlined text-slate-400 dark:text-[#bcc9cd] text-[18px]">arrow_forward</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-sm hover:shadow-md hover:border-sky-500/40 dark:hover:bg-[#191f2f] transition-all">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-[#242a3a] flex items-center justify-center text-sky-600 dark:text-[#5de6ff] shadow-inner">
                  <span className="material-symbols-outlined text-[28px]">hub</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] text-sky-700 dark:text-[#5de6ff]">MODULE 02 • SPATIAL CLUSTERING</span>
                  <h3 className="font-['Space_Grotesk'] text-lg text-slate-900 dark:text-[#dde2f8] font-bold">DBSCAN Proximity Deduplication</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#bcc9cd] leading-relaxed mt-1">
                    PostGIS ST_DWithin spatial clustering auto-merging duplicate citizen reports within 35 meters into unified master tickets.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#3d494c]/30 flex items-center justify-between">
                <span className="font-mono text-[11px] text-sky-700 dark:text-[#5de6ff] bg-sky-50 dark:bg-[#5de6ff]/10 px-2.5 py-0.5 rounded-full font-semibold">
                  PostGIS Spatial Index
                </span>
                <span className="material-symbols-outlined text-slate-400 dark:text-[#bcc9cd] text-[18px]">arrow_forward</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-sm hover:shadow-md hover:border-amber-500/40 dark:hover:bg-[#191f2f] transition-all">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-[#242a3a] flex items-center justify-center text-amber-600 dark:text-[#ffb95f] shadow-inner">
                  <span className="material-symbols-outlined text-[28px]">verified_user</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] text-amber-700 dark:text-[#ffb95f]">MODULE 03 • PROOF-OF-WORK</span>
                  <h3 className="font-['Space_Grotesk'] text-lg text-slate-900 dark:text-[#dde2f8] font-bold">Tamper-Proof Resolution Verification</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#bcc9cd] leading-relaxed mt-1">
                    Triangulated GPS checks, contractor before/after photographic proof-of-work, and verified citizen closure polling.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#3d494c]/30 flex items-center justify-between">
                <span className="font-mono text-[11px] text-amber-700 dark:text-[#ffb95f] bg-amber-50 dark:bg-[#ffb95f]/10 px-2.5 py-0.5 rounded-full font-semibold">
                  Citizen Co-Audit
                </span>
                <span className="material-symbols-outlined text-slate-400 dark:text-[#bcc9cd] text-[18px]">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: LIVE PUNE DEMONSTRATION SPOTLIGHT ───────────── */}
      <section className="w-full py-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-cyan-600 dark:text-[#4cd7f6] tracking-widest uppercase font-semibold">
                LIVE OPERATIONAL TELEMETRY
              </span>
              <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl text-slate-900 dark:text-[#dde2f8] font-bold tracking-tight">
                Pune Municipal Demonstration
              </h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#242a3a] border border-slate-200 dark:border-[#3d494c]/40 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-pulse"></span>
              <span className="font-mono text-xs text-slate-800 dark:text-[#dde2f8] font-semibold">STREAM ACTIVE • 15 WARDS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Ward Breakdown */}
            <div className="lg:col-span-6 flex flex-col gap-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-['Space_Grotesk'] text-lg text-slate-900 dark:text-[#dde2f8] font-bold">Ward Matrix & SLA Compliance</h3>
                <span className="font-mono text-xs text-slate-500 dark:text-[#bcc9cd]">Real-Time Sync</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#bcc9cd]">
                Automated health indexes calculated from live defect density, response latency, and citizen resolution confirmation ratios.
              </p>

              <div className="flex flex-col gap-3 mt-2">
                {/* Ward 1 */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#191f2f] flex flex-col gap-2 border border-slate-200 dark:border-[#3d494c]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-['Space_Grotesk'] text-sm text-slate-800 dark:text-[#dde2f8] font-semibold">PMC Ward 14 • Kothrud</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-[#4cd7f6]/10 text-cyan-800 dark:text-[#4cd7f6] font-mono text-[10px] font-semibold">Critical Zone</span>
                    </div>
                    <span className="font-mono text-xs text-cyan-600 dark:text-[#4cd7f6] font-bold">96.2% SLA</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-[#2f3445] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#06b6d4] h-1.5 rounded-full" style={{ width: '96.2%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-[#bcc9cd] font-mono text-[11px]">
                    <span>12 Active Hotspots</span>
                    <span>Avg. Resolution: 4.2h</span>
                  </div>
                </div>

                {/* Ward 2 */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#191f2f] flex flex-col gap-2 border border-slate-200 dark:border-[#3d494c]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-['Space_Grotesk'] text-sm text-slate-800 dark:text-[#dde2f8] font-semibold">PMC Ward 21 • Hadapsar</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-[#5de6ff]/10 text-sky-800 dark:text-[#5de6ff] font-mono text-[10px] font-semibold">Moderate</span>
                    </div>
                    <span className="font-mono text-xs text-sky-600 dark:text-[#5de6ff] font-bold">91.8% SLA</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-[#2f3445] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '91.8%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-[#bcc9cd] font-mono text-[11px]">
                    <span>7 Active Hotspots</span>
                    <span>Avg. Resolution: 6.8h</span>
                  </div>
                </div>

                {/* Ward 3 */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#191f2f] flex flex-col gap-2 border border-slate-200 dark:border-[#3d494c]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-['Space_Grotesk'] text-sm text-slate-800 dark:text-[#dde2f8] font-semibold">PMC Ward 08 • Aundh</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-[#ffb95f]/10 text-amber-800 dark:text-[#ffb95f] font-mono text-[10px] font-semibold">Nominal</span>
                    </div>
                    <span className="font-mono text-xs text-amber-600 dark:text-[#ffb95f] font-bold">98.4% SLA</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-[#2f3445] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '98.4%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-[#bcc9cd] font-mono text-[11px]">
                    <span>2 Active Hotspots</span>
                    <span>Avg. Resolution: 2.1h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Active Hotspot Telemetry Card */}
            <div className="lg:col-span-6 flex flex-col gap-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#06b6d4] text-[20px]">warning</span>
                  <span className="font-mono text-xs text-cyan-600 dark:text-[#4cd7f6] uppercase tracking-wider font-semibold">
                    ACTIVE HOTSPOT TELEMETRY
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-[#93000a]/50 border border-red-300 dark:border-[#ffb4ab]/30 text-red-700 dark:text-[#ffb4ab] font-mono text-[10px] font-semibold">
                  URGENT DISPATCH
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="font-['Space_Grotesk'] text-base sm:text-lg text-slate-900 dark:text-[#dde2f8] font-bold">
                  #PUN-2025-0001: Karve Road - Nal Stop Junction
                </h4>
                <span className="text-xs text-slate-600 dark:text-[#bcc9cd]">Severe Structural Pothole & Road Waterlogging Cluster</span>
              </div>

              {/* Coordinate HUD Box */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080e1d] border border-slate-200 dark:border-[#3d494c]/40 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-ping"></span>
                  <span className="text-slate-800 dark:text-[#dde2f8]">18.5074° N, 73.8340° E</span>
                </div>
                <span className="text-cyan-600 dark:text-[#4cd7f6] font-semibold">Sector 14-B</span>
              </div>

              {/* Telemetry Stats Matrix */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#191f2f] border border-slate-200 dark:border-[#3d494c]/30 text-center">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd]">Merged Reports</span>
                  <span className="font-['Space_Grotesk'] text-base font-bold text-cyan-600 dark:text-[#4cd7f6]">14 Tickets</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd]">SLA Countdown</span>
                  <span className="font-['Space_Grotesk'] text-base font-bold text-amber-600 dark:text-[#ffb95f]">01h 42m</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd]">Assigned Unit</span>
                  <span className="font-['Space_Grotesk'] text-base font-bold text-sky-600 dark:text-[#5de6ff]">QRT Unit #04</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-[#242a3a] border border-slate-200 dark:border-[#3d494c]/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-[#4cd7f6]/20 flex items-center justify-center text-cyan-700 dark:text-[#4cd7f6]">
                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">QRT Flying Squad En Route</span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd]">ETA: 11 mins • Rapid Patching Rig</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/map')}
                  className="px-3 py-1.5 rounded-lg bg-[#06b6d4] text-white dark:text-[#003640] font-['Space_Grotesk'] text-xs font-bold hover:brightness-105 transition-all cursor-pointer shadow-xs"
                >
                  Track on Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: DUAL PORTAL EXPERIENCES ─────────────────────── */}
      <section className="w-full py-16 px-4 sm:px-8 lg:px-12 bg-slate-100/70 dark:bg-[#080e1d]/60 border-t border-slate-200 dark:border-[#3d494c]/20">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <span className="font-mono text-xs text-sky-600 dark:text-[#5de6ff] tracking-widest uppercase mb-2 font-semibold">
              TWO INTEGRATED INTERFACES
            </span>
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl text-slate-900 dark:text-[#dde2f8] font-bold tracking-tight mb-3">
              Dual Portal Experiences
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#bcc9cd]">
              Built for seamless collaboration between civic residents and municipal decision makers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Citizen Card */}
            <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xl">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-[#191f2f] flex items-center justify-center text-cyan-600 dark:text-[#4cd7f6]">
                    <span className="material-symbols-outlined text-[24px]">record_voice_over</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#191f2f] font-mono text-[10px] text-cyan-700 dark:text-[#4cd7f6] uppercase border border-slate-200 dark:border-[#3d494c]/30 font-semibold">
                    Citizen Front
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-['Space_Grotesk'] text-xl text-slate-900 dark:text-[#dde2f8] font-bold">Zero-Friction Civic Action</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#bcc9cd] leading-relaxed">
                    Empower every Pune citizen with intelligent mobile-first tools to log infrastructure bottlenecks without bureaucratic hurdles.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 mt-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#191f2f] border border-slate-200 dark:border-[#3d494c]/20">
                    <span className="material-symbols-outlined text-[#06b6d4] text-[20px]">photo_camera</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">AI Image Classification</span>
                      <span className="text-[11px] text-slate-500 dark:text-[#bcc9cd]">Instant category identification and GPS location lock.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#191f2f] border border-slate-200 dark:border-[#3d494c]/20">
                    <span className="material-symbols-outlined text-sky-500 text-[20px]">layers</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">Proximity Duplicate Detection</span>
                      <span className="text-[11px] text-slate-500 dark:text-[#bcc9cd]">Detects nearby reports within 80 meters to prevent duplicate clutter.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#191f2f] border border-slate-200 dark:border-[#3d494c]/20">
                    <span className="material-symbols-outlined text-amber-500 text-[20px]">rate_review</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">Resolution Verification & Feedback</span>
                      <span className="text-[11px] text-slate-500 dark:text-[#bcc9cd]">Review contractor photo evidence and verify or challenge resolution.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#3d494c]/30">
                <Link
                  to="/citizen"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-[#242a3a] text-cyan-700 dark:text-[#4cd7f6] font-['Space_Grotesk'] text-sm font-semibold hover:bg-slate-200 dark:hover:bg-[#2f3445] transition-all cursor-pointer"
                >
                  <span>Launch Citizen Portal</span>
                  <span className="material-symbols-outlined text-[18px]">north_east</span>
                </Link>
              </div>
            </div>

            {/* Authority Card */}
            <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xl">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-[#191f2f] flex items-center justify-center text-sky-600 dark:text-[#5de6ff]">
                    <span className="material-symbols-outlined text-[24px]">query_stats</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#191f2f] font-mono text-[10px] text-sky-700 dark:text-[#5de6ff] uppercase border border-slate-200 dark:border-[#3d494c]/30 font-semibold">
                    PMC Command Console
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-['Space_Grotesk'] text-xl text-slate-900 dark:text-[#dde2f8] font-bold">Predictive Command Center</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#bcc9cd] leading-relaxed">
                    Equip municipal commissioners, ward officers, and field supervisors with high-density situational intelligence.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 mt-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#191f2f] border border-slate-200 dark:border-[#3d494c]/20">
                    <span className="material-symbols-outlined text-[#06b6d4] text-[20px]">map</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">Geospatial Live Map</span>
                      <span className="text-[11px] text-slate-500 dark:text-[#bcc9cd]">Real-time MapLibre GL map with clustering, severity layers and filters.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#191f2f] border border-slate-200 dark:border-[#3d494c]/20">
                    <span className="material-symbols-outlined text-sky-500 text-[20px]">assignment</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">Lifecycle Dispatch & Department Routing</span>
                      <span className="text-[11px] text-slate-500 dark:text-[#bcc9cd]">Assign to Roads, Solid Waste, Water, or Storm Water with official remarks.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#191f2f] border border-slate-200 dark:border-[#3d494c]/20">
                    <span className="material-symbols-outlined text-amber-500 text-[20px]">speed</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">Dynamic Priority & Overdue Tracking</span>
                      <span className="text-[11px] text-slate-500 dark:text-[#bcc9cd]">Rule-based priority scoring using severity, recurrence and SLA duration.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#3d494c]/30">
                <Link
                  to="/command-center"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#06b6d4] text-white dark:text-[#003640] font-['Space_Grotesk'] text-sm font-bold shadow-md hover:brightness-105 transition-all cursor-pointer"
                >
                  <span>Open Command Center</span>
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: OPEN CORE ARCHITECTURE ──────────────────────── */}
      <section className="w-full py-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-xs text-slate-500 dark:text-[#bcc9cd] tracking-widest uppercase mb-1">
              ENGINEERED FOR SCALE
            </span>
            <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl text-slate-900 dark:text-[#dde2f8] font-bold">
              Open-Source Core Technologies
            </h3>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xs">
              <span className="material-symbols-outlined text-cyan-600 dark:text-[#4cd7f6] text-[18px]">database</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">PostgreSQL 15 + PostGIS</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xs">
              <span className="material-symbols-outlined text-sky-600 dark:text-[#5de6ff] text-[18px]">javascript</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">Node.js Express Gateway</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xs">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#acedff] text-[18px]">psychology</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">Python Flask AI Service</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xs">
              <span className="material-symbols-outlined text-amber-600 dark:text-[#ffb95f] text-[18px]">layers</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">MapLibre GL JS</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xs">
              <span className="material-symbols-outlined text-cyan-600 dark:text-[#4cd7f6] text-[18px]">speed</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">Recharts Telemetry</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#3d494c]/40 shadow-xs">
              <span className="material-symbols-outlined text-slate-500 dark:text-[#bcc9cd] text-[18px]">terminal</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-[#dde2f8]">Docker Ready</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
