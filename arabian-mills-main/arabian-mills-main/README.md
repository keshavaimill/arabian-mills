# Arabian Mills Command Center

A real-time inventory management and demand forecasting dashboard built for Saudi Arabia's Vision 2030 initiative. This application provides executive-level visibility into stock levels, demand predictions, supply chain risks, and operational KPIs across raw materials and finished goods.

## 🎯 Project Overview

**Arabian Mills Command Center** is a bilingual (English/Arabic) operations dashboard that helps mill operators and executives:

- **Monitor inventory health** across multiple plants (Riyadh, Jeddah, Dammam, South)
- **Predict stockouts** using AI-powered forecasting (7-day, 14-day, 30-day horizons)
- **Track supply chain risks** including port delays, customs issues, and supplier performance
- **Analyze demand patterns** with cultural seasonality awareness (Ramadan, Hajj, Umrah, Eid)
- **Optimize production** by comparing actual vs planned output
- **Calculate financial impact** of lost sales, emergency procurement, and write-off risks

The system integrates a Python-based AutoARIMA forecasting engine with a modern React frontend to deliver actionable insights in real-time.

---

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: Vite + React 18 + TypeScript
- **UI Library**: shadcn/ui (Radix UI primitives) + Tailwind CSS
- **Routing**: React Router v6
- **Internationalization**: react-i18next (English/Arabic with RTL support)
- **Charts**: Recharts
- **Animations**: Framer Motion

### Backend (Python Forecasting Engine)
- **Location**: `src/Finished_goods_Forecasting/`
- **Technology**: AutoARIMA time-series models
- **Output**: Multi-horizon forecasts (7d, 14d, 30d) saved as JSON
- **Data Sources**: Sales history, production plans, inventory levels, purchase orders

### Data Flow
```
Python Scripts (run_forecast.py)
    ↓
forecast_results.json
    ↓
React Data Loaders (finished-goods-data.ts)
    ↓
KPI Calculation Functions (finished-goods-kpis-correct.ts)
    ↓
UI Components (FinishedGoods.tsx, Index.tsx, etc.)
```

---

## 📁 Project Structure

```
src/
├── pages/                    # Main application pages
│   ├── Index.tsx            # Executive dashboard (homepage)
│   ├── RawMaterials.tsx     # Raw materials & supplier risk view
│   └── FinishedGoods.tsx    # Finished goods & demand forecasting
│
├── components/               # Reusable UI components
│   ├── KPICard.tsx         # KPI display card with sparklines
│   ├── InventoryKPIDashboard.tsx
│   ├── RiskRadar.tsx       # Visual risk mapping
│   ├── SeasonalityChart.tsx # Demand patterns over time
│   ├── AlertCard.tsx       # Early warning alerts
│   └── ui/                 # shadcn/ui primitives
│
├── lib/                     # Business logic & data processing
│   ├── inventory-data.ts   # Raw materials CSV loader
│   ├── inventory-kpis.ts   # Raw materials KPI calculations
│   ├── finished-goods-data.ts        # Forecast JSON loader
│   ├── finished-goods-data-real.ts   # CSV data loaders
│   ├── finished-goods-kpis-correct.ts # Finished goods KPIs (spec-based)
│   └── finished-goods-kpis.ts        # Supporting calculations
│
├── data/                    # Static data files
│   └── inventory-forecast.csv
│
├── Finished_goods_Forecasting/  # Python backend
│   ├── data/               # Input CSVs (sales, production, inventory)
│   ├── src/
│   │   ├── train_models.py # Train AutoARIMA models
│   │   └── run_forecast.py  # Generate forecasts
│   ├── models/              # Serialized ML models (.joblib)
│   └── forecast_results.json # Output consumed by React app
│
├── locales/                 # Translation files
│   ├── en.json
│   └── ar.json
│
└── hooks/                   # Custom React hooks
    └── use-locale.ts       # Localization helper
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm (or bun)
- **Python** 3.8+ (for forecasting engine)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd x-mills-vision-main
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Install Python dependencies** (for forecasting engine)
   ```bash
   cd src/Finished_goods_Forecasting
   pip install -r requirements.txt
   ```

4. **Generate forecast data** (optional - for finished goods KPIs)
   ```bash
   cd src/Finished_goods_Forecasting
   python src/run_forecast.py
   ```
   This creates `forecast_results.json` which the React app consumes.

5. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Open browser**
   Navigate to `http://localhost:8080` (or the port shown in terminal)

---

## 📊 Features

### 1. Executive Dashboard (`/`)
- **Kingdom-wide stockout risk index** - Weighted risk score across all materials
- **Forecast accuracy** - MAPE-based accuracy metrics for Ramadan period
- **Lost sales prevention** - Financial impact tracking (SAR millions)
- **Emergency procurement costs** - Port delay and customs impact
- **SFDA compliance score** - Food & Drug Authority certification status
- **Vision 2030 impact gauge** - Composite efficiency metric
- **Risk radar** - Visual mapping of materials at risk by plant/port
- **Seasonality intelligence** - Cultural event demand patterns
- **Early warning center** - Critical alerts with actionable recommendations

### 2. Raw Materials View (`/materials`)
- **Inventory KPI dashboard** - Stockout risk, coverage days, high-risk materials
- **Material risk table** - Detailed view of each material's status
- **Regional filters** - Filter by region, material type, supplier country, port, customs status
- **Consumption vs forecast** - Climate-adjusted burn rate analysis
- **Supplier performance** - Delay probability by origin country
- **Inventory health distribution** - Coverage days buckets (0-3, 4-7, 8-14, 15+)

### 3. Finished Goods View (`/finished-goods`)
- **Forecast accuracy** - SKU × Region accuracy percentage
- **Fill rate** - Per-region service levels (Riyadh, Jeddah, Dammam, South)
- **Demand surge index** - Seasonal demand spikes (Ramadan, Hajj, Umrah)
- **Production variance** - Actual vs planned production percentage
- **Coverage days** - Average inventory coverage across SKUs
- **Lost sales (SAR)** - Financial impact in millions
- **Regional forecast chart** - Actual vs forecast comparison
- **Seasonality heatmap** - Demand intensity by cultural events
- **SKU profitability cards** - Per-SKU service levels, lost sales, write-off risk
- **Scenario sandbox** - What-if planning (Ramadan surge, port delays, etc.)

---

## 🔧 Key Performance Indicators (KPIs)

### Raw Materials KPIs
- **Stockout Risk Index**: Weighted risk score (0-100) based on coverage days
- **High Risk Materials**: Count of materials with <7 days or <14 days coverage
- **Average Coverage Days**: Mean inventory coverage across all materials
- **Forecast Accuracy (MAPE)**: Mean Absolute Percentage Error
- **Deviation Ratio**: Demand anomaly indicator (implied vs historical)

### Finished Goods KPIs
All KPIs follow the specification table logic:

1. **Forecast Accuracy %**: `FA% = 1 – Σ|Actual - Forecast| / ΣActual`
2. **Fill Rate**: `Actual Sales / (Actual Sales + Lost Sales)` per region
3. **Demand Surge Index**: `Avg Daily Demand During Season / Baseline Avg`
4. **Production Variance**: `(Actual - Planned) / Planned`
5. **Coverage Days**: `Current Stock / Average Daily Demand`
6. **Lost Sales (SAR)**: `Lost Units × price_per_unit`
7. **Actual vs Forecast**: Daily comparison for regional charts

---

## 🌐 Internationalization

The application supports **English** and **Arabic** with automatic RTL (right-to-left) layout switching. All UI text, KPIs, and charts are localized.

- **Language switcher**: Top navigation bar
- **Translation files**: `src/locales/en.json` and `src/locales/ar.json`
- **Helper hook**: `useLocale()` provides `localized(en, ar)` function

---

## 🔄 Data Sources

### Static Files (Bundled with App)
- `src/data/inventory-forecast.csv` - Raw materials inventory data
- `src/Finished_goods_Forecasting/forecast_results.json` - Python forecast output
- `src/Finished_goods_Forecasting/data/*.csv` - Sales history, production plans, inventory

### Data Flow
1. **Python backend** (`run_forecast.py`) reads CSV files and generates forecasts
2. **Output** saved to `forecast_results.json`
3. **React app** imports JSON and CSVs at build time
4. **KPI functions** process data and calculate metrics
5. **UI components** display calculated values

> **Note**: Currently, data is bundled with the app. For production, consider moving to API endpoints for real-time updates.

---

## 🐍 Python Backend (Forecasting Engine)

The forecasting engine uses **AutoARIMA** to generate time-series predictions for each SKU.

### Setup
```bash
cd src/Finished_goods_Forecasting
pip install -r requirements.txt
```

### Training Models
```bash
python src/train_models.py
```
Trains AutoARIMA models per SKU and saves to `models/all_models.joblib`

### Generating Forecasts
```bash
python src/run_forecast.py
```
- Reads: `finished_goods_inventory.csv`, `production_plan.csv`, `purchase_orders.csv`
- Generates: 7-day, 14-day, 30-day forecasts
- Outputs: `forecast_results.json` with balances and risk statuses

### Output Schema
```json
{
  "sku_id": "SKU-FLO-000",
  "current_stock": 414926.0,
  "forecast_7d": 23420.1,
  "forecast_14d": 46840.2,
  "forecast_30d": 100371.8,
  "supply_30d": 0.0,
  "balance_7d": 260122.9,
  "balance_14d": 236702.8,
  "balance_30d": 183171.2,
  "status": "OK"
}
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Code Structure

- **Pages**: Main route components (`Index.tsx`, `RawMaterials.tsx`, `FinishedGoods.tsx`)
- **Components**: Reusable UI elements (cards, charts, navigation)
- **Lib**: Business logic separated from UI (data loaders, KPI calculations)
- **Hooks**: Custom React hooks for locale, mobile detection, etc.

### Adding New KPIs

1. Add calculation function in `src/lib/finished-goods-kpis-correct.ts` (or `inventory-kpis.ts`)
2. Import and call in the relevant page component
3. Add to KPI cards array
4. Update translation files if needed

---

## 🎨 Design System

The application uses a custom design system optimized for executive dashboards:

- **Color Palette**: Saudi green accents, neutral grays, status colors (success/warning/danger)
- **Typography**: Inter font family with responsive sizing
- **Components**: Glass-morphism cards (`section-shell` class), rounded corners, subtle shadows
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design with breakpoints (sm, md, lg, xl)

---

## 📝 Key Files Reference

| File | Purpose |
|------|---------|
| `src/pages/Index.tsx` | Executive dashboard homepage |
| `src/pages/FinishedGoods.tsx` | Finished goods forecasting view |
| `src/lib/finished-goods-kpis-correct.ts` | KPI calculations (spec-based) |
| `src/lib/finished-goods-data.ts` | Forecast JSON loader |
| `src/Finished_goods_Forecasting/src/run_forecast.py` | Python forecasting engine |
| `src/components/KPICard.tsx` | Reusable KPI display component |

---

## 🚧 Future Enhancements

- [ ] Real-time API integration (replace static file imports)
- [ ] User authentication and role-based access
- [ ] Export functionality (PDF reports, Excel downloads)
- [ ] Historical trend analysis
- [ ] Automated alert notifications
- [ ] Mobile app version
- [ ] Advanced scenario modeling
- [ ] Integration with ERP systems

---

## 📄 License

This project is proprietary software for Arabian Mills operations.

---

## 🤝 Contributing

This is an internal operations dashboard. For questions or issues, contact the development team.

---

## 📞 Support

For technical support or feature requests, please contact the project maintainers.

---

**Built with ❤️ for Vision 2030**
