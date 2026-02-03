/**
 * Test utility to verify Finished Goods data integration
 * Run this in browser console or import in a component
 */

import { getFinishedGoodsForecasts } from "./finished-goods-data";
import {
  computeForecastAccuracy,
  computeAverageFillRate,
  getAverageCoverageDays,
  getDemandSurgeIndex,
  calculateTotalLostSales,
  getRegionalForecastData,
  getSKUServiceData,
  getCriticalSKUs
} from "./finished-goods-kpis";

export const testFinishedGoodsIntegration = () => {
  console.log("🧪 Testing Finished Goods Integration...\n");
  
  try {
    // 1. Test data loading
    console.log("1️⃣ Testing data loading...");
    const forecasts = getFinishedGoodsForecasts();
    console.log(`✅ Loaded ${forecasts.length} forecast records`);
    
    if (forecasts.length === 0) {
      console.error("❌ No forecasts loaded! Check forecast_results.json path.");
      return false;
    }
    
    // Show sample record
    console.log("📊 Sample forecast record:", forecasts[0]);
    
    // 2. Test KPI calculations
    console.log("\n2️⃣ Testing KPI calculations...");
    const forecastAccuracy = computeForecastAccuracy(forecasts);
    const fillRate = computeAverageFillRate(forecasts);
    const avgCoverage = getAverageCoverageDays(forecasts);
    const demandSurge = getDemandSurgeIndex(forecasts);
    const lostSales = calculateTotalLostSales(forecasts);
    const criticalSKUs = getCriticalSKUs(forecasts);
    
    console.log(`✅ Forecast Accuracy: ${forecastAccuracy.toFixed(1)}%`);
    console.log(`✅ Fill Rate: ${fillRate.toFixed(1)}%`);
    console.log(`✅ Avg Coverage: ${avgCoverage.toFixed(1)} days`);
    console.log(`✅ Demand Surge: ${demandSurge >= 0 ? '+' : ''}${demandSurge.toFixed(1)}%`);
    console.log(`✅ Lost Sales: SAR ${lostSales.toFixed(1)}M`);
    console.log(`✅ Critical SKUs: ${criticalSKUs.length}`);
    
    // 3. Test regional data
    console.log("\n3️⃣ Testing regional data...");
    const regionalData = getRegionalForecastData(forecasts);
    console.log("✅ Regional Forecast Data:", regionalData);
    
    // 4. Test SKU service data
    console.log("\n4️⃣ Testing SKU service data...");
    const skuService = getSKUServiceData(forecasts);
    console.log(`✅ SKU Service Data (${skuService.length} SKUs):`, skuService);
    
    // 5. Data validation
    console.log("\n5️⃣ Data validation...");
    const hasValidData = forecasts.every(f => 
      typeof f.sku_id === 'string' &&
      typeof f.current_stock === 'number' &&
      typeof f.forecast_7d === 'number' &&
      typeof f.forecast_30d === 'number'
    );
    
    if (hasValidData) {
      console.log("✅ All forecast records have valid structure");
    } else {
      console.error("❌ Some records have invalid structure");
      return false;
    }
    
    // 6. Summary
    console.log("\n📈 Summary:");
    console.log(`   Total SKUs: ${forecasts.length}`);
    console.log(`   Critical SKUs: ${criticalSKUs.length}`);
    console.log(`   Total Forecast (30d): ${forecasts.reduce((sum, f) => sum + f.forecast_30d, 0).toFixed(0)}`);
    console.log(`   Total Supply (30d): ${forecasts.reduce((sum, f) => sum + f.supply_30d, 0).toFixed(0)}`);
    console.log(`   Total Current Stock: ${forecasts.reduce((sum, f) => sum + f.current_stock, 0).toFixed(0)}`);
    
    console.log("\n✅ All tests passed! Integration is working correctly.");
    return true;
    
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    return false;
  }
};

// Auto-run in development if imported
if (import.meta.env.DEV) {
  // Only log, don't auto-run to avoid console spam
  console.log("💡 To test Finished Goods integration, run: testFinishedGoodsIntegration()");
}

