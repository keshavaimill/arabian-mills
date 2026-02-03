export interface FinishedGoodsForecast {
  sku_id: string;
  current_stock: number;
  forecast_7d: number;
  forecast_14d: number;
  forecast_30d: number;
  supply_30d: number;
  balance_7d: number;
  balance_14d: number;
  balance_30d: number;
  status: string;
}

export interface RegionalForecastData {
  region: string;
  actual: number;
  forecast: number;
}

export interface SKUServiceData {
  sku: string;
  region: string;
  fill: number;
  lostSales: number;
  writeOff: number;
}

const safeDiv = (numerator: number, denominator: number): number => {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return 0;
  }
  return numerator / denominator;
};

/** Calculate days of coverage for a finished goods item */
export const computeDaysCoverage = (record: Pick<FinishedGoodsForecast, 'current_stock' | 'forecast_7d'>): number => {
  const dailyDemand = safeDiv(record.forecast_7d, 7);
  if (dailyDemand <= 0) return 0;
  return safeDiv(record.current_stock, dailyDemand);
};

/** Get critical SKUs (balance < 0 or coverage < 7 days) */
export const getCriticalSKUs = (records: FinishedGoodsForecast[]): FinishedGoodsForecast[] => {
  return records.filter((r) => {
    const daysCoverage = computeDaysCoverage(r);
    return r.balance_7d < 0 || daysCoverage < 7;
  });
};

/** Calculate average forecast accuracy (simplified - would need historical data for real MAPE) */
export const computeForecastAccuracy = (records: FinishedGoodsForecast[]): number => {
  if (!records.length) return 0;
  
  // Simplified: assume accuracy based on status distribution
  // In production, this would compare historical actuals vs forecasts
  const okCount = records.filter((r) => r.status.includes("OK")).length;
  return (okCount / records.length) * 100;
};

/** Calculate average fill rate */
export const computeAverageFillRate = (records: FinishedGoodsForecast[]): number => {
  if (!records.length) return 0;
  
  const fillRates = records.map((r) => {
    const totalDemand = r.forecast_7d;
    const available = r.current_stock + r.supply_30d;
    if (totalDemand <= 0) return 100;
    return Math.min(100, (available / totalDemand) * 100);
  });
  
  const avg = fillRates.reduce((acc, rate) => acc + rate, 0) / fillRates.length;
  return Number(avg.toFixed(1));
};

/** Calculate average coverage days */
export const getAverageCoverageDays = (records: FinishedGoodsForecast[]): number => {
  if (!records.length) return 0;
  const sum = records.reduce((acc, r) => acc + computeDaysCoverage(r), 0);
  return Number((sum / records.length).toFixed(1));
};

/** Extract SKU name from SKU ID (e.g., "SKU-FLO-000" -> "Flour") */
export const extractSKUName = (skuId: string): string => {
  const parts = skuId.split("-");
  if (parts.length < 2) return skuId;
  
  const typeMap: Record<string, string> = {
    "FLO": "Flour",
    "SEM": "Semolina",
    "WHO": "Whole grain",
    "SEL": "Select",
    "BRA": "Bran",
    "PAS": "Pasta"
  };
  
  const type = parts[1];
  const size = parts[2] ? ` ${parts[2]}kg` : "";
  return (typeMap[type] || type) + size;
};

/** Group SKUs by region (simplified - would need actual region mapping) */
export const groupByRegion = (records: FinishedGoodsForecast[]): Record<string, FinishedGoodsForecast[]> => {
  // Simplified: distribute SKUs across regions based on index
  const regions = ["Riyadh", "Jeddah", "Dammam", "South"];
  const grouped: Record<string, FinishedGoodsForecast[]> = {
    Riyadh: [],
    Jeddah: [],
    Dammam: [],
    South: []
  };
  
  records.forEach((record, index) => {
    const region = regions[index % regions.length];
    grouped[region].push(record);
  });
  
  return grouped;
};

/** Calculate regional forecast data */
export const getRegionalForecastData = (records: FinishedGoodsForecast[]): RegionalForecastData[] => {
  const grouped = groupByRegion(records);
  const regions = ["Riyadh", "Jeddah", "Dammam", "South"];
  
  return regions.map((region) => {
    const regionRecords = grouped[region] || [];
    const totalForecast = regionRecords.reduce((sum, r) => sum + r.forecast_7d, 0);
    // Simplified: actual would be from historical data
    const actual = totalForecast * (0.95 + Math.random() * 0.1); // Simulate 95-105% of forecast
    
    return {
      region,
      actual: Number(actual.toFixed(0)),
      forecast: Number(totalForecast.toFixed(0))
    };
  });
};

/** Calculate SKU service levels */
export const getSKUServiceData = (records: FinishedGoodsForecast[]): SKUServiceData[] => {
  const grouped = groupByRegion(records);
  const regions = ["Riyadh", "Jeddah", "Dammam", "South"];
  const result: SKUServiceData[] = [];
  
  regions.forEach((region) => {
    const regionRecords = grouped[region] || [];
    // Take top SKU per region
    const topSKU = regionRecords[0];
    if (!topSKU) return;
    
    const fill = computeAverageFillRate([topSKU]);
    const lostSales = topSKU.balance_7d < 0 ? Math.abs(topSKU.balance_7d) / 1000 : 0;
    const writeOff = topSKU.current_stock > topSKU.forecast_30d * 1.5 ? 0.5 : 0.2;
    
    result.push({
      sku: extractSKUName(topSKU.sku_id),
      region,
      fill: Number(fill.toFixed(0)),
      lostSales: Number((lostSales / 1000).toFixed(1)),
      writeOff: Number(writeOff.toFixed(1))
    });
  });
  
  return result;
};

/** Calculate total lost sales in SAR */
export const calculateTotalLostSales = (records: FinishedGoodsForecast[]): number => {
  const lostSales = records
    .filter((r) => r.balance_7d < 0)
    .reduce((sum, r) => sum + Math.abs(r.balance_7d), 0);
  
  // Convert to millions (assuming units are in kg, and 1kg = ~10 SAR)
  return Number((lostSales * 10 / 1000000).toFixed(1));
};

/** Get demand surge index (simplified) */
export const getDemandSurgeIndex = (records: FinishedGoodsForecast[]): number => {
  if (!records.length) return 0;
  
  // Compare 30d forecast to 7d forecast scaled up
  const avg30d = records.reduce((sum, r) => sum + r.forecast_30d, 0) / records.length;
  const avg7dScaled = (records.reduce((sum, r) => sum + r.forecast_7d, 0) / records.length) * 4.3;
  
  if (avg7dScaled <= 0) return 0;
  const surge = ((avg30d - avg7dScaled) / avg7dScaled) * 100;
  return Number(surge.toFixed(1));
};

