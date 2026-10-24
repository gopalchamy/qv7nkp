import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import SummaryCards from './components/SummaryCards';
import ForecastChart from './components/ForecastChart';
import ErrorChart from './components/ErrorChart';
import DataTable from './components/DataTable';
import VintageModal from './components/VintageModal';
import { fetchHealth, fetchDataStatus, fetchSummary, fetchVintageHistory } from './services/api';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export default function App() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-07');
  const [cutoffRule, setCutoffRule] = useState('DA_1200');

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

  // Initial load: check health & status, then fetch initial summary
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
    <div className="app-container">
      {/* 1. Header */}
      <Header
        dataStatus={dataStatus}
        isRefreshing={isRefreshing}
        onRefresh={() => loadSummary(true)}
      />

      {/* 2. Filter Panel */}
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
        <div style={{
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fda4af',
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <div>
            <strong>Data Loading Warning:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* 3. Summary KPI Cards */}
      {summaryData && (
        <SummaryCards metrics={summaryData.metrics} />
      )}

      {/* 4. Forecast vs Actual Chart */}
      {summaryData && (
        <ForecastChart intervals={summaryData.intervals} />
      )}

      {/* 5. Error Analysis Chart & Extreme Deviations */}
      {summaryData && (
        <ErrorChart
          intervals={summaryData.intervals}
          topOver={summaryData.top_overforecasts}
          topUnder={summaryData.top_underforecasts}
          onSelectInterval={handleInspectVintages}
        />
      )}

      {/* 6. Comprehensive Data Table */}
      {summaryData && (
        <DataTable
          intervals={summaryData.intervals}
          onInspectVintages={handleInspectVintages}
        />
      )}

      {/* 7. Forecast Vintage History Modal */}
      <VintageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        historyData={vintageHistory}
        isLoading={isHistoryLoading}
      />

      {/* Footer Info */}
      <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <p>WindSight UK Wind Power Forecast Analytics • Official Elexon BMRS Datasets: FUELHH & WINDFOR</p>
        <p style={{ marginTop: '0.25rem' }}>Strictly January 2026 Delivery Intervals • UTC Timezone Convention • Configured Decision Cutoff: {cutoffRule}</p>
      </footer>
    </div>
  );
}
