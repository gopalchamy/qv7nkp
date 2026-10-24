import React from 'react';
import { X, CheckCircle2, Clock, AlertCircle, ShieldAlert, History } from 'lucide-react';

export default function VintageModal({ isOpen, onClose, historyData, isLoading }) {
  if (!isOpen) return null;

  const formatUtc = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }) + ' UTC';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      id="vintage-modal-overlay"
    >
      <div
        className="glass-card bg-slate-900/95 border-slate-700/80 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-cyan-950/40 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Forecast Publication History (Vintage Audit)
              </h3>
              <p className="text-xs text-slate-400">
                Delivery Interval: <span className="font-mono font-bold text-cyan-300">{formatUtc(historyData?.delivery_start_time)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Summary Metadata */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Configured Decision Cutoff</span>
            <div className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatUtc(historyData?.cutoff_time)}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Revisions Recorded by Elexon</span>
            <div className="font-mono font-bold text-white flex items-center gap-1.5">
              <span>{historyData?.total_versions || 0} versions issued</span>
            </div>
          </div>
        </div>

        {/* Revisions List */}
        <div className="p-5 overflow-y-auto space-y-2.5">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-400 animate-pulse">
              Retrieving forecast publication timeline from Elexon...
            </div>
          ) : historyData?.all_vintages && historyData.all_vintages.length > 0 ? (
            historyData.all_vintages.map((v, i) => {
              if (v.is_selected) {
                return (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/60 shadow-lg shadow-emerald-950/20 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <span>Published: {formatUtc(v.publish_time)}</span>
                      </div>
                      <div className="mt-1">
                        <span className="badge-glow-emerald text-[11px] py-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected at Decision Cutoff
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono font-extrabold text-emerald-400">
                        {v.generation.toLocaleString()} MW
                      </div>
                      <span className="text-[10px] text-emerald-400/80 font-medium">Day-Ahead Commitment</span>
                    </div>
                  </div>
                );
              }

              if (!v.is_before_cutoff) {
                return (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-rose-500/5 border border-dashed border-rose-500/30 opacity-70 flex items-center justify-between hover:opacity-100 transition-opacity"
                  >
                    <div>
                      <div className="text-xs font-mono font-medium text-slate-300">
                        Published: {formatUtc(v.publish_time)}
                      </div>
                      <div className="mt-1">
                        <span className="badge-glow-rose text-[10px] py-0.5">
                          <AlertCircle className="w-3 h-3" /> Post-Cutoff (Unavailable to Buyer)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-mono font-bold text-slate-300">
                        {v.generation.toLocaleString()} MW
                      </div>
                      <span className="text-[10px] text-rose-400/80">Future Information</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-mono font-medium text-slate-400">
                      Published: {formatUtc(v.publish_time)}
                    </div>
                    <div className="mt-1">
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        Superseded Revision
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-slate-300">
                      {v.generation.toLocaleString()} MW
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-sm text-slate-500">
              No historical forecast revisions recorded for this interval.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
