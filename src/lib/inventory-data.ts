import rawCsv from "@/data/inventory-forecast.csv?raw";
import type { MaterialForecastRecord } from "./inventory-kpis";

const parseDate = (value: string): string => {
  // Source format: DD-MM-YYYY
  const [dd, mm, yyyy] = value.split("-").map((v) => parseInt(v, 10));
  if (!dd || !mm || !yyyy) return new Date().toISOString();
  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
};

const toNumber = (value: string): number => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

export const getInventoryForecastRecords = (): MaterialForecastRecord[] => {
  const lines = rawCsv
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];

  // Skip header (first line)
  const dataLines = lines.slice(1);

  return dataLines.map((line, index) => {
    const cols = line.split(",");

    const [
      material_id,
      date,
      implied_daily_avg,
      historical_daily_avg,
      _deviation_ratio,
      forecast_7d_kg,
      forecast_14d_kg,
      forecast_30d_kg,
      material_name,
      current_stock_kg,
      balance_7d,
      balance_14d,
      _balance_30d,
      status
    ] = cols;

    const id = material_id || `ROW-${index}`;

    const record: MaterialForecastRecord = {
      id,
      material_id,
      name: material_name,
      current_stock_kg: toNumber(current_stock_kg),
      forecast_7d_kg: toNumber(forecast_7d_kg),
      forecast_14d_kg: toNumber(forecast_14d_kg),
      forecast_30d_kg: toNumber(forecast_30d_kg),
      balance_7d: toNumber(balance_7d),
      balance_14d: toNumber(balance_14d),
      // Weight each material by its 30d forecast volume; fallback to 7d if missing.
      weight: toNumber(forecast_30d_kg) || toNumber(forecast_14d_kg) || 1,
      implied_daily_avg: toNumber(implied_daily_avg),
      historical_daily_avg: toNumber(historical_daily_avg),
      date: parseDate(date),
      status
    };

    return record;
  });
};


