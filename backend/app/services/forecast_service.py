import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional, Tuple
try:
    from backend.app.schemas.models import (
        MatchedInterval,
        ForecastVintage,
        VintageHistoryResponse
    )
    from backend.app.config import settings
except ImportError:
    from app.schemas.models import (
        MatchedInterval,
        ForecastVintage,
        VintageHistoryResponse
    )
    from app.config import settings

logger = logging.getLogger(__name__)

class ForecastService:
    @staticmethod
    def parse_utc_iso(dt_str: str) -> datetime:
        """Parse ISO 8601 UTC string into aware datetime."""
        # Handle trailing Z or offset
        if dt_str.endswith("Z"):
            dt_str = dt_str[:-1] + "+00:00"
        return datetime.fromisoformat(dt_str).astimezone(timezone.utc)

    @staticmethod
    def calculate_cutoff_timestamp(delivery_start_iso: str, cutoff_rule: str = "DA_1200") -> datetime:
        """
        Calculate decision cutoff timestamp for a given delivery start time and cutoff rule.
        Rules:
          - 'DA_1200': Day-ahead 12:00 UTC (D-1 12:00:00Z)
          - 'DA_1700': Day-ahead 17:00 UTC (D-1 17:00:00Z)
          - 'D_0000': Delivery day 00:00 UTC (D 00:00:00Z)
          - 'HOURS_<N>': N hours before delivery interval start
          - Explicit ISO string: parsed directly as UTC datetime
        """
        delivery_dt = ForecastService.parse_utc_iso(delivery_start_iso)
        delivery_date = delivery_dt.date()

        rule = cutoff_rule.upper().strip()
        if rule == "DA_1200":
            prev_day = delivery_date - timedelta(days=1)
            return datetime(prev_day.year, prev_day.month, prev_day.day, 12, 0, 0, tzinfo=timezone.utc)
        elif rule == "DA_1700":
            prev_day = delivery_date - timedelta(days=1)
            return datetime(prev_day.year, prev_day.month, prev_day.day, 17, 0, 0, tzinfo=timezone.utc)
        elif rule == "D_0000":
            return datetime(delivery_date.year, delivery_date.month, delivery_date.day, 0, 0, 0, tzinfo=timezone.utc)
        elif rule.startswith("HOURS_"):
            try:
                hours = int(rule.replace("HOURS_", ""))
                return delivery_dt - timedelta(hours=hours)
            except ValueError:
                # Fallback to DA_1200
                prev_day = delivery_date - timedelta(days=1)
                return datetime(prev_day.year, prev_day.month, prev_day.day, 12, 0, 0, tzinfo=timezone.utc)
        else:
            # Try parsing as ISO
            try:
                return ForecastService.parse_utc_iso(cutoff_rule)
            except Exception:
                # Default fallback: DA_1200
                prev_day = delivery_date - timedelta(days=1)
                return datetime(prev_day.year, prev_day.month, prev_day.day, 12, 0, 0, tzinfo=timezone.utc)

    @classmethod
    def select_forecast_for_interval(
        cls,
        delivery_start_iso: str,
        forecast_records: List[Dict[str, Any]],
        cutoff_dt: datetime
    ) -> Tuple[Optional[Dict[str, Any]], List[ForecastVintage]]:
        """
        Select the latest forecast vintage published at or before cutoff_dt.
        Returns:
            (selected_forecast_dict, all_vintages_list)
        """
        # Filter forecasts belonging to this delivery interval
        interval_forecasts = [f for f in forecast_records if f["start_time"] == delivery_start_iso]
        
        # Sort by publish_time ascending
        interval_forecasts.sort(key=lambda x: cls.parse_utc_iso(x["publish_time"]))

        candidate_vintages: List[Dict[str, Any]] = []
        for f in interval_forecasts:
            pub_dt = cls.parse_utc_iso(f["publish_time"])
            if pub_dt <= cutoff_dt:
                candidate_vintages.append(f)

        selected = candidate_vintages[-1] if candidate_vintages else None

        # Build list of all vintages with metadata
        all_vintages: List[ForecastVintage] = []
        for f in interval_forecasts:
            pub_dt = cls.parse_utc_iso(f["publish_time"])
            is_before = pub_dt <= cutoff_dt
            is_sel = (selected is not None and f["publish_time"] == selected["publish_time"])
            all_vintages.append(ForecastVintage(
                publish_time=f["publish_time"],
                generation=float(f["generation"]),
                is_selected=is_sel,
                is_before_cutoff=is_before
            ))

        return selected, all_vintages

    @classmethod
    def align_forecasts_and_actuals(
        cls,
        actual_records: List[Dict[str, Any]],
        forecast_records: List[Dict[str, Any]],
        cutoff_rule: str = "DA_1200",
        near_zero_threshold: float = settings.MAPE_NEAR_ZERO_THRESHOLD_MW
    ) -> List[MatchedInterval]:
        """
        Match actuals and forecasts by start_time, selecting the correct forecast vintage at cutoff.
        """
        # Map actuals by start_time
        actual_map: Dict[str, Dict[str, Any]] = {a["start_time"]: a for a in actual_records}

        # Group forecasts by start_time
        forecasts_by_start: Dict[str, List[Dict[str, Any]]] = {}
        for f in forecast_records:
            st = f["start_time"]
            if st not in forecasts_by_start:
                forecasts_by_start[st] = []
            forecasts_by_start[st].append(f)

        matched: List[MatchedInterval] = []

        # We evaluate all intervals present in actuals
        for st in sorted(actual_map.keys()):
            act = actual_map[st]
            fc_list = forecasts_by_start.get(st, [])
            if not fc_list:
                continue

            cutoff_dt = cls.calculate_cutoff_timestamp(st, cutoff_rule)
            cutoff_iso = cutoff_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

            selected_fc, _ = cls.select_forecast_for_interval(st, fc_list, cutoff_dt)
            if selected_fc is None:
                # No forecast available at or before cutoff for this delivery interval
                continue

            actual_mw = float(act["generation"])
            forecast_mw = float(selected_fc["generation"])
            error_mw = forecast_mw - actual_mw
            abs_error_mw = abs(error_mw)

            pct_error: Optional[float] = None
            if actual_mw >= near_zero_threshold:
                pct_error = round((abs_error_mw / actual_mw) * 100.0, 2)

            matched.append(MatchedInterval(
                start_time=st,
                settlement_date=act.get("settlement_date"),
                settlement_period=act.get("settlement_period"),
                forecast_mw=round(forecast_mw, 1),
                actual_mw=round(actual_mw, 1),
                error_mw=round(error_mw, 1),
                abs_error_mw=round(abs_error_mw, 1),
                pct_error=pct_error,
                forecast_publish_time=selected_fc["publish_time"],
                cutoff_time=cutoff_iso,
                is_overforecast=(error_mw > 0)
            ))

        return matched

    @classmethod
    def get_vintage_history(
        cls,
        delivery_start_iso: str,
        forecast_records: List[Dict[str, Any]],
        cutoff_rule: str = "DA_1200"
    ) -> VintageHistoryResponse:
        """Inspect all available forecast versions for a specific delivery interval."""
        cutoff_dt = cls.calculate_cutoff_timestamp(delivery_start_iso, cutoff_rule)
        selected_fc, all_vintages = cls.select_forecast_for_interval(
            delivery_start_iso, forecast_records, cutoff_dt
        )
        selected_vintage = None
        if selected_fc:
            selected_vintage = ForecastVintage(
                publish_time=selected_fc["publish_time"],
                generation=float(selected_fc["generation"]),
                is_selected=True,
                is_before_cutoff=True
            )

        return VintageHistoryResponse(
            delivery_start_time=delivery_start_iso,
            cutoff_time=cutoff_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
            selected_vintage=selected_vintage,
            all_vintages=all_vintages,
            total_versions=len(all_vintages)
        )

forecast_service = ForecastService()
