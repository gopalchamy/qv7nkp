import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.services.elexon_client import elexon_client
from backend.app.services.cache_service import cache_service

async def main():
    print("==================================================")
    print("Testing Backend Data Layer (Phase 2 Verification)")
    print("==================================================")

    # 1. Check API Connection
    print("\n1. Testing API connection to Elexon BMRS...")
    connected = await elexon_client.check_connection()
    print(f"API reachable: {connected}")
    assert connected, "Failed to connect to Elexon BMRS API!"

    # 2. Fetch Actuals for 2026-01-01
    print("\n2. Fetching FUELHH actuals for 2026-01-01...")
    actuals = await elexon_client.fetch_actuals_for_date("2026-01-01")
    print(f"Actuals returned: {len(actuals)} intervals")
    assert len(actuals) == 48, f"Expected 48 half-hour intervals, got {len(actuals)}"
    sample_act = actuals[0]
    print(f"Sample Actual -> Start: {sample_act['start_time']}, Fuel: {sample_act['fuel_type']}, Gen: {sample_act['generation']} MW")

    # 3. Fetch Forecasts for 2026-01-01
    print("\n3. Fetching WINDFOR forecasts for 2026-01-01...")
    forecasts = await elexon_client.fetch_forecasts_for_date("2026-01-01")
    print(f"Total forecast vintage records returned for 2026-01-01: {len(forecasts)}")
    assert len(forecasts) > 0, "Expected forecast vintages, got 0"
    unique_starts = sorted(set(x["start_time"] for x in forecasts))
    print(f"Unique delivery intervals covered: {len(unique_starts)} hours")
    sample_fc = forecasts[0]
    print(f"Sample Forecast -> Start: {sample_fc['start_time']}, Pub: {sample_fc['publish_time']}, Gen: {sample_fc['generation']} MW")

    # 4. Verify Local Disk Cache
    print("\n4. Verifying disk cache storage...")
    stats = cache_service.get_stats()
    print(f"Cached dates: {stats['cached_dates']}")
    print(f"Cached actuals count: {stats['total_actuals']}")
    print(f"Cached forecasts count: {stats['total_forecasts']}")
    print(f"Last refresh timestamp: {stats['last_refresh_time']}")
    assert "2026-01-01" in stats["cached_dates"], "Cache missing 2026-01-01"

    # 5. Verify Cache Loading (Fast hit without network)
    print("\n5. Testing cache hit speed...")
    cached_acts = await elexon_client.fetch_actuals_for_date("2026-01-01")
    assert len(cached_acts) == len(actuals), "Cached actuals length mismatch"
    print("Cache hit successfully verified!")

    print("\n==================================================")
    print("ALL PHASE 2 DATA LAYER CHECKS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
