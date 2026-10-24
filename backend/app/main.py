import sys
from pathlib import Path

# Ensure project root and backend directory are in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
for p in [str(PROJECT_ROOT), str(BASE_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.schemas.models import (
    SummaryResponse,
    DataStatusResponse,
    VintageHistoryResponse
)
from backend.app.services.elexon_client import elexon_client
from backend.app.services.forecast_service import forecast_service
from backend.app.services.metrics_service import metrics_service
from backend.app.services.cache_service import cache_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("windsight")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="UK Wind Generation Forecast vs Actual Analytics Dashboard (January 2026)",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if "*" not in settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def validate_jan_2026_date(date_str: str) -> None:
    """Validate that date is within January 2026."""
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        if dt.year != 2026 or dt.month != 1:
            raise ValueError()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Date '{date_str}' is outside the strictly supported scope of January 2026 (2026-01-01 to 2026-01-31)."
        )

@app.get("/api/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "WindSight API",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/data-status", response_model=DataStatusResponse)
async def get_data_status():
    """Check connectivity to Elexon BMRS API and local cache status."""
    connected = await elexon_client.check_connection()
    stats = cache_service.get_stats()
    status_str = "healthy" if connected else "degraded"
    msg = "Connected to live Elexon BMRS API." if connected else "Elexon API unreachable; serving from cache."
    
    return DataStatusResponse(
        status=status_str,
        api_connected=connected,
        cached_actuals_count=stats["total_actuals"],
        cached_forecasts_count=stats["total_forecasts"],
        cached_dates=stats["cached_dates"],
        last_refresh_time=stats["last_refresh_time"],
        message=msg
    )

@app.get("/api/summary", response_model=SummaryResponse)
async def get_summary(
    start_date: str = Query("2026-01-01", description="Start date (YYYY-MM-DD) in Jan 2026"),
    end_date: str = Query("2026-01-07", description="End date (YYYY-MM-DD) in Jan 2026"),
    cutoff: str = Query("DA_1200", description="Decision cutoff rule (e.g. DA_1200, DA_1700, D_0000, HOURS_12)"),
    force_refresh: bool = Query(False, description="Bypass local cache and re-query Elexon API")
):
    """
    Get full evaluation summary: accuracy metrics, matched time series intervals,
    and extreme over/under forecast deviations.
    """
    validate_jan_2026_date(start_date)
    validate_jan_2026_date(end_date)

    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date.")

    try:
        actuals, forecasts = await elexon_client.fetch_range_data(
            start_date, end_date, force_refresh=force_refresh
        )
    except Exception as e:
        logger.error(f"Error retrieving data for {start_date} to {end_date}: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Unable to retrieve data from Elexon BMRS API: {str(e)}"
        )

    matched = forecast_service.align_forecasts_and_actuals(
        actual_records=actuals,
        forecast_records=forecasts,
        cutoff_rule=cutoff
    )

    metrics = metrics_service.calculate_metrics(matched)

    # Top 5 overforecasts (forecast >> actual, error > 0)
    overforecasts = sorted([m for m in matched if m.error_mw > 0], key=lambda x: x.error_mw, reverse=True)[:5]

    # Top 5 underforecasts (forecast << actual, error < 0)
    underforecasts = sorted([m for m in matched if m.error_mw < 0], key=lambda x: x.error_mw)[:5]

    return SummaryResponse(
        start_date=start_date,
        end_date=end_date,
        cutoff_rule=cutoff,
        metrics=metrics,
        intervals=matched,
        top_overforecasts=overforecasts,
        top_underforecasts=underforecasts
    )

@app.get("/api/forecasts")
async def get_forecasts_for_date(
    date: str = Query("2026-01-01", description="Delivery date (YYYY-MM-DD) in Jan 2026"),
    cutoff: str = Query("DA_1200", description="Decision cutoff rule"),
    force_refresh: bool = Query(False)
):
    """Retrieve matched intervals and metrics for a single delivery date."""
    validate_jan_2026_date(date)
    actuals = await elexon_client.fetch_actuals_for_date(date, force_refresh=force_refresh)
    forecasts = await elexon_client.fetch_forecasts_for_date(date, force_refresh=force_refresh)

    matched = forecast_service.align_forecasts_and_actuals(
        actual_records=actuals,
        forecast_records=forecasts,
        cutoff_rule=cutoff
    )
    metrics = metrics_service.calculate_metrics(matched)
    return {
        "date": date,
        "cutoff_rule": cutoff,
        "metrics": metrics,
        "intervals": matched
    }

@app.get("/api/vintage-history", response_model=VintageHistoryResponse)
async def get_vintage_history(
    start_time: str = Query(..., description="Interval delivery start time (ISO 8601 UTC)"),
    cutoff: str = Query("DA_1200", description="Decision cutoff rule")
):
    """
    Inspect all published forecast versions for a single delivery interval.
    Shows when each version was published, which version was active at cutoff,
    and flags versions published post-cutoff as unavailable at the decision gate.
    """
    date_str = start_time[:10]
    validate_jan_2026_date(date_str)

    forecasts = await elexon_client.fetch_forecasts_for_date(date_str)
    history = forecast_service.get_vintage_history(start_time, forecasts, cutoff_rule=cutoff)
    return history

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
