import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

function ErrorTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isOver = data.error_mw >= 0;

    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-time">{data.formattedTime} UTC</div>
        <div className="tooltip-row" style={{ color: isOver ? 'var(--accent-amber)' : 'var(--accent-cyan)' }}>
          <span>Signed Error:</span>
          <strong>{isOver ? `+${data.error_mw.toLocaleString()}` : data.error_mw.toLocaleString()} MW</strong>
        </div>
        <div className="tooltip-row" style={{ color: 'var(--text-muted)' }}>
          <span>Deviation Type:</span>
          <span>{isOver ? 'Overforecast (Fcst > Act)' : 'Underforecast (Fcst < Act)'}</span>
        </div>
        {data.pct_error !== null && (
          <div className="tooltip-row" style={{ color: 'var(--text-dim)' }}>
            <span>Relative Error:</span>
            <span>{data.pct_error}%</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default function ErrorChart({ intervals, topOver, topUnder, onSelectInterval }) {
  if (!intervals || intervals.length === 0) return null;

  const chartData = intervals.map((item) => {
    const dt = new Date(item.start_time);
    const day = dt.getUTCDate().toString().padStart(2, '0');
    const month = dt.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' });
    const hours = dt.getUTCHours().toString().padStart(2, '0') + ':00';

    return {
      ...item,
      displayLabel: `${day} ${month} ${hours}`,
      formattedTime: `${day} ${month} 2026 ${hours}`,
    };
  });

  return (
    <div className="analytics-dual-row" id="error-analysis-section">
      {/* Signed Error Distribution Chart */}
      <div className="dashboard-card">
        <div className="card-header-bar">
          <div className="card-title-group">
            <h2>Forecast Signed Error Distribution (MW)</h2>
            <p>Signed Error = Forecast − Actual. Positive = Overforecasting, Negative = Underforecasting</p>
          </div>
        </div>

        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis
                dataKey="displayLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                minTickGap={45}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                unit=" MW"
              />
              <Tooltip content={<ErrorTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} />
              <Bar dataKey="error_mw" name="Signed Error (MW)" maxBarSize={16}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.error_mw >= 0 ? '#f59e0b' : '#06b6d4'}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Deviations Panel */}
      <div className="dashboard-card">
        <div className="card-header-bar">
          <div className="card-title-group">
            <h2>Extreme Deviations</h2>
            <p>Periods of highest market exposure</p>
          </div>
        </div>

        <div className="deviation-list">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Top Overforecasts (Surplus Risk)
          </div>
          {topOver && topOver.slice(0, 3).map((item) => (
            <div
              key={item.start_time}
              className="deviation-item overforecast"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectInterval(item.start_time)}
              title="Click to inspect forecast publication versions"
            >
              <div>
                <div className="deviation-time">
                  {new Date(item.start_time).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Fcst: {item.forecast_mw} MW | Act: {item.actual_mw} MW
                </div>
              </div>
              <div className="deviation-val" style={{ color: 'var(--accent-amber)' }}>
                +{item.error_mw.toLocaleString()} MW
              </div>
            </div>
          ))}

          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>
            Top Underforecasts (Shortage Risk)
          </div>
          {topUnder && topUnder.slice(0, 3).map((item) => (
            <div
              key={item.start_time}
              className="deviation-item underforecast"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectInterval(item.start_time)}
              title="Click to inspect forecast publication versions"
            >
              <div>
                <div className="deviation-time">
                  {new Date(item.start_time).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Fcst: {item.forecast_mw} MW | Act: {item.actual_mw} MW
                </div>
              </div>
              <div className="deviation-val" style={{ color: 'var(--accent-cyan)' }}>
                {item.error_mw.toLocaleString()} MW
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
