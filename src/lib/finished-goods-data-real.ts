/**
 * Real data loaders for Finished Goods - imports CSV files directly
 */

import salesHistoryRaw from "@/data/sales_history.csv?raw";
import productionPlanRaw from "@/data/production_plan.csv?raw";
import inventoryRaw from "@/data/finished_goods_inventory.csv?raw";
import type { 
  SalesHistoryRecord, 
  ProductionPlanRecord, 
  FinishedGoodsInventoryRecord 
} from './finished-goods-data-loaders';

const parseCSV = <T>(csvText: string, hasHeader: boolean = true): T[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const startIndex = hasHeader ? 1 : 0;
  const headers = hasHeader ? lines[0].split(',').map(h => h.trim()) : [];
  
  return lines.slice(startIndex).map(line => {
    const values = line.split(',').map(v => v.trim());
    if (!hasHeader) return values as T;
    
    const record: any = {};
    headers.forEach((header, index) => {
      let value: any = values[index] || '';
      
      // Try to parse numbers
      if (!isNaN(Number(value)) && value !== '') {
        value = Number(value);
      }
      // Parse booleans
      else if (value === 'True' || value === 'true') {
        value = true;
      } else if (value === 'False' || value === 'false') {
        value = false;
      }
      
      record[header] = value;
    });
    return record as T;
  });
};

/**
 * Load sales history data from CSV
 */
export const getSalesHistory = (): SalesHistoryRecord[] => {
  try {
    return parseCSV<SalesHistoryRecord>(salesHistoryRaw, true);
  } catch (error) {
    console.error('Error loading sales history:', error);
    return [];
  }
};

/**
 * Load production plan data from CSV
 */
export const getProductionPlan = (): ProductionPlanRecord[] => {
  try {
    return parseCSV<ProductionPlanRecord>(productionPlanRaw, true);
  } catch (error) {
    console.error('Error loading production plan:', error);
    return [];
  }
};

/**
 * Load finished goods inventory data from CSV
 */
export const getFinishedGoodsInventory = (): FinishedGoodsInventoryRecord[] => {
  try {
    return parseCSV<FinishedGoodsInventoryRecord>(inventoryRaw, true);
  } catch (error) {
    console.error('Error loading inventory:', error);
    return [];
  }
};

