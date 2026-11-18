import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0d1322]/90 backdrop-blur-xl border-b border-slate-200 dark:border-[#3d494c]/30 shadow-sm transition-colors duration-200">
      <div className="h-20 w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
        
        {/* Brand & System Status */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex flex-col group">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] dark:bg-[#4cd7f6] animate-pulse shadow-[0_0_10px_#06b6d4]"></div>
              <span className="font-['Space_Grotesk'] text-xl tracking-tight text-slate-900 dark:text-[#dde2f8] font-bold">
                CivicPulse <span className="text-[#0891b2] dark:text-[#4cd7f6]">AI</span>
              </span>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#242a3a] border border-slate-200 dark:border-transparent">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0891b2] dark:bg-[#4cd7f6]"></span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#0891b2] dark:text-[#4cd7f6] font-semibold">
                  Live Operations
                </span>
              </div>
            </div>
            <span className="font-mono text-[10px] text-slate-500 dark:text-[#bcc9cd] font-medium tracking-wide mt-0.5 pl-5">
              Pune Urban Intelligence Hub • Demonstration
            </span>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#080e1d]/80 border border-slate-200 dark:border-[#3d494c]/30">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              isActive('/')
                ? 'bg-[#06b6d4] text-white dark:text-[#003640] shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-600 dark:text-[#bcc9cd] hover:text-slate-900 dark:hover:text-[#dde2f8] hover:bg-slate-200/70 dark:hover:bg-[#242a3a]'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/map"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              isActive('/map')
                ? 'bg-[#06b6d4] text-white dark:text-[#003640] shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-600 dark:text-[#bcc9cd] hover:text-slate-900 dark:hover:text-[#dde2f8] hover:bg-slate-200/70 dark:hover:bg-[#242a3a]'
            }`}
          >
            Pune Live Map
          </Link>
          <Link
            to="/citizen"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              isActive('/citizen')
                ? 'bg-[#06b6d4] text-white dark:text-[#003640] shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-600 dark:text-[#bcc9cd] hover:text-slate-900 dark:hover:text-[#dde2f8] hover:bg-slate-200/70 dark:hover:bg-[#242a3a]'
            }`}
          >
            Citizen Action Portal
          </Link>
          <Link
            to="/command-center"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              isActive('/command-center')
                ? 'bg-[#06b6d4] text-white dark:text-[#003640] shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-600 dark:text-[#bcc9cd] hover:text-slate-900 dark:hover:text-[#dde2f8] hover:bg-slate-200/70 dark:hover:bg-[#242a3a]'
            }`}
          >
            Command Centre
          </Link>
        </nav>

        {/* Right Actions: Theme Toggle + Auth */}
        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#3d494c] bg-slate-100 dark:bg-[#151b2b] text-slate-700 dark:text-[#4cd7f6] hover:border-[#06b6d4] dark:hover:border-[#4cd7f6] transition-all shadow-sm group"
            title={isDark ? 'Switch to Clean Light Theme' : 'Switch to CyberNavy Dark Theme'}
            aria-label="Toggle theme mode"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:rotate-45">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="font-mono text-[11px] font-semibold hidden md:inline">
              {isDark ? 'Light' : 'Dark'}
            </span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 dark:text-[#dde2f8]">{user?.name}</span>
                <span className="text-[10px] font-mono text-[#0891b2] dark:text-[#4cd7f6] uppercase tracking-wider">
                  {user?.role === 'admin' ? 'PMC Lead Officer' : user?.role === 'supervisor' ? 'Ward Supervisor' : 'Resident Contributor'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#06b6d4] dark:bg-[#4cd7f6] flex items-center justify-center text-white dark:text-[#003640] font-bold text-xs shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:text-[#bcc9cd] dark:hover:text-[#ffb4ab] dark:hover:bg-[#191f2f] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#06b6d4] text-white dark:text-[#003640] text-xs font-bold shadow-md hover:brightness-105 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Operator & Citizen Login</span>
            </Link>
          )}

          {/* Quick link to Command center or Report */}
          <button
            onClick={() => navigate(isAdmin ? '/command-center' : '/citizen')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#3d494c] bg-white dark:bg-[#191f2f] text-slate-800 dark:text-[#4cd7f6] text-xs font-mono font-semibold hover:border-[#06b6d4] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isAdmin ? 'terminal' : 'add_circle'}
            </span>
            <span>{isAdmin ? 'Console' : 'Report Issue'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
