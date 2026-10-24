import React from 'react';
import { X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

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
    <div className="modal-overlay" onClick={onClose} id="vintage-modal-overlay">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Forecast Publication History (Vintage Audit)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Delivery Interval: <strong style={{ color: '#fff' }}>{formatUtc(historyData?.delivery_start_time)}</strong>
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Configured Decision Cutoff:</span>
              <strong style={{ color: 'var(--accent-amber)' }}>{formatUtc(historyData?.cutoff_time)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Revisions Published:</span>
              <strong>{historyData?.total_versions || 0} versions</strong>
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading vintage audit trail...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {historyData?.all_vintages && historyData.all_vintages.length > 0 ? (
                historyData.all_vintages.map((v, i) => {
                  let badge = null;
                  let itemClass = 'vintage-item';

                  if (v.is_selected) {
                    itemClass += ' selected';
                    badge = (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <CheckCircle2 size={14} /> Selected at Cutoff
                      </span>
                    );
                  } else if (!v.is_before_cutoff) {
                    itemClass += ' post-cutoff';
                    badge = (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-rose)', fontSize: '0.75rem' }}>
                        <AlertCircle size={14} /> Post-Cutoff (Unavailable)
                      </span>
                    );
                  } else {
                    badge = (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                        Superseded Revision
                      </span>
                    );
                  }

                  return (
                    <div key={i} className={itemClass}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          Published: {formatUtc(v.publish_time)}
                        </div>
                        <div style={{ marginTop: '0.2rem' }}>{badge}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: v.is_selected ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                          {v.generation.toLocaleString()} MW
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)' }}>
                  No published forecast revisions found for this interval.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
