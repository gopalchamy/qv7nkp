import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
try:
    from backend.app.config import settings
except ImportError:
    from app.config import settings

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = cache_dir or settings.CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_file = self.cache_dir / "cache_metadata.json"
        self._init_metadata()

    def _init_metadata(self):
        if not self.metadata_file.exists():
            self._save_metadata({"last_refresh_time": None, "created_at": datetime.now(timezone.utc).isoformat()})

    def _load_metadata(self) -> Dict[str, Any]:
        try:
            if self.metadata_file.exists():
                with open(self.metadata_file, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to read cache metadata: {e}")
        return {}

    def _save_metadata(self, meta: Dict[str, Any]):
        try:
            with open(self.metadata_file, "w", encoding="utf-8") as f:
                json.dump(meta, f, indent=2)
        except Exception as e:
            logger.warning(f"Failed to save cache metadata: {e}")

    def get_last_refresh_time(self) -> Optional[str]:
        return self._load_metadata().get("last_refresh_time")

    def update_last_refresh_time(self):
        meta = self._load_metadata()
        meta["last_refresh_time"] = datetime.now(timezone.utc).isoformat()
        self._save_metadata(meta)

    # Actuals Cache
    def get_actuals_path(self, date_str: str) -> Path:
        return self.cache_dir / f"actuals_{date_str}.json"

    def save_actuals(self, date_str: str, records: List[Dict[str, Any]]):
        if not settings.CACHE_ENABLED:
            return
        path = self.get_actuals_path(date_str)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(records, f)
            self.update_last_refresh_time()
        except Exception as e:
            logger.error(f"Error saving actuals cache for {date_str}: {e}")

    def load_actuals(self, date_str: str) -> Optional[List[Dict[str, Any]]]:
        if not settings.CACHE_ENABLED:
            return None
        path = self.get_actuals_path(date_str)
        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading actuals cache for {date_str}: {e}")
        return None

    # Forecasts Cache
    def get_forecasts_path(self, date_str: str) -> Path:
        return self.cache_dir / f"forecasts_{date_str}.json"

    def save_forecasts(self, date_str: str, records: List[Dict[str, Any]]):
        if not settings.CACHE_ENABLED:
            return
        path = self.get_forecasts_path(date_str)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(records, f)
            self.update_last_refresh_time()
        except Exception as e:
            logger.error(f"Error saving forecasts cache for {date_str}: {e}")

    def load_forecasts(self, date_str: str) -> Optional[List[Dict[str, Any]]]:
        if not settings.CACHE_ENABLED:
            return None
        path = self.get_forecasts_path(date_str)
        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading forecasts cache for {date_str}: {e}")
        return None

    def get_cached_dates(self) -> List[str]:
        dates = set()
        for f in self.cache_dir.glob("actuals_*.json"):
            date_part = f.stem.replace("actuals_", "")
            dates.add(date_part)
        return sorted(list(dates))

    def get_stats(self) -> Dict[str, Any]:
        cached_dates = self.get_cached_dates()
        total_actuals = 0
        total_forecasts = 0
        for d in cached_dates:
            act = self.load_actuals(d)
            if act:
                total_actuals += len(act)
            fc = self.load_forecasts(d)
            if fc:
                total_forecasts += len(fc)
        return {
            "cached_dates": cached_dates,
            "total_actuals": total_actuals,
            "total_forecasts": total_forecasts,
            "last_refresh_time": self.get_last_refresh_time()
        }

cache_service = CacheService()
