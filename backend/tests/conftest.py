import pytest
from backend.app.schemas.models import MatchedInterval

@pytest.fixture
def sample_synthetic_intervals():
    """
    Isolated synthetic test fixture with known values:
    Interval 1: forecast=1200, actual=1000 -> error=+200, abs=200, pct=20.0%
    Interval 2: forecast=800,  actual=1000 -> error=-200, abs=200, pct=20.0%
    Interval 3: forecast=1500, actual=1000 -> error=+500, abs=500, pct=50.0%
    Interval 4: forecast=900,  actual=1000 -> error=-100, abs=100, pct=10.0%
    
    Expected:
    MAE: (200 + 200 + 500 + 100) / 4 = 1000 / 4 = 250.0 MW
    RMSE: sqrt((40000 + 40000 + 250000 + 10000) / 4) = sqrt(340000 / 4) = sqrt(85000) = 291.55 MW
    Bias: (200 - 200 + 500 - 100) / 4 = 400 / 4 = +100.0 MW
    MAPE: (20 + 20 + 50 + 10) / 4 = 100 / 4 = 25.0%
    """
    return [
        MatchedInterval(
            start_time="2026-01-01T00:00:00Z",
            forecast_mw=1200.0,
            actual_mw=1000.0,
            error_mw=200.0,
            abs_error_mw=200.0,
            pct_error=20.0,
            forecast_publish_time="2025-12-31T11:00:00Z",
            cutoff_time="2025-12-31T12:00:00Z",
            is_overforecast=True
        ),
        MatchedInterval(
            start_time="2026-01-01T01:00:00Z",
            forecast_mw=800.0,
            actual_mw=1000.0,
            error_mw=-200.0,
            abs_error_mw=200.0,
            pct_error=20.0,
            forecast_publish_time="2025-12-31T11:00:00Z",
            cutoff_time="2025-12-31T12:00:00Z",
            is_overforecast=False
        ),
        MatchedInterval(
            start_time="2026-01-01T02:00:00Z",
            forecast_mw=1500.0,
            actual_mw=1000.0,
            error_mw=500.0,
            abs_error_mw=500.0,
            pct_error=50.0,
            forecast_publish_time="2025-12-31T11:00:00Z",
            cutoff_time="2025-12-31T12:00:00Z",
            is_overforecast=True
        ),
        MatchedInterval(
            start_time="2026-01-01T03:00:00Z",
            forecast_mw=900.0,
            actual_mw=1000.0,
            error_mw=-100.0,
            abs_error_mw=100.0,
            pct_error=10.0,
            forecast_publish_time="2025-12-31T11:00:00Z",
            cutoff_time="2025-12-31T12:00:00Z",
            is_overforecast=False
        ),
    ]

@pytest.fixture
def synthetic_forecast_vintages():
    """Synthetic vintages for delivery at 2026-01-02T12:00:00Z"""
    delivery = "2026-01-02T12:00:00Z"
    return [
        {"start_time": delivery, "publish_time": "2025-12-31T10:00:00Z", "generation": 10000.0},
        {"start_time": delivery, "publish_time": "2026-01-01T08:00:00Z", "generation": 11000.0},
        {"start_time": delivery, "publish_time": "2026-01-01T11:30:00Z", "generation": 11500.0}, # Target for DA_1200
        {"start_time": delivery, "publish_time": "2026-01-01T14:00:00Z", "generation": 12000.0}, # Post DA_1200
        {"start_time": delivery, "publish_time": "2026-01-02T06:00:00Z", "generation": 13000.0}, # Delivery day intra-day
    ]
