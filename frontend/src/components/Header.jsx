import React from 'react';
import { Wind, RefreshCw, ExternalLink, Sun, Moon } from 'lucide-react';

export default function Header({ dataStatus, isRefreshing, onRefresh, theme, onToggleTheme }) {
  const isConnected = dataStatus?.api_connected;
  const lastRefresh = dataStatus?.last_refresh_time
    ? new Date(dataStatus.last_refresh_time).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC'
      }) + ' UTC'
    : 'Connecting...';

  return (
    <header className="glass-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50 to-white dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950/90">
      {/* Brand & Market Identity */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
          <Wind className="w-6 h-6 text-cyan-600 dark:text-cyan-400 animate-spin-slow" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-950 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              WindSight
            </h1>
            <span className="badge-glow-cyan text-[10px] tracking-wider uppercase font-bold py-0.5">
              UK Day-Ahead Market
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            National Wind Generation Forecast vs. Actual Outturn Analytics (January 2026)
          </p>
        </div>
      </div>

      {/* Connection Beacon, Theme Toggle & Controls */}
      <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md transition-all ${
            isConnected
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
          }`}
          title={dataStatus?.message || 'Elexon API connection status'}
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span>{isConnected ? 'Elexon BMRS Live' : 'Elexon Cache Mode'}</span>
        </div>

        {/* Sync Info */}
        <div className="hidden lg:flex flex-col text-right">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Last Data Sync</span>
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium">{lastRefresh}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="btn-ghost-dark text-xs p-2 rounded-xl flex items-center gap-1.5"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          id="btn-theme-toggle"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline font-medium">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline font-medium">Dark</span>
            </>
          )}
        </button>

        {/* Sync Button */}
        <button
          onClick={() => onRefresh(true)}
          disabled={isRefreshing}
          className="btn-primary-glow text-xs"
          title="Force refresh actuals and forecasts directly from Elexon BMRS API"
          id="btn-header-sync"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Elexon'}</span>
        </button>

        {/* Official Docs Link */}
        <a
          href="https://bmrs.elexon.co.uk/api-documentation"
          target="_blank"
          rel="noreferrer"
          className="btn-ghost-dark text-xs hidden sm:inline-flex"
          title="Open official Elexon BMRS API documentation"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>BMRS Docs</span>
        </a>
      </div>
    </header>
  );
}
