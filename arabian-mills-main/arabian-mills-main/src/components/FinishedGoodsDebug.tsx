/**
 * Debug component to test Finished Goods integration
 * Add this temporarily to FinishedGoods page to verify data loading
 */

import { useEffect } from 'react';
import { getFinishedGoodsForecasts } from '@/lib/finished-goods-data';
import {
  computeForecastAccuracy,
  computeAverageFillRate,
  getAverageCoverageDays,
  getDemandSurgeIndex,
  calculateTotalLostSales,
  getCriticalSKUs
} from '@/lib/finished-goods-kpis';

export const FinishedGoodsDebug = () => {
  useEffect(() => {
    const forecasts = getFinishedGoodsForecasts();
    
    console.group('🔍 Finished Goods Integration Test');
    console.log('Total Forecasts:', forecasts.length);
    console.log('Sample Record:', forecasts[0]);
    
    if (forecasts.length > 0) {
      const accuracy = computeForecastAccuracy(forecasts);
      const fillRate = computeAverageFillRate(forecasts);
      const coverage = getAverageCoverageDays(forecasts);
      const surge = getDemandSurgeIndex(forecasts);
      const lostSales = calculateTotalLostSales(forecasts);
      const critical = getCriticalSKUs(forecasts);
      
      console.log('✅ KPIs Calculated:');
      console.log('  Forecast Accuracy:', accuracy.toFixed(1) + '%');
      console.log('  Fill Rate:', fillRate.toFixed(1) + '%');
      console.log('  Avg Coverage:', coverage.toFixed(1), 'days');
      console.log('  Demand Surge:', surge.toFixed(1) + '%');
      console.log('  Lost Sales:', 'SAR', lostSales.toFixed(1) + 'M');
      console.log('  Critical SKUs:', critical.length);
      
      console.log('✅ Integration is working!');
    } else {
      console.error('❌ No forecasts loaded! Check forecast_results.json');
    }
    console.groupEnd();
  }, []);

  return null; // This component doesn't render anything
};

