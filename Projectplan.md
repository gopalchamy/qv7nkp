WindSight --- Project Plan and Agent Instructions
Purpose
Build a working full-stack MVP for a UK electricity utility to inspect
national wind-generation forecasts and evaluate them against actual
generation for delivery dates in January 2026.

The project must be built within a target of 15 hours. Prioritize
correctness, a working application, clear documentation, and a
successful demo over unnecessary features.
How the AI agent must work
Do not implement the whole project in one uncontrolled operation. Work
in phases and ask for approval at each gate.

At the start: 1. Read this entire file. 2. Inspect the current workspace
and available tooling. 3. Summarize the proposed first phase and list
any commands or files it expects to use or create. 4. Wait for my
explicit approval before executing commands, installing packages,
creating or modifying files, accessing external services, or making
deployment changes.

For every phase: 1. Explain the goal in beginner-friendly language. 2.
List the files to create or modify and commands to run. 3. Identify any
risks or assumptions. 4. Ask for my approval before making changes or
running commands. 5. After approval, implement only that phase. 6. Run
relevant tests/checks and report the actual output. Never claim a test
passed unless it was run and passed. 7. Summarize changed files, test
results, unresolved issues, and the next proposed phase. 8. Wait for my
approval before continuing.

If permission is denied, do not execute that action. Offer a safer
alternative.

Never: - Delete or overwrite existing user files without asking. - Run
destructive commands without explicit approval. - expose credentials,
tokens, or secrets. - commit, push, publish a public repository, or
deploy without explicit approval. - claim an app is deployed or data was
retrieved unless verified. - use fabricated values as if they were real
Elexon data. - hide errors by replacing real API data with sample
data. - ask for approval for every trivial line edit; ask at meaningful
phase gates and before risky actions.
Target time budget: 15 hours
  Phase                                                 Target
  1. Inspect workspace and verify API/data          1.5 hours
  2. Backend data access and processing               3 hours
  3. Metrics and backend tests                      1.5 hours
  4. React dashboard                                  4 hours
  5. Integration, testing, and Docker                 2 hours
  6. Deployment configuration and deployment        1.5 hours
  7. README, video script, and final checks         1.5 hours
  Total                                       15 hours

If time becomes tight, prioritize a reliable core dashboard, correct
forecast selection, tests, README, and video. Report any unfinished
requirement honestly.
Business requirements
The utility needs to understand: 1. What national wind-generation
forecast was available when a day-ahead purchasing decision was made. 2.
How that forecast compared with actual wind generation.

Scope is only national WIND actuals and forecasts from Elexon. Do not
add demand data, other fuel types, weather services, trading execution,
payment systems, authentication, or machine learning.
Official Elexon data sources
Actual generation dataset (FUELHH):
https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream

Forecast dataset (WINDFOR):
https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream

API documentation: https://bmrs.elexon.co.uk/api-documentation

Relevant fields: - Actuals: startTime, generation, and fuelType
(filter to WIND). - Forecasts: startTime, publishTime, and
generation.

Before implementing data retrieval: 1. Read the current official API
documentation. 2. Verify the correct endpoint URL, request parameters,
date filtering, pagination, response structure, and authentication
requirements. 3. Check that historical records for January 2026 are
available. 4. Inspect a small real response and record the exact field
names and units. 5. If external access is unavailable, explain the
blocker and ask before using any alternative. Do not silently fake data.

Use only delivery dates from 2026-01-01 through 2026-01-31. Be
consistent about UTC and local time and explain the convention in the
README.
Forecast-selection rules
- startTime is the delivery interval.
- publishTime is when a forecast became available.
- Join forecasts and actuals using the same delivery interval.
- For each interval, choose the latest forecast whose publishTime is
  at or before the configured decision cutoff.
- Never use a forecast published after the cutoff to represent what
  the buyer knew at the time.
- The exact day-ahead market decision cutoff is not specified by the
  assignment. Research the official market timeline if possible. If
  the correct cutoff remains uncertain, make it configurable, clearly
  label the default as an analytical assumption, and document it.
- Preserve forecast publication timestamps so users can inspect
  forecast versions.
- Handle missing actuals or forecasts transparently; do not silently
  fill them with invented values.
Recommended stack
Frontend: - React + Vite - JavaScript (not TypeScript) - Recharts for
charts - Lucide React icons - Responsive CSS

Backend: - Python + FastAPI - Pandas - HTTPX or Requests - Pytest

Operations: - Dockerfiles for frontend and backend - Docker Compose for
local development - Vercel-compatible frontend configuration -
Python-compatible backend deployment configuration, such as Render if
available and suitable - Public GitHub repository with an
anonymous/random repository name, created only after approval

Use a simple architecture. Avoid unnecessary databases unless they
materially improve the reliability of the MVP. A small local cache or
in-memory cache is acceptable if its limitations are documented.
Required dashboard
Application name: WindSight --- UK Wind Analytics

Create a polished, professional, responsive dashboard with:
1. Header and data status
- App name and short purpose statement.
- API/data status.
- Last successful refresh time, if available.
- Clear message when data cannot be loaded.
2. Filters
- Delivery date or date range limited to January 2026.
- Configurable decision cutoff.
- Refresh action.
- Loading, error, and empty states.
3. Summary metrics
- Mean forecast generation (MW).
- Mean actual generation (MW).
- MAE (MW).
- RMSE (MW).
- Bias (MW).
- Count of matched intervals.
Calculate all displayed metrics from backend results. Do not hardcode
dashboard values.
4. Forecast versus actual chart
- Two separate lines for forecast and actual generation.
- Delivery time on the x-axis.
- MW on the y-axis.
- Legend, tooltip, readable timestamps, and units.
- Graceful handling of incomplete or empty data.
5. Error analysis and data table
- Signed error = forecast minus actual.
- Absolute error.
- Percentage error only where actual generation is safely away from
  zero.
- Identify largest absolute errors.
- Table columns: delivery timestamp, forecast MW, actual MW, signed
  error MW, absolute error MW, selected forecast publish time.
6. Forecast history
For a selected delivery interval, show available forecast versions,
publication times, generation values, and which version was selected at
the cutoff. Clearly mark forecasts published after the cutoff as
unavailable for that decision.
Metric definitions
Use and document these conventions: - error = forecast - actual -
MAE = mean(abs(error)) - RMSE = sqrt(mean(error ** 2)) -
Bias = mean(forecast - actual); positive means overforecasting. -
MAPE = mean(abs(error / actual)) * 100, calculated only for actual
values above a documented near-zero threshold.

Always report the number of valid matched intervals. Do not divide by
zero. Explain missing or excluded intervals and avoid implying a metric
is reliable when coverage is incomplete.
Suggested project structure
windsight/
  frontend/
    src/
      components/
      pages/
      services/
      App.jsx
      main.jsx
      index.css
    package.json
    Dockerfile
    vercel.json
  backend/
    app/
      main.py
      config.py
      services/
        elexon_client.py
        forecast_service.py
        metrics_service.py
      schemas/
    tests/
      test_metrics.py
      test_forecast_selection.py
      test_api.py
    requirements.txt
    Dockerfile
  docker-compose.yml
  .env.example
  .gitignore
  README.md
  VIDEO_DEMO_SCRIPT.md
Adjust if a simpler layout is more maintainable, but keep frontend and
backend responsibilities clear.
Backend API
Implement a small set of documented endpoints, adapting as needed: -
GET /api/health - GET /api/data-status -
GET /api/summary?start_date=2026-01-01&end_date=2026-01-31 -
GET /api/forecasts?date=2026-01-10&cutoff=... -
GET /api/accuracy?start_date=2026-01-01&end_date=2026-01-31&cutoff=...

Backend must: - Retrieve documented Elexon data. - Filter national WIND
records. - Parse and normalize timestamps and numeric values. - Select
forecast versions correctly. - Align records by delivery interval. -
Calculate metrics. - Return JSON suitable for the React app. - Handle
timeouts, HTTP errors, malformed responses, pagination, empty results,
and missing values. - Configure CORS for local and deployed frontend
origins through environment variables. - Never expose credentials or
secrets in responses or frontend bundles.
Tests and verification
Write tests for: - MAE, RMSE, bias. - MAPE with zero and near-zero
actual values. - Forecast version selection at a cutoff. - Correct
startTime alignment. - Missing forecast and actual records. - API
errors and malformed/empty responses. - Health endpoint.

Synthetic values may be used in isolated unit-test fixtures only. They
must never be confused with live Elexon data.

Run: - Backend tests. - Frontend production build. - Lint checks if
configured. - Docker build/start checks if Docker is installed and
available. - Basic frontend-to-backend integration checks where
practical.

Report the actual results, including any skipped checks.
Docker and deployment
Create: - Backend Dockerfile. - Frontend Dockerfile. -
docker-compose.yml. - .env.example without real secrets. - Clear
port mappings and frontend API base URL configuration. - Health checks
where practical.

Prepare for: - Frontend deployment to Vercel. - Backend deployment to a
Python-compatible hosting provider.

Do not claim deployment succeeded unless you verify the live URLs.
Deployment, creating a public repository, and pushing code require my
explicit approval. If credentials or permissions are missing, give exact
manual instructions instead.
README requirements
Include: - Business problem and features. - Directory/file guide. -
Architecture diagram using Mermaid. - Elexon API links and field
mappings. - Forecast vintage selection and decision cutoff
assumptions. - Metric formulas and sign conventions. - Timezone
handling. - Local setup and run commands. - Docker setup. - Test
commands. - Environment variables. - Deployment steps and actual URL
only after verified deployment. - Known limitations and data coverage. -
Explicit disclosure that AI tools assisted development and generated
code/calculations were tested and reviewed.
Video demo script
Create VIDEO_DEMO_SCRIPT.md for a video of at most 10 minutes:

Part 1 --- Client presentation (maximum 5 minutes): - Business
problem. - Dashboard and filters. - Forecast publication history. -
Forecast versus actual chart. - Accuracy metrics and business value.

Part 2 --- Technical review (maximum 5 minutes): - Architecture. -
Elexon integration. - Forecast selection. - Metric implementation. -
Tests. - Docker and deployment. - Limitations and code structure.

Do not claim a video has been uploaded. I will record and upload the
video myself.
Phase gates --- follow in order
Phase 1: Inspect and validate
Inspect the workspace and tooling. Read the official API docs and test
historical data availability. Do not create or install anything until I
approve the proposed actions. Report findings and ask for approval to
begin Phase 2.
Phase 2: Backend data layer
Implement Elexon client, parsing, date filtering, timestamp handling,
and caching. Ask before implementation. Test against actual responses
where available.
Phase 3: Forecast selection and metrics
Implement cutoff-based forecast selection and metrics. Add unit tests.
Ask before implementation.
Phase 4: API and React dashboard
Build FastAPI endpoints and the React UI. Integrate real backend
responses. Ask before implementation.
Phase 5: Integration, testing, and Docker
Run tests/build, fix defects, and create Docker configuration. Ask
before executing commands or modifying files.
Phase 6: Deployment preparation
Prepare deployment configuration and environment variables. Explain
which accounts/permissions are needed. Ask for explicit approval before
publishing, pushing, or deploying.
Phase 7: Documentation and submission readiness
Create README and video script, verify links only when available, and
provide a final checklist. The user will complete the submission form
and video upload.
First response expected from the agent
Do not start coding immediately. First: 1. Confirm you read this plan.
2. Summarize Phase 1. 3. List proposed inspection/API verification
actions and any commands you intend to run. 4. Explain what files, if
any, you intend to create in Phase 1. 5. Ask me for permission to
proceed.