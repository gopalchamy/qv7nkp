import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
DATA_CACHE_DIR = PROJECT_ROOT / "data" / "cache"

class Settings(BaseModel):
    PROJECT_NAME: str = "WindSight — UK Wind Analytics"
    ELEXON_API_BASE_URL: str = os.getenv("ELEXON_API_BASE_URL", "https://data.elexon.co.uk/bmrs/api/v1")
    CACHE_DIR: Path = Path(os.getenv("CACHE_DIR", str(DATA_CACHE_DIR)))
    CACHE_ENABLED: bool = os.getenv("CACHE_ENABLED", "true").lower() in ("true", "1", "yes")
    
    # Target period: January 2026
    DEFAULT_START_DATE: str = "2026-01-01"
    DEFAULT_END_DATE: str = "2026-01-31"
    
    # Day-Ahead Decision Cutoff Default: 12:00 UTC day-ahead (D-1 12:00 UTC)
    # Options supported: 'DA_1200' (12:00 UTC on D-1), 'DA_1700' (17:00 UTC on D-1), 'D_0000' (00:00 UTC on delivery day), or integer hours before delivery
    DEFAULT_CUTOFF_RULE: str = "DA_1200"
    
    # Near-zero generation threshold for MAPE calculation to prevent division-by-zero
    MAPE_NEAR_ZERO_THRESHOLD_MW: float = 100.0
    
    # CORS Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", "*")
    ]

settings = Settings()
settings.CACHE_DIR.mkdir(parents=True, exist_ok=True)
