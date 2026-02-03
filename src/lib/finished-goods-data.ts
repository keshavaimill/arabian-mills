import forecastResults from "@/data/forecast_results.json";
import type { FinishedGoodsForecast } from "./finished-goods-kpis";

export const getFinishedGoodsForecasts = (): FinishedGoodsForecast[] => {
  if (!Array.isArray(forecastResults)) return [];

  return forecastResults.map((item) => ({
    sku_id: item.sku_id || "",
    current_stock: Number(item.current_stock) || 0,
    forecast_7d: Number(item.forecast_7d) || 0,
    forecast_14d: Number(item.forecast_14d) || 0,
    forecast_30d: Number(item.forecast_30d) || 0,
    supply_30d: Number(item.supply_30d) || 0,
    balance_7d: Number(item.balance_7d) || 0,
    balance_14d: Number(item.balance_14d) || 0,
    balance_30d: Number(item.balance_30d) || 0,
    status: item.status || "OK",
  }));
};

