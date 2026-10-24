import React from 'react';
import { Calendar, Clock, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function FilterPanel({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  cutoffRule,
  onCutoffChange,
  onApplyFilters,
  isLoading
}) {
  const presets = [
    { label: 'Jan 1–7 (Week 1)', start: '2026-01-01', end: '2026-01-07' },
    { label: 'Jan 8–14 (Week 2)', start: '2026-01-08', end: '2026-01-14' },
    { label: 'Jan 15–21 (Week 3)', start: '2026-01-15', end: '2026-01-21' },
    { label: 'Jan 22–31 (Week 4)', start: '2026-01-22', end: '2026-01-31' },
    { label: 'Full Month (Jan 1–31)', start: '2026-01-01', end: '2026-01-31' }
  ];

  return (
    <section className="glass-card p-4 sm:p-5 flex flex-col gap-4 border-slate-800/80 bg-slate-900/40">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Date Inputs & Cutoff */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 flex-1">
          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-start-date" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Start Delivery Date</span>
            </label>
            <input
              id="input-start-date"
              type="date"
              className="form-control-dark"
              value={startDate}
              min="2026-01-01"
              max="2026-01-31"
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-end-date" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>End Delivery Date</span>
            </label>
            <input
              id="input-end-date"
              type="date"
              className="form-control-dark"
              value={endDate}
              min="2026-01-01"
              max="2026-01-31"
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>

          {/* Decision Cutoff Selector */}
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
            <label htmlFor="select-cutoff" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Day-Ahead Decision Cutoff</span>
            </label>
            <select
              id="select-cutoff"
              className="form-control-dark cursor-pointer font-medium"
              value={cutoffRule}
              onChange={(e) => onCutoffChange(e.target.value)}
            >
              <option value="DA_1200">Day-Ahead 12:00 UTC (UK Power Auction Default)</option>
              <option value="DA_1700">Day-Ahead 17:00 UTC (Evening Gate Closure)</option>
              <option value="D_0000">Delivery Day 00:00 UTC (Midnight Cutoff)</option>
              <option value="HOURS_12">12 Hours Prior to Delivery</option>
              <option value="HOURS_24">24 Hours Prior to Delivery</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center self-end lg:self-center">
          <button
            id="btn-apply-filter"
            onClick={onApplyFilters}
            disabled={isLoading}
            className="btn-primary-glow w-full sm:w-auto h-11 px-6 text-sm"
          >
            <Filter className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
            <span>{isLoading ? 'Processing Query...' : 'Apply Filters'}</span>
          </button>
        </div>
      </div>

      {/* Quick Window Presets Bar */}
      <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
          <span>Quick Windows:</span>
        </span>
        {presets.map((p) => {
          const isActive = startDate === p.start && endDate === p.end;
          return (
            <button
              key={p.label}
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
              }`}
              onClick={() => {
                onStartDateChange(p.start);
                onEndDateChange(p.end);
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
