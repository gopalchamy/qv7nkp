import pytest
import math
from backend.app.services.metrics_service import metrics_service
from backend.app.schemas.models import MatchedInterval

def test_metrics_calculation_standard(sample_synthetic_intervals):
    metrics = metrics_service.calculate_metrics(sample_synthetic_intervals, near_zero_threshold=100.0)
    
    # Expected:
    # MAE = 250.0
    # RMSE = sqrt(85000) = 291.55
    # Bias = +100.0 (Overforecasting)
    # MAPE = 25.0%
    assert metrics.mae_mw == 250.0
    assert metrics.rmse_mw == 291.55
    assert metrics.bias_mw == 100.0
    assert metrics.mape_pct == 25.0
    assert metrics.matched_intervals == 4
    assert metrics.mape_included_intervals == 4
    assert metrics.mape_excluded_intervals == 0
    assert metrics.forecast_mean_mw == 1100.0
    assert metrics.actual_mean_mw == 1000.0
    assert metrics.max_overforecast_mw == 500.0
    assert metrics.max_underforecast_mw == -200.0

def test_bias_sign_convention_underforecasting():
    intervals = [
        MatchedInterval(
            start_time="2026-01-01T00:00:00Z",
            forecast_mw=800.0,
            actual_mw=1200.0,
            error_mw=-400.0,
            abs_error_mw=400.0,
            pct_error=33.33,
            forecast_publish_time="2025-12-31T11:00:00Z",
            cutoff_time="2025-12-31T12:00:00Z",
            is_overforecast=False
        )
    ]
    metrics = metrics_service.calculate_metrics(intervals)
    assert metrics.bias_mw == -400.0
    assert metrics.mae_mw == 400.0
    assert metrics.rmse_mw == 400.0

def test_mape_handling_of_zero_actual():
    """Zero actual generation must NOT cause division-by-zero, and should be excluded from MAPE."""
    intervals = [
        MatchedInterval(
            start_time="2026-01-01T00:00:00Z",
            forecast_mw=100.0,
            actual_mw=0.0,  # Zero actual
            error_mw=100.0,
            abs_error_mw=100.0,
            pct_error=None,
            forecast_publish_time="2025-12-31T11:00:00Z",
            cutoff_time="2025-12-31T12:00:00Z",
            is_overforecast=True
        ),
        MatchedInterval(
            start_time="2026-01-01T01:00:00Z",
            forecast_mw=1200.0,
            actual_mw=1000.0,
            error_mw=200.0,
            abs_error_mw=200.0,
            pct_error=20.0,
            forecast_publish_time="2025-12-31T11:00:00Z",
            cutoff_time="2025-12-31T12:00:00Z",
            is_overforecast=True
        )
    ]
    metrics = metrics_service.calculate_metrics(intervals, near_zero_threshold=100.0)
    assert metrics.matched_intervals == 2
    assert metrics.mape_included_intervals == 1
    assert metrics.mape_excluded_intervals == 1
    assert metrics.mape_pct == 20.0  # Only computed over the non-zero interval

def test_mape_handling_of_near_zero_below_threshold():
    """Values below near_zero_threshold (e.g. 50 MW when threshold is 100 MW) are excluded from MAPE."""
    intervals = [
        MatchedInterval(
            start_time="2026-01-01T00:00:00Z",
            forecast_mw=70.0,
            actual_mw=50.0,  # Below 100 MW threshold
            error_mw=20.0,
            abs_error_mw=20.0,
            pct_error=None,
            forecast_publish_time="2025-12-31T11:00:00Z",
            cutoff_time="2025-12-31T12:00:00Z",
            is_overforecast=True
        )
    ]
    metrics = metrics_service.calculate_metrics(intervals, near_zero_threshold=100.0)
    assert metrics.mape_included_intervals == 0
    assert metrics.mape_excluded_intervals == 1
    assert metrics.mape_pct is None

def test_metrics_empty_intervals():
    metrics = metrics_service.calculate_metrics([])
    assert metrics.matched_intervals == 0
    assert metrics.mae_mw == 0.0
    assert metrics.rmse_mw == 0.0
    assert metrics.bias_mw == 0.0
    assert metrics.mape_pct is None
