import pytest
from backend.app.services.forecast_service import forecast_service

def test_alignment_exact_matches():
    actuals = [
        {"start_time": "2026-01-01T10:00:00Z", "generation": 5000.0, "settlement_date": "2026-01-01", "settlement_period": 21},
        {"start_time": "2026-01-01T11:00:00Z", "generation": 6000.0, "settlement_date": "2026-01-01", "settlement_period": 23},
    ]
    forecasts = [
        {"start_time": "2026-01-01T10:00:00Z", "publish_time": "2025-12-31T11:00:00Z", "generation": 5500.0},
        {"start_time": "2026-01-01T11:00:00Z", "publish_time": "2025-12-31T11:00:00Z", "generation": 5800.0},
    ]

    matched = forecast_service.align_forecasts_and_actuals(actuals, forecasts, cutoff_rule="DA_1200")
    assert len(matched) == 2

    # First interval: 5500 - 5000 = +500 (Overforecast)
    assert matched[0].start_time == "2026-01-01T10:00:00Z"
    assert matched[0].forecast_mw == 5500.0
    assert matched[0].actual_mw == 5000.0
    assert matched[0].error_mw == 500.0
    assert matched[0].abs_error_mw == 500.0
    assert matched[0].is_overforecast is True
    assert matched[0].pct_error == 10.0  # (500 / 5000) * 100

    # Second interval: 5800 - 6000 = -200 (Underforecast)
    assert matched[1].start_time == "2026-01-01T11:00:00Z"
    assert matched[1].error_mw == -200.0
    assert matched[1].abs_error_mw == 200.0
    assert matched[1].is_overforecast is False

def test_alignment_missing_forecast_skipped():
    actuals = [
        {"start_time": "2026-01-01T10:00:00Z", "generation": 5000.0},
        {"start_time": "2026-01-01T11:00:00Z", "generation": 6000.0}, # No forecast for 11:00
    ]
    forecasts = [
        {"start_time": "2026-01-01T10:00:00Z", "publish_time": "2025-12-31T11:00:00Z", "generation": 5200.0},
    ]

    matched = forecast_service.align_forecasts_and_actuals(actuals, forecasts, cutoff_rule="DA_1200")
    assert len(matched) == 1
    assert matched[0].start_time == "2026-01-01T10:00:00Z"

def test_alignment_missing_actual_skipped():
    actuals = [
        {"start_time": "2026-01-01T10:00:00Z", "generation": 5000.0},
    ]
    forecasts = [
        {"start_time": "2026-01-01T10:00:00Z", "publish_time": "2025-12-31T11:00:00Z", "generation": 5200.0},
        {"start_time": "2026-01-01T12:00:00Z", "publish_time": "2025-12-31T11:00:00Z", "generation": 7000.0},
    ]

    matched = forecast_service.align_forecasts_and_actuals(actuals, forecasts, cutoff_rule="DA_1200")
    assert len(matched) == 1
    assert matched[0].start_time == "2026-01-01T10:00:00Z"

def test_alignment_empty_inputs():
    assert forecast_service.align_forecasts_and_actuals([], []) == []
    assert forecast_service.align_forecasts_and_actuals([{"start_time": "2026-01-01T00:00:00Z", "generation": 100}], []) == []
    assert forecast_service.align_forecasts_and_actuals([], [{"start_time": "2026-01-01T00:00:00Z", "publish_time": "2025-12-31T00:00:00Z", "generation": 100}]) == []
