const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchDataStatus() {
  const res = await fetch(`${API_BASE}/api/data-status`);
  if (!res.ok) throw new Error(`Data status check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSummary(startDate = '2026-01-01', endDate = '2026-01-07', cutoff = 'DA_1200', forceRefresh = false) {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    cutoff: cutoff,
    force_refresh: String(forceRefresh)
  });
  const res = await fetch(`${API_BASE}/api/summary?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Failed to fetch summary data');
  }
  return res.json();
}

export async function fetchVintageHistory(startTime, cutoff = 'DA_1200') {
  const params = new URLSearchParams({
    start_time: startTime,
    cutoff: cutoff
  });
  const res = await fetch(`${API_BASE}/api/vintage-history?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Failed to fetch vintage history');
  }
  return res.json();
}
