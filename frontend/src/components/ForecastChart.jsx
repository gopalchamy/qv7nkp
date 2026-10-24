import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const errorMw = data.forecast_mw - data.actual_mw;
    const isOver = errorMw >= 0;

    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-time">Delivery: {data.formattedTime} UTC</div>
        <div className="tooltip-row" style={{ color: 'var(--accent-amber)' }}>
          <span>Forecast (Cutoff):</span>
          <strong>{data.forecast_mw.toLocaleString()} MW</strong>
        </div>
        <div className="tooltip-row" style={{ color: 'var(--accent-cyan)' }}>
          <span>Metered Actual:</span>
          <strong>{data.actual_mw.toLocaleString()} MW</strong>
        </div>
        <div className="tooltip-row" style={{ color: isOver ? 'var(--accent-amber)' : 'var(--accent-cyan)', marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.3rem' }}>
          <span>Error (Fcst - Act):</span>
          <strong>{isOver ? `+${errorMw.toFixed(1)}` : errorMw.toFixed(1)} MW</strong>
        </div>
      </div>
    );
  }
  return null;
}

export default function ForecastChart({ intervals }) {
  if (!intervals || intervals.length === 0) {
    return (
      <div className="dashboard-card" id="forecast-chart-empty">
        <div className="card-header-bar">
          <div className="card-title-group">
            <h2>Wind Generation: Forecast vs Actual</h2>
            <p>No delivery intervals matched for the selected filters.</p>
          </div>
        </div>
      </div>
    );
  }

  // Format data for chart
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
    <div className="dashboard-card" id="forecast-chart-section">
      <div className="card-header-bar">
        <div className="card-title-group">
          <h2>National Wind Generation: Forecast vs. Actual Outturn</h2>
          <p>Comparing Elexon WINDFOR (at cutoff) with metered FUELHH WIND actuals</p>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="displayLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={45}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              unit=" MW"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="forecast_mw"
              name="Forecast at Cutoff"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="actual_mw"
              name="Actual Outturn (WIND)"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
