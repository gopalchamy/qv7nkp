import React from 'react';
import { Wind, Radio, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Header({ dataStatus, isRefreshing, onRefresh }) {
  const isConnected = dataStatus?.api_connected;
  const lastRefresh = dataStatus?.last_refresh_time 
    ? new Date(dataStatus.last_refresh_time).toLocaleString('en-GB', { timeZone: 'UTC' }) + ' UTC'
    : 'Not yet recorded';

  return (
    <header className="app-header" id="header-section">
      <div className="brand-section">
        <div className="brand-icon">
          <Wind size={26} />
        </div>
        <div className="brand-titles">
          <h1>WindSight — UK Wind Analytics</h1>
          <p>National Day-Ahead Wind Forecast Evaluation & Outturn Analysis (January 2026)</p>
        </div>
      </div>

      <div className="header-status-group">
        <div 
          className={`status-badge ${isConnected ? 'connected' : 'degraded'}`}
          title={dataStatus?.message || 'Checking API status...'}
          id="api-status-badge"
        >
          <span className="pulse-dot"></span>
          <span>{isConnected ? 'Elexon BMRS Live' : 'Elexon Cache Mode'}</span>
        </div>

        <div className="refresh-meta">
          <span>Last Refresh: {lastRefresh}</span>
        </div>

        <button 
          className="btn btn-ghost" 
          onClick={() => onRefresh(true)}
          disabled={isRefreshing}
          title="Force refresh data directly from Elexon BMRS"
          id="btn-force-refresh"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Sync Elexon</span>
        </button>
      </div>
    </header>
  );
}
