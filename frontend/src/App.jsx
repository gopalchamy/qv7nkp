import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import SummaryCards from './components/SummaryCards';
import ForecastChart from './components/ForecastChart';
import ErrorChart from './components/ErrorChart';
import DataTable from './components/DataTable';
import VintageModal from './components/VintageModal';
import { fetchHealth, fetchDataStatus, fetchSummary, fetchVintageHistory } from './services/api';
import { AlertCircle, LayoutDashboard, BarChart2, Table as TableIcon, Layers, Info } from 'lucide-react';

export default function App() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-07');
  const [cutoffRule, setCutoffRule] = useState('DA_1200');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'overview', 'risk', 'ledger'

  // Theme state: 'dark' or 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('windsight_theme') || 'dark';
  });

  const [dataStatus, setDataStatus] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Vintage History Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState(null);
  const [vintageHistory, setVintageHistory] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Sync theme with HTML class and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('windsight_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const loadStatus = useCallback(async () => {
    try {
      const status = await fetchDataStatus();
      setDataStatus(status);
    } catch (err) {
      console.warn('Data status fetch warning:', err);
    }
  }, []);

  const loadSummary = useCallback(async (force = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    if (force) setIsRefreshing(true);

    try {
      const data = await fetchSummary(startDate, endDate, cutoffRule, force);
      setSummaryData(data);
      await loadStatus();
    } catch (err) {
      console.error('Error fetching summary:', err);
      setErrorMessage(err.message || 'Failed to retrieve data from Elexon BMRS.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [startDate, endDate, cutoffRule, loadStatus]);

  useEffect(() => {
    loadStatus();
    loadSummary(false);
  }, []);

  const handleApplyFilters = () => {
    loadSummary(false);
  };

  const handleInspectVintages = async (startTime) => {
    setSelectedInterval(startTime);
    setIsModalOpen(true);
    setIsHistoryLoading(true);
    try {
      const hist = await fetchVintageHistory(startTime, cutoffRule);
      setVintageHistory(hist);
    } catch (err) {
      console.error('Error fetching vintage history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 transition-colors duration-300">
      {/* 1. Header with Theme Toggle */}
      <Header
        dataStatus={dataStatus}
        isRefreshing={isRefreshing}
        onRefresh={() => loadSummary(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* 2. Filter & Controls Bar */}
      <FilterPanel
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        cutoffRule={cutoffRule}
        onCutoffChange={setCutoffRule}
        onApplyFilters={handleApplyFilters}
        isLoading={isLoading}
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="glass-card p-4 rounded-xl border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <div>
            <strong className="font-semibold">Notice:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* 3. Executive Summary KPI Cards */}
      {summaryData && (
        <SummaryCards metrics={summaryData.metrics} />
      )}

      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Executive View</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Forecast vs Actual</span>
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'risk'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Error & Market Exposure</span>
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ledger'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Interval Ledger</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Cutoff: <strong className="text-slate-700 dark:text-slate-300">{cutoffRule}</strong></span>
        </div>
      </div>

      {/* 4. Forecast vs Actual Outturn Chart */}
      {summaryData && (activeTab === 'all' || activeTab === 'overview') && (
        <ForecastChart intervals={summaryData.intervals} />
      )}

      {/* 5. Signed Error Distribution & Extremes */}
      {summaryData && (activeTab === 'all' || activeTab === 'risk') && (
        <ErrorChart
          intervals={summaryData.intervals}
          topOver={summaryData.top_overforecasts}
          topUnder={summaryData.top_underforecasts}
          onSelectInterval={handleInspectVintages}
        />
      )}

      {/* 6. Interval Ledger Data Table */}
      {summaryData && (activeTab === 'all' || activeTab === 'ledger') && (
        <DataTable
          intervals={summaryData.intervals}
          onInspectVintages={handleInspectVintages}
        />
      )}

      {/* 7. Vintage History Audit Modal */}
      <VintageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        historyData={vintageHistory}
        isLoading={isHistoryLoading}
      />

      {/* Footer & Methodological Attribution */}
      <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          WindSight — UK Day-Ahead Wind Generation Analytics & Decision Portal
        </p>
        <p>
          Official Elexon BMRS Datasets: <code className="text-cyan-700 dark:text-cyan-400 font-mono">FUELHH</code> (Actual Wind) & <code className="text-amber-700 dark:text-amber-400 font-mono">WINDFOR</code> (Forecast Revisions) • Strict UTC Timestamping • January 2026 Delivery Dates
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-400">
          Customized analytics suite for UK wholesale market electricity purchasing teams evaluating day-ahead procurement.
        </p>
      </footer>
    </div>
  );
}
