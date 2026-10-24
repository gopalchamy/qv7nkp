import pytest
from datetime import datetime, timezone
from backend.app.services.forecast_service import forecast_service

def test_cutoff_calculation():
    delivery = "2026-01-02T14:00:00Z"
    
    # 1. DA_1200: Previous day 12:00:00 UTC
    co_da12 = forecast_service.calculate_cutoff_timestamp(delivery, "DA_1200")
    assert co_da12 == datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc)

    # 2. DA_1700: Previous day 17:00:00 UTC
    co_da17 = forecast_service.calculate_cutoff_timestamp(delivery, "DA_1700")
    assert co_da17 == datetime(2026, 1, 1, 17, 0, 0, tzinfo=timezone.utc)

    # 3. D_0000: Delivery day 00:00:00 UTC
    co_d0 = forecast_service.calculate_cutoff_timestamp(delivery, "D_0000")
    assert co_d0 == datetime(2026, 1, 2, 0, 0, 0, tzinfo=timezone.utc)

    # 4. HOURS_6: 6 hours before 14:00:00 -> 08:00:00 UTC
    co_h6 = forecast_service.calculate_cutoff_timestamp(delivery, "HOURS_6")
    assert co_h6 == datetime(2026, 1, 2, 8, 0, 0, tzinfo=timezone.utc)

def test_forecast_vintage_selection_never_selects_future(synthetic_forecast_vintages):
    delivery = "2026-01-02T12:00:00Z"
    # Cutoff is DA_1200 -> 2026-01-01T12:00:00Z
    cutoff_dt = forecast_service.calculate_cutoff_timestamp(delivery, "DA_1200")

    selected, vintages = forecast_service.select_forecast_for_interval(
        delivery, synthetic_forecast_vintages, cutoff_dt
    )

    # Selected must be 2026-01-01T11:30:00Z with 11500 MW
    assert selected is not None
    assert selected["publish_time"] == "2026-01-01T11:30:00Z"
    assert selected["generation"] == 11500.0

    # Ensure forecasts published at 14:00 (Jan 1) and 06:00 (Jan 2) were NOT chosen
    selected_pub_dt = forecast_service.parse_utc_iso(selected["publish_time"])
    assert selected_pub_dt <= cutoff_dt

    # Check vintage flags
    for v in vintages:
        if v.publish_time == "2026-01-01T11:30:00Z":
            assert v.is_selected is True
            assert v.is_before_cutoff is True
        elif v.publish_time in ("2026-01-01T14:00:00Z", "2026-01-02T06:00:00Z"):
            assert v.is_selected is False
            assert v.is_before_cutoff is False

def test_forecast_selection_no_candidate_before_cutoff():
    delivery = "2026-01-02T12:00:00Z"
    # An overly strict cutoff before any forecast was published
    strict_cutoff = datetime(2025, 12, 1, 0, 0, 0, tzinfo=timezone.utc)
    
    forecasts = [
        {"start_time": delivery, "publish_time": "2025-12-31T10:00:00Z", "generation": 10000.0}
    ]

    selected, vintages = forecast_service.select_forecast_for_interval(
        delivery, forecasts, strict_cutoff
    )
    assert selected is None
    assert len(vintages) == 1
    assert vintages[0].is_selected is False
    assert vintages[0].is_before_cutoff is False
