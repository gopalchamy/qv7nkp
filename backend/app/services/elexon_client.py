import logging
import httpx
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
try:
    from backend.app.config import settings
    from backend.app.services.cache_service import cache_service
except ImportError:
    from app.config import settings
    from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)

class ElexonClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.ELEXON_API_BASE_URL).rstrip("/")
        self.headers = {
            "User-Agent": "WindSight-Analytics/1.0 (UK Wind Forecast Dashboard)",
            "Accept": "application/json"
        }
        self.timeout = httpx.Timeout(20.0, connect=10.0)

    async def check_connection(self) -> bool:
        """Check if Elexon API is reachable."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
                resp = await client.get(f"{self.base_url}/datasets/FUELHH/stream?settlementDateFrom=2026-01-01&settlementDateTo=2026-01-01&fuelType=WIND")
                return resp.status_code == 200
        except Exception as e:
            logger.warning(f"Elexon API connection check failed: {e}")
            return False

    async def fetch_actuals_for_date(self, date_str: str, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Fetch FUELHH actual generation for delivery date date_str (YYYY-MM-DD), filtered to fuelType == 'WIND'.
        """
        if not force_refresh:
            cached = cache_service.load_actuals(date_str)
            if cached is not None:
                return cached

        url = f"{self.base_url}/datasets/FUELHH/stream"
        params = {
            "settlementDateFrom": date_str,
            "settlementDateTo": date_str,
            "fuelType": "WIND"
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
                logger.info(f"Fetching actuals from Elexon: {url} with {params}")
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()

            records = []
            if isinstance(data, list):
                for item in data:
                    if item.get("fuelType") == "WIND" and item.get("startTime"):
                        try:
                            gen = float(item.get("generation", 0.0))
                        except (ValueError, TypeError):
                            gen = 0.0
                        records.append({
                            "start_time": item.get("startTime"),
                            "publish_time": item.get("publishTime"),
                            "settlement_date": item.get("settlementDate"),
                            "settlement_period": item.get("settlementPeriod"),
                            "fuel_type": "WIND",
                            "generation": gen
                        })
            
            # Sort chronologically by startTime
            records.sort(key=lambda x: x["start_time"])
            cache_service.save_actuals(date_str, records)
            return records

        except httpx.HTTPError as he:
            logger.error(f"HTTP error fetching actuals for {date_str}: {he}")
            cached = cache_service.load_actuals(date_str)
            if cached is not None:
                return cached
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching actuals for {date_str}: {e}")
            cached = cache_service.load_actuals(date_str)
            if cached is not None:
                return cached
            raise

    async def fetch_forecasts_for_date(self, date_str: str, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Fetch WINDFOR forecast generations for delivery date date_str (YYYY-MM-DD).
        To capture day-ahead and historical vintages, we fetch forecasts published from (date - 3 days)
        through (date + 1 day).
        """
        if not force_refresh:
            cached = cache_service.load_forecasts(date_str)
            if cached is not None:
                return cached

        target_dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        pub_from = (target_dt - timedelta(days=3)).strftime("%Y-%m-%dT00:00:00Z")
        pub_to = (target_dt + timedelta(days=1)).strftime("%Y-%m-%dT23:59:59Z")

        url = f"{self.base_url}/datasets/WINDFOR/stream"
        params = {
            "publishDateTimeFrom": pub_from,
            "publishDateTimeTo": pub_to
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
                logger.info(f"Fetching forecasts from Elexon: {url} with {params}")
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()

            records = []
            if isinstance(data, list):
                for item in data:
                    start_time = item.get("startTime", "")
                    # Strictly filter for delivery on target date_str
                    if start_time.startswith(date_str):
                        try:
                            gen = float(item.get("generation", 0.0))
                        except (ValueError, TypeError):
                            gen = 0.0
                        records.append({
                            "start_time": start_time,
                            "publish_time": item.get("publishTime"),
                            "generation": gen
                        })

            records.sort(key=lambda x: (x["start_time"], x["publish_time"]))
            cache_service.save_forecasts(date_str, records)
            return records

        except httpx.HTTPError as he:
            logger.error(f"HTTP error fetching forecasts for {date_str}: {he}")
            cached = cache_service.load_forecasts(date_str)
            if cached is not None:
                return cached
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching forecasts for {date_str}: {e}")
            cached = cache_service.load_forecasts(date_str)
            if cached is not None:
                return cached
            raise

    async def fetch_range_data(self, start_date: str, end_date: str, force_refresh: bool = False):
        """Fetch actuals and forecasts for a date range in January 2026."""
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        all_actuals = []
        all_forecasts = []

        curr = start_dt
        while curr <= end_dt:
            d_str = curr.strftime("%Y-%m-%d")
            acts = await self.fetch_actuals_for_date(d_str, force_refresh=force_refresh)
            fcs = await self.fetch_forecasts_for_date(d_str, force_refresh=force_refresh)
            all_actuals.extend(acts)
            all_forecasts.extend(fcs)
            curr += timedelta(days=1)

        return all_actuals, all_forecasts

elexon_client = ElexonClient()
