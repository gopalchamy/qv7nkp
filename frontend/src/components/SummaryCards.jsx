import React from 'react';
import { Zap, Activity, Gauge, BarChart3, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

export default function SummaryCards({ metrics }) {
  if (!metrics) return null;

  const isOverforecast = metrics.bias_mw >= 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4" id="summary-cards-section">
      {/* 1. Mean Forecast */}
      <div className="glass-card-interactive p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Forecast Outturn</span>
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            {metrics.forecast_mean_mw.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">MW</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
          <span>Day-Ahead Decision Basis</span>
        </div>
      </div>

      {/* 2. Mean Actual */}
      <div className="glass-card-interactive p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metered Actual</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            {metrics.actual_mean_mw.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">MW</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
          <span>Elexon FUELHH Outturn</span>
        </div>
      </div>

      {/* 3. MAE */}
      <div className="glass-card-interactive p-4 sm:p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">MAE (Error Magnitude)</span>
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            {metrics.mae_mw.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">MW</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 font-medium">
          <span>Mean Absolute Deviation</span>
        </div>
      </div>

      {/* 4. RMSE */}
      <div className="glass-card-interactive p-4 sm:p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">RMSE (Volatility)</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            {metrics.rmse_mw.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">MW</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 font-medium">
          <span>Penalizes Severe Swings</span>
        </div>
      </div>

      {/* 5. Forecast Bias */}
      <div className="glass-card-interactive p-4 sm:p-5 relative overflow-hidden group border-slate-700/60">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Systemic Bias</span>
          <div className={`p-2 rounded-xl border ${isOverforecast ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
            {isOverforecast ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${isOverforecast ? 'text-amber-400' : 'text-cyan-400'}`}>
            {isOverforecast ? `+${metrics.bias_mw.toLocaleString()}` : metrics.bias_mw.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">MW</span>
        </div>
        <div className="mt-2 text-[11px] font-semibold">
          <span className={isOverforecast ? 'text-amber-400' : 'text-cyan-400'}>
            {isOverforecast ? '● Net Overforecasting' : '● Net Underforecasting'}
          </span>
        </div>
      </div>

      {/* 6. Conditional MAPE */}
      <div className="glass-card-interactive p-4 sm:p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Relative MAPE</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            {metrics.mape_pct !== null ? `${metrics.mape_pct}%` : 'N/A'}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 font-medium">
          <span>{metrics.mape_included_intervals} intervals (&ge;{metrics.mape_threshold_mw} MW)</span>
        </div>
      </div>
    </section>
  );
}
