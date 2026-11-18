import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-100 dark:bg-[#080e1d] border-t border-slate-200 dark:border-[#3d494c]/30 mt-16 transition-colors duration-200">
      <div className="w-full px-6 sm:px-12 py-10 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-lg text-slate-900 dark:text-[#dde2f8] font-bold">
                CivicPulse <span className="text-[#0891b2] dark:text-[#4cd7f6]">AI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-[#242a3a] font-mono text-[10px] text-amber-800 dark:text-[#ffb95f] font-semibold">
                v2.4 LTS
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#bcc9cd] leading-relaxed">
              Civic infrastructure intelligence and municipal telemetry synthesis engineered for rapid triage, automated duplicate mitigation, and verified complaint tracking in Pune.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#191f2f] font-mono text-[11px] text-cyan-700 dark:text-[#4cd7f6] border border-slate-200 dark:border-[#3d494c]/30 shadow-xs">
              PostgreSQL / PostGIS
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#191f2f] font-mono text-[11px] text-teal-700 dark:text-[#5de6ff] border border-slate-200 dark:border-[#3d494c]/30 shadow-xs">
              OpenCV / Pillow Vision
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#191f2f] font-mono text-[11px] text-sky-700 dark:text-[#acedff] border border-slate-200 dark:border-[#3d494c]/30 shadow-xs">
              S-BERT Duplicate NLP
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#191f2f] font-mono text-[11px] text-blue-700 dark:text-[#2fd9f4] border border-slate-200 dark:border-[#3d494c]/30 shadow-xs">
              Python Flask AI
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#191f2f] font-mono text-[11px] text-slate-700 dark:text-[#bcc9cd] border border-slate-200 dark:border-[#3d494c]/30 shadow-xs">
              Express.js Gateway
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#191f2f] font-mono text-[11px] text-amber-700 dark:text-[#ffb95f] border border-slate-200 dark:border-[#3d494c]/30 shadow-xs">
              MapLibre GL JS
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-[#3d494c]/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-500 dark:text-[#bcc9cd]">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#06b6d4] dark:bg-[#4cd7f6] animate-pulse"></span>
              <span className="text-slate-800 dark:text-[#dde2f8] font-medium">Pune Ward Matrix:</span>
              <span>15 / 15 Administrative Wards Active</span>
            </div>
            <span className="text-slate-300 dark:text-[#3d494c]">•</span>
            <span>Telemetry: <span className="text-[#0891b2] dark:text-[#4cd7f6]">Real-time Event Stream</span></span>
            <span className="text-slate-300 dark:text-[#3d494c]">•</span>
            <span>Geospatial Engine: <span className="text-[#0891b2] dark:text-[#5de6ff]">ESRI Gray Canvas Vector</span></span>
          </div>
          <div>
            <span>© 2025 CivicPulse AI • Pune Demonstration Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
