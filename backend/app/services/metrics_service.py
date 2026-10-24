import math
try:
    from backend.app.schemas.models import MatchedInterval, AccuracyMetrics
    from backend.app.config import settings
except ImportError:
    from app.schemas.models import MatchedInterval, AccuracyMetrics
    from app.config import settings

class MetricsService:
    @staticmethod
    def calculate_metrics(
        matched_intervals: List[MatchedInterval],
        near_zero_threshold: float = settings.MAPE_NEAR_ZERO_THRESHOLD_MW
    ) -> AccuracyMetrics:
        """
        Calculate MAE, RMSE, Bias, and conditional MAPE from matched intervals.
        Convention:
            error = forecast - actual
            bias = mean(forecast - actual); positive indicates overforecasting.
        """
        n = len(matched_intervals)
        if n == 0:
            return AccuracyMetrics(
                mae_mw=0.0,
                rmse_mw=0.0,
                bias_mw=0.0,
                mape_pct=None,
                mape_threshold_mw=near_zero_threshold,
                matched_intervals=0,
                mape_included_intervals=0,
                mape_excluded_intervals=0,
                forecast_mean_mw=0.0,
                actual_mean_mw=0.0,
                max_overforecast_mw=0.0,
                max_underforecast_mw=0.0
            )

        errors = [m.error_mw for m in matched_intervals]
        abs_errors = [m.abs_error_mw for m in matched_intervals]
        forecasts = [m.forecast_mw for m in matched_intervals]
        actuals = [m.actual_mw for m in matched_intervals]

        # 1. MAE
        mae_mw = sum(abs_errors) / n

        # 2. RMSE
        sum_sq_err = sum(e ** 2 for e in errors)
        rmse_mw = math.sqrt(sum_sq_err / n)

        # 3. Bias = mean(forecast - actual)
        bias_mw = sum(errors) / n

        # 4. Conditional MAPE (only where actual >= near_zero_threshold)
        mape_candidates = [
            abs(m.error_mw) / m.actual_mw
            for m in matched_intervals
            if m.actual_mw >= near_zero_threshold
        ]
        mape_included = len(mape_candidates)
        mape_excluded = n - mape_included

        mape_pct: Optional[float] = None
        if mape_included > 0:
            mape_pct = round((sum(mape_candidates) / mape_included) * 100.0, 2)

        # Means and Extremes
        forecast_mean_mw = sum(forecasts) / n
        actual_mean_mw = sum(actuals) / n
        max_overforecast = max(errors) if errors else 0.0
        max_underforecast = min(errors) if errors else 0.0

        return AccuracyMetrics(
            mae_mw=round(mae_mw, 2),
            rmse_mw=round(rmse_mw, 2),
            bias_mw=round(bias_mw, 2),
            mape_pct=mape_pct,
            mape_threshold_mw=near_zero_threshold,
            matched_intervals=n,
            mape_included_intervals=mape_included,
            mape_excluded_intervals=mape_excluded,
            forecast_mean_mw=round(forecast_mean_mw, 2),
            actual_mean_mw=round(actual_mean_mw, 2),
            max_overforecast_mw=round(max_overforecast, 2),
            max_underforecast_mw=round(max_underforecast, 2)
        )

metrics_service = MetricsService()
