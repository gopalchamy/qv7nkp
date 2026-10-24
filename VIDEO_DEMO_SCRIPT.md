# WindSight — 10-Minute Video Demo Presentation Script

> **Purpose**: This guide provides a word-for-word, step-by-step presentation script to record your unlisted YouTube submission video.
> **Total Time**: 10 minutes maximum (divided into two distinct 5-minute sections).

---

## Recording Checklist Before You Start
- [ ] Backend running (`python backend/app/main.py`)
- [ ] Frontend running (`npm run dev` in `frontend/`)
- [ ] Browser open at `http://127.0.0.1:5173/` in full-screen mode
- [ ] VS Code open showing the project structure (`backend/` and `frontend/`)
- [ ] Screen recorder ready (e.g. OBS, Loom, or Windows Game Bar `Win + Alt + R`)

---

## Part 1 — Client Presentation: Executive & Commercial Pitch (0:00 – 5:00)
*Audience: Energy Utility Procurement Team & Commercial Directors*  
*Tone: Confident, business-focused, professional, value-driven*

---

### [0:00 – 1:00] Business Context & The Day-Ahead Purchasing Problem
*(Show the browser dashboard on screen with the Dark Theme active)*

> **Speaker**:  
> "Hello everyone. Today, I am proud to present **WindSight**, a customized analytics and decision platform engineered specifically for your power procurement team operating in the UK wholesale electricity market.
>
> As a UK electricity utility, your primary responsibility is ensuring enough power is contracted to meet consumer demand. In the Day-Ahead market, you have to submit final purchasing commitments one day before delivery. 
>
> However, wind generation is weather-dependent and volatile. If you buy power based on an inaccurate forecast:
> - **Overforecasting** leaves your portfolio short of generation, forcing you to pay expensive balancing cash-out penalties to the System Operator.
> - **Underforecasting** causes you to purchase surplus thermal power at high day-ahead prices, which must then be spilled or sold back at a loss.
>
> To solve this, your team needs two critical capabilities:
> 1. An exact reconstruction of the forecast that was available at the time the trading decision was made.
> 2. Quantified error metrics so you can adjust bidding volumes with statistical confidence.
>
> Let's look at how WindSight delivers this."

---

### [1:00 – 2:15] Dashboard Overview & Control Center
*(Point your cursor to the Header, Status Beacon, and Filter Panel)*

> **Speaker**:  
> "Looking at the top of the portal, you see our brand header and live data indicator. WindSight is connected directly to official **Elexon BMRS** data feeds. Right here in the status beacon, you can see `● Elexon BMRS Live` with the exact UTC synchronization timestamp.
>
> Notice also our theme switch control: with one click, your traders can toggle between an executive dark trading layout and a crisp daylight mode, complete with glassmorphic cards and high-contrast typography.
>
> In the **Filter Control Deck**, we can select any delivery window across January 2026. For convenience, we have one-click quick presets: Week 1, Week 2, Week 3, or the full month.
>
> Most importantly, look at the **Decision Cutoff Rule**. The GB Day-Ahead auction gate closes at 12:00 UTC on day $D-1$. WindSight defaults to `DA_1200`, meaning for every single hour of delivery, the system automatically finds the latest forecast published at or before noon on the prior day. You can also test alternate market timelines, such as evening gate closure at 17:00 UTC or 12 hours before delivery."

---

### [2:15 – 3:30] Accuracy Metrics & Commercial Value
*(Scroll slightly to focus on the 6 KPI cards)*

> **Speaker**:  
> "Immediately below the filters, WindSight presents your team with 6 essential KPIs calculated live from real Elexon records:
> 1. **Mean Forecast Outturn**: 14,855 MW across the selected delivery period.
> 2. **Mean Metered Actual**: 12,899 MW from official national wind outturn.
> 3. **Mean Absolute Error (MAE)**: 2,113 MW. This quantifies the average deviation you must account for in portfolio risk buffers.
> 4. **Root Mean Squared Error (RMSE)**: 2,561 MW. Because RMSE squares errors before averaging, it highlights periods of extreme volatility where market risk is magnified.
> 5. **Systemic Forecast Bias**: Over this period, the forecast exhibited a net bias of **+1,956 MW**. This tells your procurement team that the forecast systematically **overestimated** wind generation. Knowing this allows your buyers to apply an empirical haircut to day-ahead forecasts to prevent being caught short in the balancing mechanism!
> 6. **Conditional MAPE**: 17.5%, intelligently evaluated only on intervals where generation exceeds 100 MW to protect against division-by-zero distortion."

---

### [3:30 – 4:30] Forecast vs. Actual Visualizations & Extreme Deviations
*(Hover over the Recharts line chart and the Error Distribution chart)*

> **Speaker**:  
> "Now let's look at the visualizations. 
>
> The **Forecast vs. Actual Chart** plots your day-ahead forecast baseline in amber alongside the metered outturn in cyan. Hovering over any interval reveals the exact delivery hour, generation values, and signed error.
>
> In the **Error Distribution & Market Exposure Panel**, the orange bars represent surplus overforecasting hours, while the cyan bars represent unhedged shortage hours. To the right, our **Extreme Deviations** panel instantly surfaces the top 3 surplus risk periods and top 3 shortage risk periods, highlighting where the utility experienced its greatest market price exposure."

---

### [4:30 – 5:00] Forecast Publication History (Vintage Inspector Modal)
*(Click the 'Inspect' button on row 1 of the Interval Ledger table)*

> **Speaker**:  
> "Finally, let's look at our crowning feature: **Forecast Vintage Auditing**.
>
> If I scroll to the transaction ledger and click **'Inspect'** on delivery interval `01 Jan 2026, 00:00 UTC`, this modal pops up.
>
> Here, you can see all **24 historical forecast revisions** issued by Elexon for that delivery hour. WindSight clearly marks the active version available at the Day-Ahead 12:00 cutoff with a green badge: **'Selected at Decision Cutoff'**.
>
> Notice the subsequent revisions below it: they are styled with dashed borders and clearly flagged as **'Post-Cutoff (Unavailable to Buyer)'**. This provides complete transparency and mathematical proof that your trading decisions never suffer from retrospective look-ahead bias.
>
> In summary, WindSight empowers your utility to bid with precision, minimize balancing penalties, and optimize purchasing costs."

---

## Part 2 — Technical Review: Architecture & Implementation (5:00 – 10:00)
*Audience: Technical Lead, Software Architects, Senior Reviewers*  
*Tone: Technical, architectural, rigorous, code-focused*

---

### [5:00 – 6:00] Architecture & Technology Stack
*(Switch screen to VS Code showing the folder tree and `implementation_plan.md`)*

> **Speaker**:  
> "Now, turning to the technical review for our engineering lead.
>
> The application is built using a clean, decoupled full-stack architecture:
> - **Backend**: Python 3.12 with **FastAPI** for high-throughput asynchronous REST APIs, **Pydantic v2** for strict schema validation, and **HTTPX** for async network calls.
> - **Frontend**: **React 18** scaffolded with **Vite**, using **JavaScript** without TypeScript overhead for rapid development.
> - **Styling**: **Tailwind CSS v3.4** paired with **PostCSS** and **Autoprefixer**, delivering a custom dark/light theme design system with full class-based theme switching.
> - **Visualizations**: **Recharts** for hardware-accelerated SVG time-series charts, and **Lucide React** for clean vector icons.
> - **Testing & Infrastructure**: **Pytest** with 17 unit and integration tests, multi-stage **Dockerfiles**, and **Docker Compose** orchestration."

---

### [6:00 – 7:00] Elexon BMRS API Integration & Ingestion Layer
*(Open `backend/app/services/elexon_client.py` and `backend/app/services/cache_service.py` in VS Code)*

> **Speaker**:  
> "Let's examine how we interface with official Elexon BMRS datasets:
> 1. **Actuals (`FUELHH/stream`)**: We query `https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream` filtered by `settlementDateFrom` and `settlementDateTo` and `fuelType=WIND`. This returns 48 half-hourly settlement periods per calendar day.
> 2. **Forecasts (`WINDFOR/stream`)**: We query `datasets/WINDFOR/stream` with `publishDateTimeFrom` spanning from 3 days prior up to delivery day. This returns all forecast vintages issued for January 2026 delivery intervals.
>
> **Resolution Alignment**:
> During our Phase 1 API inspection, we identified that Elexon publishes `FUELHH` outturn at 30-minute intervals (48/day), but `WINDFOR` forecasts at 60-minute delivery intervals (24/day). When joining on `startTime`, exactly 24 intervals per day match on the hour. Our parser matches these strictly without inventing synthetic data.
>
> **Resilient Local Caching**:
> In `cache_service.py`, we implement a disk cache under `data/cache/` storing daily raw JSON records. This ensures instantaneous page loads, protects against Elexon API rate limits, and enables offline functionality. A `force_refresh` parameter is provided to re-query live feeds whenever needed."

---

### [7:00 – 8:00] Vintage Selection Algorithm & Quantitative Metrics
*(Open `backend/app/services/forecast_service.py` and `backend/app/services/metrics_service.py`)*

> **Speaker**:  
> "Here in `forecast_service.py` is the core business logic for vintage selection:
> ```python
> # 1. Calculate the exact cutoff timestamp
> cutoff_dt = calculate_cutoff_timestamp(delivery_start_iso, cutoff_rule)
>
> # 2. Filter forecasts: only those published AT OR BEFORE cutoff
> candidates = [f for f in interval_forecasts if parse_utc_iso(f['publish_time']) <= cutoff_dt]
>
> # 3. Select the latest available forecast revision
> selected = candidates[-1] if candidates else None
> ```
> Under no circumstances can any record with $\text{publishTime} > \text{Cutoff}$ be selected as the decision basis.
>
> In `metrics_service.py`, we implement our formulas:
> - **Signed Error**: $\text{forecast} - \text{actual}$. Positive means overforecasting, negative means underforecasting.
> - **MAE**: $\frac{1}{N} \sum |\text{error}|$.
> - **RMSE**: $\sqrt{\frac{1}{N} \sum \text{error}^2}$.
> - **Bias**: $\frac{1}{N} \sum (\text{forecast} - \text{actual})$.
> - **Conditional MAPE**: To prevent division-by-zero when wind generation approaches zero MW, MAPE is calculated only over intervals where $\text{actual} \ge 100 \text{ MW}$. Intervals below 100 MW are excluded from the percentage calculation and transparently reported."

---

### [8:00 – 9:00] Automated Testing & Quality Assurance
*(Open terminal in VS Code and run `python -m pytest backend/tests -v`)*

> **Speaker**:  
> "Let's run our test suite live in the terminal:
> `python -m pytest backend/tests -v`
>
> As you can see: **17 passed in 0.53 seconds**.
>
> Our test suite covers:
> 1. `test_metrics.py`: Mathematical accuracy of MAE, RMSE, Bias sign conventions, and conditional MAPE with zero and near-zero actuals.
> 2. `test_forecast_selection.py`: Cutoff timestamp calculation and verification that future post-cutoff forecasts are strictly rejected.
> 3. `test_alignment.py`: Exact interval joining on `startTime`, handling missing forecasts, and missing actuals.
> 4. `test_api.py`: FastAPI endpoint tests verifying input validation (rejecting dates outside January 2026), health endpoints, and response payloads.
>
> All unit tests use isolated synthetic fixtures defined in `conftest.py`, ensuring synthetic test data is never mixed into production data."

---

### [9:00 – 10:00] Docker, Deployment & Final Knowledge Transfer
*(Show `docker-compose.yml`, `backend/Dockerfile`, and `frontend/Dockerfile`)*

> **Speaker**:  
> "For containerization and operations:
> - `backend/Dockerfile`: Multi-stage Python 3.12-slim container with a non-root user and automated health checks.
> - `frontend/Dockerfile`: Multi-stage build compiling React assets with Node 20 and serving them via Nginx on Alpine, complete with gzip compression and `/api` reverse proxying.
> - `docker-compose.yml`: Spins up the full stack on ports 3000 and 8000 with a shared bridge network and persistent cache volumes.
>
> For production deployment:
> - The frontend is configured for **Vercel** with `vercel.json` SPA routing rewrites.
> - The backend is configured for **Render** via `render.yaml` and `Procfile`.
> - All environment variables are documented in `.env.example`.
>
> In conclusion: WindSight is fully tested, visually stunning, mathematically rigorous, and ready for immediate deployment. Thank you!"

---

## Tips for Recording
1. **Pacing**: Speak at a steady, engaging pace. Do not rush.
2. **Tab Pre-loading**: Keep the browser tabs open at `http://127.0.0.1:5173/` and `http://127.0.0.1:8000/docs`.
3. **Cursor Movement**: Move your mouse deliberately to draw the viewer's attention to key numbers, buttons, and chart tooltips.
4. **Resolution**: Record at 1080p (1920x1080) for crisp typography.
