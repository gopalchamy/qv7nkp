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
import { AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function ErrorTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isOver = data.error_mw >= 0;

    return (
      <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[200px]">
        <div className="font-bold text-white border-b border-slate-800 pb-1">
          {data.formattedTime} UTC
        </div>
        <div className="flex items-center justify-between font-mono">
          <span className="text-slate-400 font-sans">Signed Error:</span>
          <strong className={isOver ? 'text-amber-400' : 'text-cyan-400'}>
            {isOver ? `+${data.error_mw.toLocaleString()}` : data.error_mw.toLocaleString()} MW
          </strong>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Type:</span>
          <span className="font-semibold">{isOver ? 'Overforecasting (Surplus)' : 'Underforecasting (Deficit)'}</span>
        </div>
        {data.pct_error !== null && (
          <div className="flex items-center justify-between text-slate-400 border-t border-slate-800 pt-1 font-mono">
            <span>Percentage Error:</span>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="error-analysis-section">
      {/* 1. Signed Error Bar Chart (2 cols on large screen) */}
      <div className="glass-card p-5 sm:p-6 lg:col-span-2 border-slate-800/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>Forecast Error Distribution (MW)</span>
            </h2>
            <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              Signed Error = Forecast − Actual
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Orange bars indicate overforecasting (procurement surplus); Cyan bars indicate underforecasting (unhedged shortage).
          </p>
        </div>

        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
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
              <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1.5} />
              <Bar dataKey="error_mw" name="Signed Error (MW)" maxBarSize={18}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.error_mw >= 0 ? '#f59e0b' : '#06b6d4'}
                    opacity={0.88}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Top Extreme Deviations Panel (1 col) */}
      <div className="glass-card p-5 sm:p-6 border-slate-800/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Extreme Deviations</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Top market exposure intervals. Click any item to inspect forecast revisions.
          </p>
        </div>

        <div className="space-y-4">
          {/* Top Overforecasts */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Top Overforecasts (Excess Gen Risk)</span>
            </span>
            <div className="space-y-1.5">
              {topOver && topOver.slice(0, 3).map((item) => (
                <div
                  key={item.start_time}
                  onClick={() => onSelectInterval(item.start_time)}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between group"
                  title="Click to view vintage audit"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                      {new Date(item.start_time).toLocaleString('en-GB', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Fcst: {item.forecast_mw} MW | Act: {item.actual_mw} MW
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400">
                    +{item.error_mw.toLocaleString()} MW
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Underforecasts */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Top Underforecasts (Shortage Risk)</span>
            </span>
            <div className="space-y-1.5">
              {topUnder && topUnder.slice(0, 3).map((item) => (
                <div
                  key={item.start_time}
                  onClick={() => onSelectInterval(item.start_time)}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between group"
                  title="Click to view vintage audit"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {new Date(item.start_time).toLocaleString('en-GB', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Fcst: {item.forecast_mw} MW | Act: {item.actual_mw} MW
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold text-cyan-400">
                    {item.error_mw.toLocaleString()} MW
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
