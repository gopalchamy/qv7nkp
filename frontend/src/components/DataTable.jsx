import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, History, ArrowUpDown } from 'lucide-react';

export default function DataTable({ intervals, onInspectVintages }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState('start_time');
  const [sortAsc, setSortAsc] = useState(true);

  const filteredAndSorted = useMemo(() => {
    if (!intervals) return [];

    let result = intervals.filter((item) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.start_time.toLowerCase().includes(term) ||
        (item.settlement_date && item.settlement_date.toLowerCase().includes(term))
      );
    });

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return result;
  }, [intervals, searchTerm, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginated = filteredAndSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default to descending for numbers
    }
  };

  const formatUtcTime = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }) + ' UTC';
  };

  return (
    <div className="dashboard-card" id="data-table-section">
      <div className="card-header-bar">
        <div className="card-title-group">
          <h2>Interval Outturn & Forecast Error Ledger</h2>
          <p>Matched half-hour & hourly delivery intervals with selected vintage publish times</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Filter date or time..."
              className="input-control"
              style={{ paddingLeft: '2rem', width: '220px' }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>

          <select
            className="select-control"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={15}>15 / page</option>
            <option value={30}>30 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table" id="main-data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('start_time')} style={{ cursor: 'pointer' }}>
                Delivery Time (UTC) <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </th>
              <th onClick={() => handleSort('forecast_mw')} style={{ cursor: 'pointer' }}>
                Forecast (MW) <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </th>
              <th onClick={() => handleSort('actual_mw')} style={{ cursor: 'pointer' }}>
                Actual (MW) <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </th>
              <th onClick={() => handleSort('error_mw')} style={{ cursor: 'pointer' }}>
                Signed Error <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </th>
              <th onClick={() => handleSort('abs_error_mw')} style={{ cursor: 'pointer' }}>
                Abs Error <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </th>
              <th>Pct Error</th>
              <th>Selected Publish Time</th>
              <th>Forecast Versions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                  No matching interval records found.
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={row.start_time}>
                  <td style={{ fontWeight: 600 }}>{formatUtcTime(row.start_time)}</td>
                  <td style={{ color: 'var(--accent-amber)' }}>{row.forecast_mw.toLocaleString()}</td>
                  <td style={{ color: 'var(--accent-cyan)' }}>{row.actual_mw.toLocaleString()}</td>
                  <td>
                    <span className={row.error_mw >= 0 ? 'badge-over' : 'badge-under'}>
                      {row.error_mw >= 0 ? `+${row.error_mw.toLocaleString()}` : row.error_mw.toLocaleString()} MW
                    </span>
                  </td>
                  <td>{row.abs_error_mw.toLocaleString()} MW</td>
                  <td>{row.pct_error !== null ? `${row.pct_error}%` : '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatUtcTime(row.forecast_publish_time)}</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      onClick={() => onInspectVintages(row.start_time)}
                      title="View all forecast vintages issued for this interval"
                    >
                      <History size={12} />
                      <span>Inspect Vintages</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <div>
          Showing {filteredAndSorted.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length} intervals
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '0.3rem 0.6rem' }}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className="btn btn-ghost"
            style={{ padding: '0.3rem 0.6rem' }}
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
