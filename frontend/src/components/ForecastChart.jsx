import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { LineChart as ChartIcon, Zap, Activity } from 'lucide-react';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const errorMw = data.forecast_mw - data.actual_mw;
    const isOver = errorMw >= 0;

    return (
      <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 min-w-[220px]">
        <div className="font-bold text-white border-b border-slate-800 pb-1.5 flex items-center justify-between">
          <span>{data.formattedTime} UTC</span>
          <span className="text-[10px] uppercase font-mono text-slate-400">Interval</span>
        </div>
        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-amber-400">
            <span className="flex items-center gap-1.5 font-sans font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Forecast (Cutoff):
            </span>
            <strong>{data.forecast_mw.toLocaleString()} MW</strong>
          </div>
          <div className="flex items-center justify-between text-cyan-400">
            <span className="flex items-center gap-1.5 font-sans font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Metered Actual:
            </span>
            <strong>{data.actual_mw.toLocaleString()} MW</strong>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono">
          <span className="text-slate-400 font-sans">Error (Fcst − Act):</span>
          <strong className={isOver ? 'text-amber-400' : 'text-cyan-400'}>
            {isOver ? `+${errorMw.toFixed(1)}` : errorMw.toFixed(1)} MW
          </strong>
        </div>
      </div>
    );
  }
  return null;
}

export default function ForecastChart({ intervals }) {
  if (!intervals || intervals.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-slate-400">
        No delivery intervals matched for the selected filters.
      </div>
    );
  }

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
    <div className="glass-card p-5 sm:p-6 border-slate-800/80" id="forecast-chart-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              National Wind Power Generation: Forecast vs. Actual Outturn
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Half-hour metered outturn (Elexon FUELHH) vs. Day-ahead forecast baseline (Elexon WINDFOR)
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400"></span>
            <span>Forecast at Cutoff</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
            <span>Metered Outturn (WIND)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
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
            <Area
              type="monotone"
              dataKey="actual_mw"
              fill="url(#actualGradient)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="forecast_mw"
              name="Forecast at Cutoff"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="actual_mw"
              name="Actual Outturn (WIND)"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
