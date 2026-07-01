# Air India Billing Dashboard (Agilent — Air India entity)

> Reference doc after the directory reorganization. Active backend path:
> `services/clients/airindia`. Active frontend path:
> `apps/billing-web`.

A standalone billing/revenue dashboard for the Air India side of the
business (Terminal-3 and AIAA), completely independent from the Agilent
billing app (no shared code, separate ports/ DB).

## Stack

- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, pandas/openpyxl
- **Frontend:** React (Vite), react-router-dom, axios

Runs on different ports than the Agilent app so both can run side-by-side
locally: backend on `8001`, frontend on `5174`, Postgres on host port `5433`.

## Quick start (Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:5174
- Backend API docs: http://localhost:8001/docs

## Quick start (manual)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Uploading data — IMPORTANT new requirements vs. the Agilent app

Every sheet must include a **`Month`** column (e.g. `May-2026`), same as
the Agilent app. In addition, for this app:

- **All 4 sheets** (Trip_Data_TERMINAL-3, Trip_Data_AIAA, SUNDRIES,
  penalty_VehicleWise) must include an **`Ownership`** column. None of
  the original headers had one, so you'll need to add it manually per
  vehicle before uploading — this is how VehicleRevenueSummary's
  Ownership column gets populated (first non-null value found, checked
  in the order T-3 → AIAA → SUNDRIES → penalty_VehicleWise).
- **penalty_VehicleWise** must also include an **`Entity`** column with
  value `T-3` or `AIAA` per row, so driver penalties can be attributed
  to the correct revenue bucket. Without this column the upload will
  still succeed but `entity` will be blank and that row's penalty won't
  count toward either total — check the upload warnings.
- **SUNDRIES** has two vehicle-identifier columns: `Vehicle No.`
  (billing-name) and `VEH. NO.` (registration number). Only `Vehicle No.`
  is used to join against `CabNo.` / `CAB NO` in the Trip_Data sheets —
  `VEH. NO.` is stored for reference only.

After uploading the 4 sheets for a month, go to **Upload Data** and fill
in the manual inputs section:

- **Employee Penalty — Terminal-3** and **Employee Penalty — AIAA** (no
  source sheet for these; entered per month).
- **Expenses** (Fuel, Vehicle Maintenance Cost, Drivers Salaries, Vehicle
  EMI, Razorpay Transaction Fee, Vendor Payment, Employee Salary, GST) —
  used only by the PNL/MIS Summary report. Note that
  **"MCD/State Taxs/Toll And Parking" is NOT entered manually** — it's
  calculated automatically as `SUNDRIES.MCD + TollAmount(T-3) +
  TollAmount(AIAA)`.

## Dashboards

Default view is **PNL / MIS Summary**.

1. **Detailed Revenue Summary** — Terminal-3 and AIAA revenue waterfalls, each with its own 5% GST, summed into Total Revenue.
2. **Vehicle Revenue Summary** — per-vehicle T-3 and AIAA amounts (TripCost net of that entity's driver penalty), plus combined Total.
3. **PNL / MIS Summary** *(default)* — Total Revenue (from #1) minus Expenses (manual + one auto-calculated line) = Net Profit/(Loss).

## Locked formula reference

If business rules change, update here AND in the corresponding service
file (`backend/app/services/revenue_calculator.py`,
`vehicle_revenue_summary.py`, `pnl_calculator.py`).

**Report #1 — Detailed Revenue Summary**

```
Trip_Amount_T3       = SUM(Trip_Data_TERMINAL-3.TripCost)
TollAmount_T3        = SUM(Trip_Data_TERMINAL-3.TollAmount)
MCD                  = SUM(SUNDRIES.MCD)                     [Terminal-3 only — NOT split, NOT duplicated into AIAA]
T3 Driver Penalty    = SUM(penalty_VehicleWise.Amount WHERE Entity = "T-3")
T3 Employee Penalty  = manual monthly input
Total Of Terminal3   = Trip_Amount_T3 + TollAmount_T3 + MCD
                         - T3 Driver Penalty - T3 Employee Penalty

Trip_Amount_AIAA       = SUM(Trip_Data_AIAA.TripCost)
TollAmount_AIAA        = SUM(Trip_Data_AIAA.toll amount)
AIAA Driver Penalty    = SUM(penalty_VehicleWise.Amount WHERE Entity = "AIAA")
AIAA Employee Penalty  = manual monthly input
Total of AIAA           = Trip_Amount_AIAA + TollAmount_AIAA
                            - AIAA Driver Penalty - AIAA Employee Penalty

Total Taxable Amount = Total Of Terminal3 + Total of AIAA
GST (T-3)             = Total Of Terminal3 * 5%
GST (AIAA)            = Total of AIAA * 5%
GST (total)            = GST(T-3) + GST(AIAA)                 [calculated SEPARATELY per entity, then summed — not 5% on the combined total]
TOTAL REVENUE          = Total Taxable Amount + GST(total)
```

**Report #2 — Vehicle Revenue Summary**

```
T-3Amount   = SUM(Trip_Data_TERMINAL-3.TripCost for vehicle)
               - SUM(penalty_VehicleWise.Amount for vehicle WHERE Entity = "T-3")
AIAAamount  = SUM(Trip_Data_AIAA.TripCost for vehicle)
               - SUM(penalty_VehicleWise.Amount for vehicle WHERE Entity = "AIAA")
Total       = T-3Amount + AIAAamount

Ownership = first non-null value found, checked in order: Trip_Data_TERMINAL-3,
            Trip_Data_AIAA, SUNDRIES, penalty_VehicleWise.
Vehtype (Cab Type) = Trip_Data_TERMINAL-3's Cab Type ALWAYS WINS if the vehicle
                     appears in both T-3 and AIAA sheets with different values.
                     Falls back to AIAA's Cab Type only if T-3 has none.
```

**Report #3 — PNL / MIS Summary**

```
Total Revenue = TOTAL REVENUE from Report #1
Expenses:
  Fuel, VehicleMaintainenceCost, DriversSalaries, VehicleEMI,
  Razorpay Transaction Fee, VenderPayment, EmployeeSalary, GST
    -> all manual monthly inputs
  MCD/State Taxs/Toll And Parking
    -> AUTO-CALCULATED = SUNDRIES.MCD + TollAmount_T3 + TollAmount_AIAA
       (NOT manual — reuses the same MCD/toll figures from Report #1)
Total Expenses = sum of all 9 expense lines above
Net Profit/(Loss) = Total Revenue - Total Expenses
```

## File tree

```
airindia-billing-app/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/        # TripDataTerminal3, TripDataAIAA, Sundries,
│   │   │                  # PenaltyVehicleWise, ManualInput, Expense
│   │   ├── schemas/        # Pydantic request/response models
│   │   ├── routers/        # upload, reports, export, manual_inputs, expenses, months
│   │   ├── services/        # excel_parser, sheet_specs, revenue_calculator,
│   │   │                    # vehicle_revenue_summary, pnl_calculator
│   │   └── utils/            # excel_export
│   ├── tests/                # pytest unit tests for the formula logic
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, MonthSelector, DashboardSelector
│   │   │   ├── shared/        # DataTable, SummaryCard, DownloadButton, EmptyState
│   │   │   ├── upload/        # UploadCard, ManualInputForm
│   │   │   └── reports/       # 3 report components
│   │   ├── pages/              # DashboardPage, UploadPage
│   │   ├── context/             # DashboardContext
│   │   ├── api/                  # axios client + reports/uploads/manualInputs
│   │   └── styles/globals.css
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Tests

```bash
cd backend
pip install -r requirements.txt
python -m pytest tests/ -v
```

Covers: the full Revenue Summary formula chain, the MCD-not-duplicated-
into-AIAA edge case, per-vehicle penalty netting, T-3-wins Cab Type
resolution, and the auto-calculated MCD/Toll/Parking PNL line.

## Known follow-ups (not yet built)

- No authentication/login.
- Re-uploading a month appends rows rather than replacing them.
- No PDF export (only `.xlsx`).
- If a vehicle's Ownership genuinely differs across sheets in conflicting
  ways, the app silently takes the first one found (T-3 priority) rather
  than flagging the conflict — add a validation warning if this matters.
