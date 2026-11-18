import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, setFastDemoUser } = useAuth();

  const [activeRole, setActiveRole] = useState<'authority' | 'citizen' | 'contractor'>('authority');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [isOtpMode, setIsOtpMode] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>('');
  const [identifier, setIdentifier] = useState<string>('admin@civicpulse.in');
  const [password, setPassword] = useState<string>('Admin@2025');
  const [ward, setWard] = useState<string>('pmc-ward14-kothrud');
  const [phone, setPhone] = useState<string>('+91-9876543210');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRoleSwitch = (role: 'authority' | 'citizen' | 'contractor') => {
    setActiveRole(role);
    setErrorMsg(null);
    if (role === 'authority') {
      setIdentifier('admin@civicpulse.in');
      setPassword('Admin@2025');
      setWard('pmc-ward14-kothrud');
    } else if (role === 'contractor') {
      setIdentifier('supervisor@civicpulse.in');
      setPassword('Admin@2025');
      setWard('pmc-ward09-shivajinagar');
    } else {
      setIdentifier('aditya@example.com');
      setPassword('Citizen@2025');
      setWard('pmc-ward14-kothrud');
    }
  };

  const handleQuickDemoFill = async (role: 'admin' | 'supervisor' | 'citizen') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await setFastDemoUser(role);
      setSuccessMsg(`Authenticated as ${role.toUpperCase()}! Redirecting...`);
      setTimeout(() => {
        if (role === 'citizen') navigate('/citizen');
        else navigate('/command-center');
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isRegisterMode) {
        const user = await register(name || 'Pune Resident', identifier, password, ward, phone);
        setSuccessMsg(`Welcome, ${user.name}! Account registered.`);
        setTimeout(() => navigate('/citizen'), 800);
      } else {
        const user = await login(identifier, password);
        setSuccessMsg(`Access Granted. Welcome, ${user.name}!`);
        setTimeout(() => {
          if (user.role === 'admin' || user.role === 'supervisor') {
            navigate('/command-center');
          } else {
            navigate('/citizen');
          }
        }, 800);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Authentication failed. Please verify credentials.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-slate-50 dark:bg-[#0d1322] text-slate-800 dark:text-[#dde2f8] transition-colors duration-200">
      <div className="w-full max-w-7xl mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN: Brand Briefing & Fast Demo Presets */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* Header branding */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#242a3a] text-cyan-700 dark:text-[#4cd7f6] font-mono text-xs uppercase tracking-wider border border-slate-200 dark:border-[#3d494c]/40 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-ping"></span>
                  Live Telemetry Engine v4.2
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white dark:bg-[#242a3a] text-amber-700 dark:text-[#ffb95f] font-mono text-xs border border-slate-200 dark:border-[#3d494c]/40 shadow-xs">
                  <span className="material-symbols-outlined text-xs">school</span>
                  Pune Demonstration Platform
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#06b6d4] flex items-center justify-center text-white dark:text-[#003640] shadow-md">
                    <span className="material-symbols-outlined text-xl font-bold">radar</span>
                  </div>
                  <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl text-slate-900 dark:text-[#dde2f8] font-bold tracking-tight">
                    CivicPulse <span className="text-cyan-600 dark:text-[#4cd7f6]">AI</span>
                  </h1>
                </div>
                <p className="text-sm text-slate-600 dark:text-[#bcc9cd] max-w-xl mt-2 leading-relaxed">
                  Autonomous municipal dispatch orchestration and real-time civic anomaly synthesis for Pune Municipal Corporation operations.
                </p>
              </div>
            </div>

            {/* Network Grid State Card */}
            <div className="bg-white dark:bg-[#151b2b] rounded-2xl p-6 border border-slate-200 dark:border-[#3d494c]/40 shadow-xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-cyan-400/10 dark:bg-[#4cd7f6]/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#3d494c]/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-600 dark:text-[#4cd7f6] text-xl">hub</span>
                  <span className="font-mono text-xs text-slate-800 dark:text-[#dde2f8] uppercase tracking-wider font-semibold">
                    Network Grid State
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-pulse"></span>
                  <span className="font-mono text-xs text-cyan-700 dark:text-[#4cd7f6] font-semibold">PMC Nodes Active: 99.8%</span>
                </div>
              </div>

              {/* Dynamic Visual Waveform */}
              <div className="w-full h-14 py-2 flex items-end gap-1.5 opacity-90">
                <div className="w-full bg-slate-200 dark:bg-[#242a3a] h-[40%] rounded-t-sm"></div>
                <div className="w-full bg-slate-200 dark:bg-[#242a3a] h-[55%] rounded-t-sm"></div>
                <div className="w-full bg-cyan-400/40 dark:bg-[#4cd7f6]/40 h-[70%] rounded-t-sm"></div>
                <div className="w-full bg-cyan-400/60 dark:bg-[#4cd7f6]/60 h-[85%] rounded-t-sm"></div>
                <div className="w-full bg-[#06b6d4] dark:bg-[#4cd7f6] h-[98%] rounded-t-sm shadow-sm"></div>
                <div className="w-full bg-cyan-400/70 dark:bg-[#4cd7f6]/70 h-[65%] rounded-t-sm"></div>
                <div className="w-full bg-slate-200 dark:bg-[#242a3a] h-[45%] rounded-t-sm"></div>
                <div className="w-full bg-slate-200 dark:bg-[#242a3a] h-[60%] rounded-t-sm"></div>
                <div className="w-full bg-cyan-400/50 dark:bg-[#4cd7f6]/50 h-[80%] rounded-t-sm"></div>
                <div className="w-full bg-[#06b6d4] dark:bg-[#4cd7f6]/80 h-[92%] rounded-t-sm"></div>
                <div className="w-full bg-[#06b6d4] dark:bg-[#4cd7f6] h-[94%] rounded-t-sm"></div>
                <div className="w-full bg-slate-200 dark:bg-[#242a3a] h-[50%] rounded-t-sm"></div>
                <div className="w-full bg-cyan-400/30 dark:bg-[#4cd7f6]/30 h-[75%] rounded-t-sm"></div>
                <div className="w-full bg-[#06b6d4] dark:bg-[#4cd7f6]/80 h-[88%] rounded-t-sm"></div>
                <div className="w-full bg-slate-200 dark:bg-[#242a3a] h-[52%] rounded-t-sm"></div>
              </div>

              <div className="flex justify-between items-center pt-2 font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd]">
                <span>SECTOR: 18.5204° N, 73.8567° E</span>
                <span>LATENCY: 12ms (EDGE DEDUPLICATION ONLINE)</span>
              </div>
            </div>

            {/* Telemetry Trio Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#191f2f] rounded-xl p-4 border border-slate-200 dark:border-[#3d494c]/30 flex flex-col justify-between shadow-sm">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#bcc9cd]">Median Dispatch</span>
                <div className="py-1">
                  <span className="font-['Space_Grotesk'] text-3xl text-cyan-600 dark:text-[#4cd7f6] font-bold tracking-tight">45</span>
                  <span className="text-xs text-slate-500 dark:text-[#bcc9cd] ml-1">sec</span>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-[#bcc9cd] flex items-center gap-1">
                  <span className="material-symbols-outlined text-cyan-600 dark:text-[#4cd7f6] text-xs">bolt</span>
                  Rapid triage routing
                </span>
              </div>
              <div className="bg-white dark:bg-[#191f2f] rounded-xl p-4 border border-slate-200 dark:border-[#3d494c]/30 flex flex-col justify-between shadow-sm">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#bcc9cd]">Spatial Radius</span>
                <div className="py-1">
                  <span className="font-['Space_Grotesk'] text-3xl text-sky-600 dark:text-[#5de6ff] font-bold tracking-tight">35</span>
                  <span className="text-xs text-slate-500 dark:text-[#bcc9cd] ml-1">meters</span>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-[#bcc9cd] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sky-600 dark:text-[#5de6ff] text-xs">layers</span>
                  PostGIS polygon cluster
                </span>
              </div>
              <div className="bg-white dark:bg-[#191f2f] rounded-xl p-4 border border-slate-200 dark:border-[#3d494c]/30 flex flex-col justify-between shadow-sm">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#bcc9cd]">Vision Accuracy</span>
                <div className="py-1">
                  <span className="font-['Space_Grotesk'] text-3xl text-amber-600 dark:text-[#ffb95f] font-bold tracking-tight">94.8</span>
                  <span className="text-xs text-slate-500 dark:text-[#bcc9cd] ml-1">%</span>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-[#bcc9cd] flex items-center gap-1">
                  <span className="material-symbols-outlined text-amber-600 dark:text-[#ffb95f] text-xs">verified</span>
                  Heuristic anomaly match
                </span>
              </div>
            </div>

            {/* 1-Click Interactive Demo Access Bar */}
            <div className="bg-slate-100 dark:bg-[#080e1d] rounded-2xl p-5 border border-slate-200 dark:border-[#3d494c]/40 shadow-sm flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 dark:text-[#ffb95f] text-base">play_circle</span>
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-800 dark:text-[#dde2f8] font-bold">
                    Quick Demo Profiles • 1-Click Login
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd]">Instant Access</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('admin')}
                  className="flex flex-col items-start p-3 rounded-xl bg-white dark:bg-[#191f2f] text-left hover:bg-slate-50 dark:hover:bg-[#242a3a] border border-slate-200 dark:border-[#3d494c]/40 hover:border-cyan-500 transition-all cursor-pointer group shadow-2xs"
                >
                  <span className="font-mono text-xs text-cyan-700 dark:text-[#4cd7f6] font-bold">
                    PMC Ward 14 Lead
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-[#bcc9cd]">Municipal Officer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('supervisor')}
                  className="flex flex-col items-start p-3 rounded-xl bg-white dark:bg-[#191f2f] text-left hover:bg-slate-50 dark:hover:bg-[#242a3a] border border-slate-200 dark:border-[#3d494c]/40 hover:border-sky-500 transition-all cursor-pointer group shadow-2xs"
                >
                  <span className="font-mono text-xs text-sky-700 dark:text-[#5de6ff] font-bold">
                    QRT Rapid Lead
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-[#bcc9cd]">Field Supervisor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('citizen')}
                  className="flex flex-col items-start p-3 rounded-xl bg-white dark:bg-[#191f2f] text-left hover:bg-slate-50 dark:hover:bg-[#242a3a] border border-slate-200 dark:border-[#3d494c]/40 hover:border-amber-500 transition-all cursor-pointer group shadow-2xs"
                >
                  <span className="font-mono text-xs text-amber-700 dark:text-[#ffb95f] font-bold">
                    Verified Citizen
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-[#bcc9cd]">Ward 14 Resident</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Authentication Hub */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="w-full bg-white dark:bg-[#151b2b] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#3d494c]/40 shadow-xl relative backdrop-blur-xl">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-400/5 dark:bg-[#4cd7f6]/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* Card Header & Role Nav Tabs */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl text-slate-900 dark:text-[#dde2f8] font-bold">
                      {isRegisterMode ? 'Citizen Registration' : 'Access Console'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#bcc9cd]">
                      {isRegisterMode
                        ? 'Join the Pune civic monitoring network'
                        : 'Select credentials profile & ward assignment'}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#242a3a] flex items-center justify-center text-cyan-600 dark:text-[#4cd7f6]">
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  </div>
                </div>

                {/* Role Switcher Segmented Pills */}
                {!isRegisterMode && (
                  <div className="bg-slate-100 dark:bg-[#080e1d] p-1 rounded-xl flex items-center justify-between border border-slate-200 dark:border-[#3d494c]/30 shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleRoleSwitch('authority')}
                      className={`w-1/3 py-2 text-center rounded-lg font-mono text-[11px] uppercase transition-all font-semibold cursor-pointer ${
                        activeRole === 'authority'
                          ? 'bg-[#06b6d4] text-white dark:text-[#003640] shadow-sm'
                          : 'text-slate-600 dark:text-[#bcc9cd] hover:text-slate-900 dark:hover:text-[#dde2f8]'
                      }`}
                    >
                      Officer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleSwitch('citizen')}
                      className={`w-1/3 py-2 text-center rounded-lg font-mono text-[11px] uppercase transition-all font-semibold cursor-pointer ${
                        activeRole === 'citizen'
                          ? 'bg-[#06b6d4] text-white dark:text-[#003640] shadow-sm'
                          : 'text-slate-600 dark:text-[#bcc9cd] hover:text-slate-900 dark:hover:text-[#dde2f8]'
                      }`}
                    >
                      Citizen
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleSwitch('contractor')}
                      className={`w-1/3 py-2 text-center rounded-lg font-mono text-[11px] uppercase transition-all font-semibold cursor-pointer ${
                        activeRole === 'contractor'
                          ? 'bg-[#06b6d4] text-white dark:text-[#003640] shadow-sm'
                          : 'text-slate-600 dark:text-[#bcc9cd] hover:text-slate-900 dark:hover:text-[#dde2f8]'
                      }`}
                    >
                      Field QRT
                    </button>
                  </div>
                )}
              </div>

              {/* Feedback Banners */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-[#93000a]/30 border border-red-200 dark:border-[#ffb4ab]/40 text-red-700 dark:text-[#ffb4ab] text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-[#10b981]/20 border border-emerald-200 dark:border-[#10b981]/40 text-emerald-700 dark:text-[#34d399] text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegisterMode && (
                  <div className="space-y-1">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 dark:text-[#dde2f8]">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 dark:text-[#bcc9cd] text-lg">person</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aditya Kulkarni"
                        required
                        className="w-full bg-slate-50 dark:bg-[#080e1d] text-slate-900 dark:text-[#dde2f8] placeholder-slate-400 dark:placeholder-[#869397] text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-300 dark:border-[#3d494c]/50 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                      />
                    </div>
                  </div>
                )}

                {/* Email / Mobile ID Input */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 dark:text-[#dde2f8]">
                    {activeRole === 'authority'
                      ? 'Official Municipal Email'
                      : activeRole === 'contractor'
                      ? 'Contractor Agency Identifier'
                      : 'Citizen Email / Mobile ID'}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 dark:text-[#bcc9cd] text-lg">badge</span>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="name@punecorporation.gov.in"
                      required
                      className="w-full bg-slate-50 dark:bg-[#080e1d] text-slate-900 dark:text-[#dde2f8] placeholder-slate-400 dark:placeholder-[#869397] text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-300 dark:border-[#3d494c]/50 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                    />
                  </div>
                </div>

                {/* Passkey / OTP Toggle Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-slate-700 dark:text-[#dde2f8]">
                      {isOtpMode ? '6-Digit 1-Time Passcode (OTP)' : 'Encrypted Security Passkey'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsOtpMode(!isOtpMode)}
                      className="font-mono text-[11px] text-cyan-600 dark:text-[#4cd7f6] hover:underline cursor-pointer"
                    >
                      {isOtpMode ? 'Use Password' : 'Request 1-Time OTP'}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 dark:text-[#bcc9cd] text-lg">
                      {isOtpMode ? 'sms' : 'key'}
                    </span>
                    <input
                      type={showPassword || isOtpMode ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isOtpMode ? 'Enter 6-digit SMS OTP' : 'Enter Passkey'}
                      required
                      className="w-full bg-slate-50 dark:bg-[#080e1d] text-slate-900 dark:text-[#dde2f8] placeholder-slate-400 dark:placeholder-[#869397] font-mono text-sm tracking-wider rounded-xl pl-10 pr-10 py-2.5 border border-slate-300 dark:border-[#3d494c]/50 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                    />
                    {!isOtpMode && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-[#bcc9cd] dark:hover:text-[#dde2f8]"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Ward Selection */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 dark:text-[#dde2f8]">
                    Operational Ward Jurisdiction
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 dark:text-[#bcc9cd] text-lg">location_city</span>
                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="w-full appearance-none bg-slate-50 dark:bg-[#080e1d] text-slate-900 dark:text-[#dde2f8] text-sm rounded-xl pl-10 pr-10 py-2.5 border border-slate-300 dark:border-[#3d494c]/50 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] cursor-pointer"
                    >
                      <option value="pmc-ward14-kothrud" className="bg-white dark:bg-[#080e1d]">Ward 14 - Kothrud / Karve Rd</option>
                      <option value="pmc-ward09-shivajinagar" className="bg-white dark:bg-[#080e1d]">Ward 09 - Shivajinagar / Model Colony</option>
                      <option value="pmc-ward21-hadapsar" className="bg-white dark:bg-[#080e1d]">Ward 21 - Hadapsar / Magarpatta</option>
                      <option value="pmc-ward02-baner" className="bg-white dark:bg-[#080e1d]">Ward 02 - Baner / Balewadi Corridor</option>
                      <option value="pmc-ward16-kasba" className="bg-white dark:bg-[#080e1d]">Ward 16 - Kasba Peth / Central Core</option>
                      <option value="pmc-ward08-aundh" className="bg-white dark:bg-[#080e1d]">Ward 08 - Aundh / ITI Road</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 dark:text-[#bcc9cd] pointer-events-none text-lg">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#06b6d4] hover:bg-cyan-500 text-white dark:text-[#003640] font-['Space_Grotesk'] font-bold text-sm py-3 px-4 rounded-xl shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white dark:border-[#003640] border-t-transparent rounded-full animate-spin"></span>
                        <span>Authenticating Telemetry Node...</span>
                      </>
                    ) : (
                      <>
                        <span>{isRegisterMode ? 'Register & Access Portal' : 'Authorize & Access Hub'}</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Switch Login / Register */}
                <div className="pt-2 flex flex-col space-y-2 text-center border-t border-slate-200 dark:border-[#3d494c]/30">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-[#bcc9cd]">
                    <span>{isRegisterMode ? 'Already have credentials?' : 'First-time civic contributor?'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-cyan-600 dark:text-[#4cd7f6] hover:underline font-semibold transition-colors cursor-pointer"
                    >
                      {isRegisterMode ? 'Sign In as Officer / Resident' : 'Register Citizen Account'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
