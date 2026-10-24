import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, History, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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

  const renderSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60" />;
    return sortAsc ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />;
  };

  return (
    <div className="glass-card p-5 sm:p-6 border-slate-800/80" id="data-table-section">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800/60">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Interval Outturn & Forecast Error Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full granular record of half-hour and hourly delivery intervals with selected vintage publish times
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search date or time..."
              className="form-control-dark pl-9 w-48 sm:w-56 text-xs"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Page size */}
          <select
            className="form-control-dark text-xs cursor-pointer py-1.5"
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

      {/* Table Canvas */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th onClick={() => handleSort('start_time')} className="py-3 px-4 cursor-pointer hover:text-white transition-colors">
                <div className="flex items-center gap-1.5">
                  <span>Delivery Interval (UTC)</span>
                  {renderSortIcon('start_time')}
                </div>
              </th>
              <th onClick={() => handleSort('forecast_mw')} className="py-3 px-4 cursor-pointer hover:text-white transition-colors">
                <div className="flex items-center gap-1.5">
                  <span>Forecast (MW)</span>
                  {renderSortIcon('forecast_mw')}
                </div>
              </th>
              <th onClick={() => handleSort('actual_mw')} className="py-3 px-4 cursor-pointer hover:text-white transition-colors">
                <div className="flex items-center gap-1.5">
                  <span>Metered (MW)</span>
                  {renderSortIcon('actual_mw')}
                </div>
              </th>
              <th onClick={() => handleSort('error_mw')} className="py-3 px-4 cursor-pointer hover:text-white transition-colors">
                <div className="flex items-center gap-1.5">
                  <span>Signed Error</span>
                  {renderSortIcon('error_mw')}
                </div>
              </th>
              <th onClick={() => handleSort('abs_error_mw')} className="py-3 px-4 cursor-pointer hover:text-white transition-colors">
                <div className="flex items-center gap-1.5">
                  <span>Absolute Error</span>
                  {renderSortIcon('abs_error_mw')}
                </div>
              </th>
              <th className="py-3 px-4">Relative Error</th>
              <th className="py-3 px-4">Selected Publish Time</th>
              <th className="py-3 px-4 text-right">Audit Trail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                  No matching intervals found for query.
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={row.start_time} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-200">
                    {formatUtcTime(row.start_time)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    {row.forecast_mw.toLocaleString()} MW
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                    {row.actual_mw.toLocaleString()} MW
                  </td>
                  <td className="py-3 px-4">
                    <span className={row.error_mw >= 0 ? 'badge-glow-amber' : 'badge-glow-cyan'}>
                      {row.error_mw >= 0 ? `+${row.error_mw.toLocaleString()}` : row.error_mw.toLocaleString()} MW
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {row.abs_error_mw.toLocaleString()} MW
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {row.pct_error !== null ? `${row.pct_error}%` : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {formatUtcTime(row.forecast_publish_time)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="btn-ghost-dark"
                      onClick={() => onInspectVintages(row.start_time)}
                      title="Inspect all published forecast versions for this interval"
                    >
                      <History className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-xs text-slate-400 font-medium">
        <div>
          Showing {filteredAndSorted.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length} intervals
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost-dark py-1 px-2.5 disabled:opacity-40"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn-ghost-dark py-1 px-2.5 disabled:opacity-40"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
