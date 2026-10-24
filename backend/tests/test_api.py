import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data

def test_invalid_date_range_rejected():
    # Outside January 2026
    response = client.get("/api/summary?start_date=2025-12-31&end_date=2026-01-05")
    assert response.status_code == 400
    assert "strictly supported scope" in response.json()["detail"]

    response2 = client.get("/api/summary?start_date=2026-02-01&end_date=2026-02-05")
    assert response2.status_code == 400

def test_start_date_after_end_date():
    response = client.get("/api/summary?start_date=2026-01-10&end_date=2026-01-05")
    assert response.status_code == 400
    assert "cannot be after end_date" in response.json()["detail"]

@pytest.mark.asyncio
async def test_summary_endpoint_with_mocked_data():
    mock_actuals = [
        {"start_time": "2026-01-01T12:00:00Z", "generation": 10000.0, "fuel_type": "WIND", "settlement_date": "2026-01-01", "settlement_period": 25}
    ]
    mock_forecasts = [
        {"start_time": "2026-01-01T12:00:00Z", "publish_time": "2025-12-31T11:00:00Z", "generation": 11000.0}
    ]

    with patch("backend.app.services.elexon_client.elexon_client.fetch_range_data", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = (mock_actuals, mock_forecasts)
        
        response = client.get("/api/summary?start_date=2026-01-01&end_date=2026-01-01&cutoff=DA_1200")
        assert response.status_code == 200
        data = response.json()
        assert data["start_date"] == "2026-01-01"
        assert data["metrics"]["mae_mw"] == 1000.0
        assert data["metrics"]["bias_mw"] == 1000.0
        assert len(data["intervals"]) == 1
        assert data["intervals"][0]["error_mw"] == 1000.0
        assert data["intervals"][0]["is_overforecast"] is True

@pytest.mark.asyncio
async def test_vintage_history_endpoint_with_mock():
    mock_forecasts = [
        {"start_time": "2026-01-01T12:00:00Z", "publish_time": "2025-12-30T10:00:00Z", "generation": 9500.0},
        {"start_time": "2026-01-01T12:00:00Z", "publish_time": "2025-12-31T11:30:00Z", "generation": 10200.0},
        {"start_time": "2026-01-01T12:00:00Z", "publish_time": "2025-12-31T15:00:00Z", "generation": 10800.0}, # Post cutoff
    ]

    with patch("backend.app.services.elexon_client.elexon_client.fetch_forecasts_for_date", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = mock_forecasts

        response = client.get("/api/vintage-history?start_time=2026-01-01T12:00:00Z&cutoff=DA_1200")
        assert response.status_code == 200
        data = response.json()
        assert data["delivery_start_time"] == "2026-01-01T12:00:00Z"
        assert data["total_versions"] == 3
        assert data["selected_vintage"]["publish_time"] == "2025-12-31T11:30:00Z"
        assert data["selected_vintage"]["generation"] == 10200.0
