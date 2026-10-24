from pydantic import BaseModel, Field
from typing import Optional, List

class ActualRecord(BaseModel):
    start_time: str
    publish_time: Optional[str] = None
    settlement_date: Optional[str] = None
    settlement_period: Optional[int] = None
    fuel_type: str = "WIND"
    generation: float

class ForecastRecord(BaseModel):
    start_time: str
    publish_time: str
    generation: float

class MatchedInterval(BaseModel):
    start_time: str
    settlement_date: Optional[str] = None
    settlement_period: Optional[int] = None
    forecast_mw: float
    actual_mw: float
    error_mw: float  # Signed error: forecast - actual
    abs_error_mw: float  # |forecast - actual|
    pct_error: Optional[float] = None  # (|forecast - actual| / actual) * 100 when actual >= threshold
    forecast_publish_time: str
    cutoff_time: str
    is_overforecast: bool

class AccuracyMetrics(BaseModel):
    mae_mw: float = Field(..., description="Mean Absolute Error in MW")
    rmse_mw: float = Field(..., description="Root Mean Squared Error in MW")
    bias_mw: float = Field(..., description="Forecast Bias: mean(forecast - actual) in MW")
    mape_pct: Optional[float] = Field(None, description="Conditional MAPE percentage (only where actual >= threshold)")
    mape_threshold_mw: float = Field(..., description="Threshold MW for conditional MAPE calculation")
    matched_intervals: int = Field(..., description="Number of matched delivery intervals evaluated")
    mape_included_intervals: int = Field(..., description="Intervals meeting the threshold used for MAPE")
    mape_excluded_intervals: int = Field(..., description="Intervals excluded from MAPE due to low/zero generation")
    forecast_mean_mw: float = Field(..., description="Mean forecasted generation in MW")
    actual_mean_mw: float = Field(..., description="Mean actual generation in MW")
    max_overforecast_mw: float = Field(..., description="Largest positive forecast error (forecast >> actual)")
    max_underforecast_mw: float = Field(..., description="Largest negative forecast error (forecast << actual)")

class ForecastVintage(BaseModel):
    publish_time: str
    generation: float
    is_selected: bool
    is_before_cutoff: bool

class VintageHistoryResponse(BaseModel):
    delivery_start_time: str
    cutoff_time: str
    selected_vintage: Optional[ForecastVintage] = None
    all_vintages: List[ForecastVintage] = []
    total_versions: int

class SummaryResponse(BaseModel):
    start_date: str
    end_date: str
    cutoff_rule: str
    metrics: AccuracyMetrics
    intervals: List[MatchedInterval]
    top_overforecasts: List[MatchedInterval]
    top_underforecasts: List[MatchedInterval]

class DataStatusResponse(BaseModel):
    status: str
    api_connected: bool
    cached_actuals_count: int
    cached_forecasts_count: int
    cached_dates: List[str]
    last_refresh_time: Optional[str]
    message: str
