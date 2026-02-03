/**
 * Comprehensive integration verification
 * Checks all data sources, KPI connections, and calculations
 */

import { getFinishedGoodsForecasts } from './finished-goods-data';
import { getSalesHistory, getProductionPlan, getFinishedGoodsInventory } from './finished-goods-data-real';
import {
  calculateForecastAccuracy,
  calculateFillRate,
  calculateDemandSurgeIndex,
  calculateProductionVariance,
  calculateCoverageDays,
  calculateLostSalesSAR,
  getActualVsForecast,
  getSeasonalityDates
} from './finished-goods-kpis-correct';
import { getCriticalSKUs } from './finished-goods-kpis';

export interface VerificationResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export const verifyIntegration = (): VerificationResult[] => {
  const results: VerificationResult[] = [];
  
  // 1. Check Backend Data (forecast_results.json)
  try {
    const forecasts = getFinishedGoodsForecasts();
    if (forecasts.length === 0) {
      results.push({
        component: 'Backend Forecasts',
        status: 'fail',
        message: 'No forecast data loaded from forecast_results.json',
        details: { count: 0 }
      });
    } else {
      results.push({
        component: 'Backend Forecasts',
        status: 'pass',
        message: `Loaded ${forecasts.length} forecast records`,
        details: {
          count: forecasts.length,
          sample: forecasts[0],
          criticalSKUs: getCriticalSKUs(forecasts).length
        }
      });
    }
  } catch (error: any) {
    results.push({
      component: 'Backend Forecasts',
      status: 'fail',
      message: `Error loading forecasts: ${error.message}`,
      details: { error: error.toString() }
    });
  }
  
  // 2. Check Sales History CSV
  try {
    const salesHistory = getSalesHistory();
    if (salesHistory.length === 0) {
      results.push({
        component: 'Sales History CSV',
        status: 'warning',
        message: 'Sales history is empty - KPIs may not calculate correctly',
        details: { count: 0 }
      });
    } else {
      results.push({
        component: 'Sales History CSV',
        status: 'pass',
        message: `Loaded ${salesHistory.length} sales records`,
        details: {
          count: salesHistory.length,
          sample: salesHistory[0],
          dateRange: {
            earliest: salesHistory[0]?.date,
            latest: salesHistory[salesHistory.length - 1]?.date
          }
        }
      });
    }
  } catch (error: any) {
    results.push({
      component: 'Sales History CSV',
      status: 'fail',
      message: `Error loading sales history: ${error.message}`,
      details: { error: error.toString() }
    });
  }
  
  // 3. Check Production Plan CSV
  try {
    const productionPlan = getProductionPlan();
    if (productionPlan.length === 0) {
      results.push({
        component: 'Production Plan CSV',
        status: 'warning',
        message: 'Production plan is empty - production variance KPI will be 0',
        details: { count: 0 }
      });
    } else {
      results.push({
        component: 'Production Plan CSV',
        status: 'pass',
        message: `Loaded ${productionPlan.length} production records`,
        details: {
          count: productionPlan.length,
          sample: productionPlan[0]
        }
      });
    }
  } catch (error: any) {
    results.push({
      component: 'Production Plan CSV',
      status: 'fail',
      message: `Error loading production plan: ${error.message}`,
      details: { error: error.toString() }
    });
  }
  
  // 4. Check Inventory CSV
  try {
    const inventory = getFinishedGoodsInventory();
    if (inventory.length === 0) {
      results.push({
        component: 'Inventory CSV',
        status: 'warning',
        message: 'Inventory is empty - coverage days KPI will be 0',
        details: { count: 0 }
      });
    } else {
      results.push({
        component: 'Inventory CSV',
        status: 'pass',
        message: `Loaded ${inventory.length} inventory records`,
        details: {
          count: inventory.length,
          sample: inventory[0],
          totalStock: inventory.reduce((sum, inv) => sum + inv.current_stock_units, 0)
        }
      });
    }
  } catch (error: any) {
    results.push({
      component: 'Inventory CSV',
      status: 'fail',
      message: `Error loading inventory: ${error.message}`,
      details: { error: error.toString() }
    });
  }
  
  // 5. Test KPI Calculations
  try {
    const forecasts = getFinishedGoodsForecasts();
    const salesHistory = getSalesHistory();
    const productionPlan = getProductionPlan();
    const inventory = getFinishedGoodsInventory();
    
    if (salesHistory.length > 0 && productionPlan.length > 0) {
      const forecastAccuracy = calculateForecastAccuracy(salesHistory, productionPlan);
      results.push({
        component: 'KPI: Forecast Accuracy',
        status: forecastAccuracy >= 0 && forecastAccuracy <= 100 ? 'pass' : 'warning',
        message: `Forecast Accuracy: ${forecastAccuracy.toFixed(1)}%`,
        details: { value: forecastAccuracy }
      });
    } else {
      results.push({
        component: 'KPI: Forecast Accuracy',
        status: 'warning',
        message: 'Cannot calculate - missing sales history or production plan data'
      });
    }
    
    if (salesHistory.length > 0 && forecasts.length > 0) {
      const fillRateRiyadh = calculateFillRate(salesHistory, forecasts, 'Riyadh');
      results.push({
        component: 'KPI: Fill Rate (Riyadh)',
        status: fillRateRiyadh >= 0 && fillRateRiyadh <= 100 ? 'pass' : 'warning',
        message: `Fill Rate: ${fillRateRiyadh.toFixed(1)}%`,
        details: { value: fillRateRiyadh }
      });
    }
    
    if (productionPlan.length > 0) {
      const productionVariance = calculateProductionVariance(productionPlan);
      results.push({
        component: 'KPI: Production Variance',
        status: 'pass',
        message: `Production Variance: ${productionVariance >= 0 ? '+' : ''}${productionVariance.toFixed(1)}%`,
        details: { value: productionVariance }
      });
    }
    
    if (inventory.length > 0 && salesHistory.length > 0) {
      const sampleCoverage = calculateCoverageDays(inventory[0], salesHistory, inventory[0].sku_id);
      results.push({
        component: 'KPI: Coverage Days',
        status: sampleCoverage >= 0 ? 'pass' : 'warning',
        message: `Sample Coverage: ${sampleCoverage.toFixed(1)} days`,
        details: { value: sampleCoverage, sku: inventory[0].sku_id }
      });
    }
    
    if (salesHistory.length > 0 && forecasts.length > 0) {
      const lostSales = calculateLostSalesSAR(salesHistory, forecasts);
      results.push({
        component: 'KPI: Lost Sales',
        status: lostSales >= 0 ? 'pass' : 'warning',
        message: `Lost Sales: SAR ${lostSales.toFixed(1)}M`,
        details: { value: lostSales }
      });
    }
    
  } catch (error: any) {
    results.push({
      component: 'KPI Calculations',
      status: 'fail',
      message: `Error calculating KPIs: ${error.message}`,
      details: { error: error.toString() }
    });
  }
  
  // 6. Check Data Connections
  const forecasts = getFinishedGoodsForecasts();
  const salesHistory = getSalesHistory();
  const productionPlan = getProductionPlan();
  
  if (forecasts.length > 0 && salesHistory.length > 0 && productionPlan.length > 0) {
    results.push({
      component: 'Data Connections',
      status: 'pass',
      message: 'All data sources connected and ready',
      details: {
        forecasts: forecasts.length,
        salesHistory: salesHistory.length,
        productionPlan: productionPlan.length
      }
    });
  } else {
    results.push({
      component: 'Data Connections',
      status: 'warning',
      message: 'Some data sources are missing',
      details: {
        forecasts: forecasts.length,
        salesHistory: salesHistory.length,
        productionPlan: productionPlan.length
      }
    });
  }
  
  return results;
};

export const printVerificationReport = () => {
  const results = verifyIntegration();
  
  console.group('🔍 Finished Goods Integration Verification');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  console.log(`\n📊 Summary: ${passed} passed, ${warnings} warnings, ${failed} failed\n`);
  
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.component}: ${result.message}`);
    if (result.details) {
      console.log('   Details:', result.details);
    }
  });
  
  console.groupEnd();
  
  return { passed, warnings, failed, total: results.length };
};

