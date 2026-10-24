import React from 'react';
import { Calendar, Clock, Filter, Sparkles } from 'lucide-react';

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
    { label: 'Jan 1–7', start: '2026-01-01', end: '2026-01-07' },
    { label: 'Jan 8–14', start: '2026-01-08', end: '2026-01-14' },
    { label: 'Jan 15–21', start: '2026-01-15', end: '2026-01-21' },
    { label: 'Jan 22–31', start: '2026-01-22', end: '2026-01-31' },
    { label: 'Full Jan 2026', start: '2026-01-01', end: '2026-01-31' }
  ];

  return (
    <section className="filter-panel" id="filter-panel-section">
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="input-start-date">Start Delivery Date</label>
          <input
            id="input-start-date"
            type="date"
            className="input-control"
            value={startDate}
            min="2026-01-01"
            max="2026-01-31"
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="input-end-date">End Delivery Date</label>
          <input
            id="input-end-date"
            type="date"
            className="input-control"
            value={endDate}
            min="2026-01-01"
            max="2026-01-31"
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="select-cutoff">Decision Cutoff Rule</label>
          <select
            id="select-cutoff"
            className="select-control"
            value={cutoffRule}
            onChange={(e) => onCutoffChange(e.target.value)}
          >
            <option value="DA_1200">Day-Ahead 12:00 UTC (UK Power Auction Default)</option>
            <option value="DA_1700">Day-Ahead 17:00 UTC (Evening Gate Closure)</option>
            <option value="D_0000">Delivery Day 00:00 UTC (Midnight Cutoff)</option>
            <option value="HOURS_12">12 Hours Before Delivery</option>
            <option value="HOURS_24">24 Hours Before Delivery</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              onClick={() => {
                onStartDateChange(p.start);
                onEndDateChange(p.end);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          id="btn-apply-filter"
          className="btn btn-primary"
          onClick={onApplyFilters}
          disabled={isLoading}
        >
          <Filter size={15} />
          <span>{isLoading ? 'Loading...' : 'Apply Filters'}</span>
        </button>
      </div>
    </section>
  );
}
