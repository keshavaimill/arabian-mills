import pandas as pd
import numpy as np
import pmdarima as pm
import joblib
import os
import warnings
from pathlib import Path
from sklearn.metrics import mean_absolute_percentage_error

# --- CONFIGURATION ---
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data"
MODEL_PATH = BASE_DIR / "models"
os.makedirs(MODEL_PATH, exist_ok=True)
warnings.filterwarnings("ignore")

def load_sales_data():
    csv_path = DATA_PATH / "sales_history.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"Missing file: {csv_path}")
    print(f"Loading sales data from {csv_path}...")
    df = pd.read_csv(csv_path)
    df['date'] = pd.to_datetime(df['date'])
    return df

def train_sku_model(sku_id, sku_df):
    """
    Trains AutoARIMA and calculates MAPE on a hidden test set.
    """
    print(f"   Processing {sku_id}...", end=" ")

    # 1. Aggregate to Daily Sums
    daily_sales = sku_df.groupby('date')['quantity_sold'].sum()
    idx = pd.date_range(start=daily_sales.index.min(), end=daily_sales.index.max(), freq='D')
    daily_sales = daily_sales.reindex(idx, fill_value=0)

    # Need enough data for training + testing (e.g., 30 days train, 7 days test)
    if len(daily_sales) < 40:
        print(f"Skipped (Data < 40 days, len={len(daily_sales)})")
        return None, None

    # 2. Split for Validation (Last 14 days as test)
    train, test = daily_sales[:-14], daily_sales[-14:]

    try:
        # 3. Train AutoARIMA
        model = pm.auto_arima(
            train,
            seasonal=True,
            m=7,
            stepwise=True,
            suppress_warnings=True,
            error_action='ignore'
        )
        
        # 4. Validate (Calculate MAPE)
        preds = model.predict(n_periods=len(test))
        # Avoid division by zero in MAPE by replacing 0s in test data with small epsilon
        test_safe = np.where(test == 0, 1e-6, test)
        mape = mean_absolute_percentage_error(test_safe, preds)
        
        # 5. Re-train on FULL data for final export
        # (Optional but recommended for best future accuracy)
        final_model = pm.auto_arima(
            daily_sales,
            seasonal=True,
            m=7,
            stepwise=True,
            suppress_warnings=True,
            error_action='ignore'
        )

        print(f"✓ MAPE: {mape:.2%}")
        return final_model, mape

    except Exception as e:
        print(f"Failed: {e}")
        return None, None

def main():
    print("="*60 + "\n   ARIMA TRAINING PIPELINE (WITH MAPE)\n" + "="*60)
    try:
        df = load_sales_data()
    except FileNotFoundError as e:
        print(e)
        return

    unique_skus = df['sku_id'].unique()
    print(f"Found {len(unique_skus)} unique SKUs.")

    sku_models = {}
    mapes = []

    for sku in unique_skus:
        sku_data = df[df['sku_id'] == sku].copy()
        model, mape = train_sku_model(sku, sku_data)
        
        if model:
            sku_models[sku] = model
            if mape is not None:
                mapes.append(mape)

    # --- SAVE DICTIONARY ---
    if sku_models:
        save_path = MODEL_PATH / "all_models.joblib"
        joblib.dump(sku_models, save_path)
        
        avg_mape = np.mean(mapes) if mapes else 0.0
        print("\n" + "="*60)
        print(f"TRAINING COMPLETE.")
        print(f"Models Trained: {len(sku_models)}")
        print(f"Average System MAPE: {avg_mape:.2%}")
        print(f"Saved to: {save_path}")
        print("="*60)
    else:
        print("\nNo models were trained.")

if __name__ == "__main__":
    main()