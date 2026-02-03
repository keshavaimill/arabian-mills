import pandas as pd
import numpy as np
import joblib
import os
import warnings
from pathlib import Path
from datetime import datetime, timedelta

# --- CONFIGURATION ---
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data"
MODEL_PATH = BASE_DIR / "models"
OUTPUT_JSON = BASE_DIR / "forecast_results.json"
warnings.filterwarnings("ignore")

def load_csv(filename):
    path = DATA_PATH / filename
    if not path.exists():
        return pd.DataFrame()
    df = pd.read_csv(path)
    df.columns = [c.lower().strip() for c in df.columns]
    date_col = next((col for col in df.columns if 'date' in col or 'delivery' in col), None)
    if date_col:
        df['standard_date'] = pd.to_datetime(df[date_col])
    return df

def get_incoming_supply(sku_id, days_horizon, prod_df, po_df):
    total = 0.0
    cutoff = datetime.now() + timedelta(days=days_horizon)
    for df in [prod_df, po_df]:
        if not df.empty and 'sku_id' in df.columns and 'standard_date' in df.columns:
            qty_col = next((c for c in df.columns if 'quantity' in c or 'qty' in c), None)
            if qty_col:
                mask = (df['sku_id'] == sku_id) & (df['standard_date'] <= cutoff) & (df['standard_date'] >= datetime.now())
                total += df.loc[mask, qty_col].sum()
    return total

def generate_forecasts(inventory_df, prod_df, po_df):
    results = []
    
    # Load Dict
    dict_path = MODEL_PATH / "all_models.joblib"
    models_dict = joblib.load(dict_path) if dict_path.exists() else {}

    print(f"Generating forecasts for {len(inventory_df)} items...\n")

    for _, row in inventory_df.iterrows():
        sku_id = row["sku_id"]
        # Prefer explicit current_stock column; fall back to current_stock_units or quantity if needed
        current_stock = float(
            row.get(
                "current_stock",
                row.get("current_stock_units", row.get("quantity", 0)),
            )
        )

        item_res = {
            "sku_id": sku_id,
            "current_stock": current_stock,
            "forecast_30d": 0,
            "supply_30d": 0,
            "balance_30d": 0,
            "status": "No Model"
        }

        # 1. FORECAST
        f_7, f_14, f_30 = 0, 0, 0
        if sku_id in models_dict:
            try:
                model = models_dict[sku_id]
                # Predict 30 days
                preds = np.maximum(model.predict(n_periods=30), 0)
                f_7, f_14, f_30 = [np.sum(preds[:n]) for n in [7, 14, 30]]
                item_res["status"] = "OK"
            except:
                item_res["status"] = "Model Error"
        
        # 2. SUPPLY
        s_7 = get_incoming_supply(sku_id, 7, prod_df, po_df)
        s_14 = get_incoming_supply(sku_id, 14, prod_df, po_df)
        s_30 = get_incoming_supply(sku_id, 30, prod_df, po_df)

        # 3. BALANCE
        b_7 = current_stock - f_7 + s_7
        b_14 = current_stock - f_14 + s_14
        b_30 = current_stock - f_30 + s_30

        item_res.update({
            "forecast_7d": round(float(f_7), 1),
            "forecast_14d": round(float(f_14), 1),
            "forecast_30d": round(float(f_30), 1),
            "supply_30d": round(float(s_30), 1),
            "balance_7d": round(b_7, 1),
            "balance_14d": round(b_14, 1),
            "balance_30d": round(b_30, 1)
        })

        # 4. ALERT LOGIC
        if item_res["status"] == "OK":
            if b_7 < 0: item_res["status"] = "CRITICAL: Stockout < 7d"
            elif b_14 < 0: item_res["status"] = "WARNING: Stockout < 14d"
            elif b_30 < 0: item_res["status"] = "ALERT: Stockout < 30d"

        results.append(item_res)

    return pd.DataFrame(results)

def main():
    print("="*80 + "\n      MULTI-HORIZON FORECASTER\n" + "="*80)
    
    inv = load_csv("finished_goods_inventory.csv")
    prod = load_csv("production_plan.csv")
    po = load_csv("purchase_orders.csv")

    if inv.empty:
        print("Error: Inventory file missing.")
        return

    df = generate_forecasts(inv, prod, po)
    df = df.sort_values("balance_30d", ascending=True)

    # Display
    cols = ['sku_id', 'current_stock', 'forecast_30d', 'supply_30d', 'balance_30d', 'status']
    try:
        print(df[cols].head(15).to_markdown(index=False, floatfmt=".1f"))
    except:
        print(df[cols].head(15).to_string(index=False))

    df.to_json(OUTPUT_JSON, orient='records', indent=4)
    print(f"\n✓ Results saved to: {OUTPUT_JSON}")

if __name__ == "__main__":
    main()