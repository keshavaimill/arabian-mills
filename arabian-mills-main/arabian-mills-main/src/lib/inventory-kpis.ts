export interface MaterialForecastRecord {
  id: string;
  name: string;
  material_id?: string;
  /** Current on-hand inventory in kilograms */
  current_stock_kg: number;
  /** Total forecasted demand over the next 7 days in kilograms */
  forecast_7d_kg: number;
  /** Total forecasted demand over the next 14 days in kilograms */
  forecast_14d_kg: number;
  /** Total forecasted demand over the next 30 days in kilograms (used as weight) */
  forecast_30d_kg?: number;
  /** Inventory balance after 7 days (stock - cum. demand) */
  balance_7d: number;
  /** Inventory balance after 14 days (stock - cum. demand) */
  balance_14d: number;
  /** Weighted importance of the material in the index (defaults to 1) */
  weight?: number;
  /** Implied daily average demand from the latest forecast */
  implied_daily_avg: number;
  /** Historical daily average demand (baseline) */
  historical_daily_avg: number;
  /** Anchor date for the forecast snapshot (ISO string) */
  date: string;
  /** Optional status / alert string from the source file */
  status?: string;
}

export interface StockoutRiskIndexResult {
  index: number;
  totalWeight: number;
}

export interface InventoryHealthBucket {
  label: '0-3' | '4-7' | '8-14' | '15+';
  count: number;
  percentage: number;
}

export interface PredictedStockout {
  id: string;
  name: string;
  days_to_stockout: number | null;
  predicted_stockout_date: Date | null;
}

const safeDiv = (numerator: number, denominator: number): number => {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return 0;
  }
  return numerator / denominator;
};

/** Days Coverage = current_stock_kg / (forecast_7d_kg / 7) */
export const computeDaysCoverage = (record: Pick<MaterialForecastRecord, 'current_stock_kg' | 'forecast_7d_kg'>): number => {
  const dailyDemand = safeDiv(record.forecast_7d_kg, 7);
  if (dailyDemand <= 0) return 0;
  return safeDiv(record.current_stock_kg, dailyDemand);
};

/** Risk Score per Material = 1 if days_coverage ≤ 3; 0.5 if 3 < days_coverage ≤ 7; else 0
 *  Index = 100 × (Σ(weight × risk_score) / Σ(weight))
 */
export const computeKingdomWideStockoutRiskIndex = (records: MaterialForecastRecord[]): StockoutRiskIndexResult => {
  if (!records.length) {
    return { index: 0, totalWeight: 0 };
  }

  let weightedRiskSum = 0;
  let totalWeight = 0;

  records.forEach((r) => {
    const daysCoverage = computeDaysCoverage(r);
    const weight = r.weight ?? 1;
    let riskScore = 0;

    if (daysCoverage <= 3) riskScore = 1;
    else if (daysCoverage <= 7) riskScore = 0.5;

    weightedRiskSum += weight * riskScore;
    totalWeight += weight;
  });

  if (totalWeight === 0) {
    return { index: 0, totalWeight: 0 };
  }

  const index = 100 * (weightedRiskSum / totalWeight);
  return { index: Number(index.toFixed(1)), totalWeight };
};

/** High Risk 7d = materials where balance_7d < 0 OR days_coverage < 7
 *  High Risk 14d = materials where balance_14d < 0 OR days_coverage < 14
 */
export const getHighRiskMaterials = (records: MaterialForecastRecord[]) => {
  const highRisk7d: MaterialForecastRecord[] = [];
  const highRisk14d: MaterialForecastRecord[] = [];

  records.forEach((r) => {
    const daysCoverage = computeDaysCoverage(r);

    if (r.balance_7d < 0 || daysCoverage < 7) {
      highRisk7d.push(r);
    }

    if (r.balance_14d < 0 || daysCoverage < 14) {
      highRisk14d.push(r);
    }
  });

  return { highRisk7d, highRisk14d };
};

/** Average Days of Coverage (across all materials) */
export const getAverageDaysCoverage = (records: MaterialForecastRecord[]): number => {
  if (!records.length) return 0;
  const sum = records.reduce((acc, r) => acc + computeDaysCoverage(r), 0);
  return Number((sum / records.length).toFixed(1));
};

/** Inventory Health Distribution (0–3, 4–7, 8–14, 15+ days) */
export const getInventoryHealthDistribution = (records: MaterialForecastRecord[]): InventoryHealthBucket[] => {
  const buckets: Record<InventoryHealthBucket['label'], number> = {
    '0-3': 0,
    '4-7': 0,
    '8-14': 0,
    '15+': 0
  };

  records.forEach((r) => {
    const d = computeDaysCoverage(r);
    if (d <= 3) buckets['0-3'] += 1;
    else if (d <= 7) buckets['4-7'] += 1;
    else if (d <= 14) buckets['8-14'] += 1;
    else buckets['15+'] += 1;
  });

  const total = records.length || 1;

  return (Object.keys(buckets) as InventoryHealthBucket['label'][]).map((label) => ({
    label,
    count: buckets[label],
    percentage: Number(((buckets[label] / total) * 100).toFixed(1))
  }));
};

/** Predicted Stockout Date per material */
export const getPredictedStockouts = (records: MaterialForecastRecord[]): PredictedStockout[] => {
  return records.map((r) => {
    const dailyDemand = safeDiv(r.forecast_7d_kg, 7);
    if (dailyDemand <= 0) {
      return {
        id: r.id,
        name: r.name,
        days_to_stockout: null,
        predicted_stockout_date: null
      };
    }

    const days_to_stockout = safeDiv(r.current_stock_kg, dailyDemand);
    const baseDate = new Date(r.date);
    if (Number.isNaN(baseDate.getTime())) {
      return {
        id: r.id,
        name: r.name,
        days_to_stockout: Number(days_to_stockout.toFixed(1)),
        predicted_stockout_date: null
      };
    }

    const predicted_stockout_date = new Date(baseDate);
    predicted_stockout_date.setDate(predicted_stockout_date.getDate() + days_to_stockout);

    return {
      id: r.id,
      name: r.name,
      days_to_stockout: Number(days_to_stockout.toFixed(1)),
      predicted_stockout_date
    };
  });
};

/** Deviation Ratio (Demand Anomaly Indicator)
 *  Deviation Ratio = implied_daily_avg / historical_daily_avg
 */
export const getDeviationRatio = (record: Pick<MaterialForecastRecord, 'implied_daily_avg' | 'historical_daily_avg'>): number => {
  if (record.historical_daily_avg === 0) return 0;
  return Number(safeDiv(record.implied_daily_avg, record.historical_daily_avg).toFixed(2));
};

/** Forecast Accuracy (MAPE)
 *  MAPE = mean(|actual - forecast| / actual) × 100
 */
export const computeMAPE = (actual: number[], forecast: number[]): number => {
  if (!actual.length || actual.length !== forecast.length) return 0;

  let n = 0;
  let errorSum = 0;

  for (let i = 0; i < actual.length; i++) {
    const a = actual[i];
    const f = forecast[i];
    if (a === 0) continue;
    const err = Math.abs(a - f) / Math.abs(a);
    errorSum += err;
    n += 1;
  }

  if (!n) return 0;
  return Number(((errorSum / n) * 100).toFixed(2));
};


