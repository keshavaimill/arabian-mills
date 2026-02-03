📦 finished_goods Forecasting Engine

A specialized time-series forecasting system designed for high-precision inventory management. It utilizes AutoARIMA to generate univariate models for individual SKUs, integrating supply chain logic to calculate net stock balances for 7, 14, and 30-day horizons.

🚀 Key Capabilities

Univariate Modeling: Trains isolated AutoARIMA models for each SKU to capture unique seasonality and trends.

Supply Chain Integration: Calculates net balance: Current Stock - Forecast + Incoming Supply (PO + Production).

Automated Validation: Computes MAPE (Mean Absolute Percentage Error) during training for model verification.

Efficient Serialization: Encapsulates all trained models into a single dictionary-based .joblib artifact for rapid loading.

Smart Alerting: Categorizes stock status into CRITICAL (<7d), WARNING (<14d), ALERT (<30d), or OK.

📂 Repository Structure

Ensure strict adherence to this directory layout for execution.

inventory_forecasting/
│
├── data/                         # [INPUT] Raw CSV sources
│   ├── sales_history.csv         # Historical demand (Train)
│   ├── finished_goods_inventory.csv # Current warehouse stock
│   ├── production_plan.csv       # Incoming manufacturing
│   └── purchase_orders.csv       # Incoming supplier orders
│
├── models/                       # [ARTIFACTS] serialized models
│   └── all_models.joblib         # Dictionary of {sku_id: arima_model}
│
├── src/                          # [SOURCE]
│   ├── __init__.py
│   ├── train_models.py           # Training pipeline
│   └── run_forecast.py           # Inference engine
│
├── forecast_results.json         # [OUTPUT] Final payload
├── requirements.txt              # Dependencies
└── README.md                     # Documentation


⚙️ Setup & Installation

Environment: Python 3.8+ recommended.

Dependencies: Install via pip.

pip install -r requirements.txt


⚡ Usage

1. Model Training

Executes the ETL pipeline, trains AutoARIMA models per SKU, calculates MAPE, and serializes the artifact.

python src/train_models.py
Output: models/all_models.joblib

2. Forecast Generation (Inference)
Loads the model artifact, computes demand for next 30 days, integrates supply schedules, and writes the status report.

python src/run_forecast.py

Output: forecast_results.json and Terminal Summary.

📝 Output Payload Schema

The system emits a JSON array containing the full risk profile for each SKU.

[
  {
    "sku_id": "SKU-SEL-006",
    "current_stock": 0.0,
    "forecast_30d": 162299.0,      // AI Demand Prediction
    "supply_30d": 50000.0,         // Production + POs
    "balance_30d": -112299.0,      // Net Position
    "status": "CRITICAL: Stockout < 7d",
    "forecast_7d": 37742.0,
    "forecast_14d": 75573.9
  }
]

