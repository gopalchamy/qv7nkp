import React from 'react';
import { TrendingUp, TrendingDown, Activity, CheckSquare, Zap, Gauge } from 'lucide-react';

export default function SummaryCards({ metrics }) {
  if (!metrics) return null;

  const isOverforecast = metrics.bias_mw >= 0;

  return (
    <section className="metrics-grid" id="summary-cards-section">
      {/* 1. Forecast Average */}
      <div className="metric-card" id="card-forecast-mean">
        <div className="metric-card-header">
          <span className="metric-title">Mean Forecast Outturn</span>
          <Zap size={18} className="metric-icon" style={{ color: 'var(--accent-amber)' }} />
        </div>
        <div className="metric-value">
          {metrics.forecast_mean_mw.toLocaleString()}
          <span className="metric-unit">MW</span>
        </div>
        <div className="metric-sub">Across {metrics.matched_intervals} matched delivery intervals</div>
      </div>

      {/* 2. Actual Average */}
      <div className="metric-card" id="card-actual-mean">
        <div className="metric-card-header">
          <span className="metric-title">Mean Metered Actual</span>
          <Activity size={18} className="metric-icon" style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <div className="metric-value">
          {metrics.actual_mean_mw.toLocaleString()}
          <span className="metric-unit">MW</span>
        </div>
        <div className="metric-sub">Elexon FUELHH national WIND outturn</div>
      </div>

      {/* 3. MAE */}
      <div className="metric-card" id="card-mae">
        <div className="metric-card-header">
          <span className="metric-title">Mean Absolute Error (MAE)</span>
          <Gauge size={18} className="metric-icon" />
        </div>
        <div className="metric-value">
          {metrics.mae_mw.toLocaleString()}
          <span className="metric-unit">MW</span>
        </div>
        <div className="metric-sub">Average magnitude of deviation</div>
      </div>

      {/* 4. RMSE */}
      <div className="metric-card" id="card-rmse">
        <div className="metric-card-header">
          <span className="metric-title">Root Mean Squared Error</span>
          <Gauge size={18} className="metric-icon" />
        </div>
        <div className="metric-value">
          {metrics.rmse_mw.toLocaleString()}
          <span className="metric-unit">MW</span>
        </div>
        <div className="metric-sub">Penalizes extreme forecast swings</div>
      </div>

      {/* 5. Forecast Bias */}
      <div className={`metric-card bias ${isOverforecast ? 'positive' : 'negative'}`} id="card-bias">
        <div className="metric-card-header">
          <span className="metric-title">Systemic Forecast Bias</span>
          {isOverforecast ? (
            <TrendingUp size={18} style={{ color: 'var(--accent-amber)' }} />
          ) : (
            <TrendingDown size={18} style={{ color: 'var(--accent-cyan)' }} />
          )}
        </div>
        <div className="metric-value">
          {isOverforecast ? `+${metrics.bias_mw.toLocaleString()}` : metrics.bias_mw.toLocaleString()}
          <span className="metric-unit">MW</span>
        </div>
        <div className="metric-sub">
          {isOverforecast ? 'Net Overforecasting (Forecast > Actual)' : 'Net Underforecasting (Forecast < Actual)'}
        </div>
      </div>

      {/* 6. Matched Coverage & MAPE */}
      <div className="metric-card" id="card-mape">
        <div className="metric-card-header">
          <span className="metric-title">Conditional MAPE</span>
          <CheckSquare size={18} className="metric-icon" />
        </div>
        <div className="metric-value">
          {metrics.mape_pct !== null ? `${metrics.mape_pct}%` : 'N/A'}
        </div>
        <div className="metric-sub">
          {metrics.mape_included_intervals} intervals (&ge;{metrics.mape_threshold_mw} MW), {metrics.mape_excluded_intervals} excluded low-gen
        </div>
      </div>
    </section>
  );
}
