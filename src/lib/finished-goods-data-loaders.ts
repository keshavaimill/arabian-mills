/**
 * Data loaders for Finished Goods KPIs
 * Loads sales_history, production_plan, and finished_goods_inventory CSVs
 */

// Note: In a real app, these would be API calls or proper CSV imports
// For now, we'll create interfaces and mock the data loading pattern

export interface SalesHistoryRecord {
  sales_id: string;
  date: string;
  sku_id: string;
  region: string;
  distributor_id: string;
  quantity_sold: number;
  price_per_unit: number;
  promotion_flag: boolean;
}

export interface ProductionPlanRecord {
  plan_id: string;
  sku_id: string;
  planned_date: string;
  planned_quantity: number;
  actual_produced_quantity: number;
  machine_id: string;
}

export interface FinishedGoodsInventoryRecord {
  sku_id: string;
  sku_name: string;
  category: string;
  current_stock_units: number;
  production_batch_id: string;
  last_produced_date: string;
}

// Helper to parse CSV (simplified - in production use a proper CSV parser)
const parseCSV = (csvText: string, hasHeader: boolean = true): any[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const startIndex = hasHeader ? 1 : 0;
  const headers = hasHeader ? lines[0].split(',').map(h => h.trim()) : [];
  
  return lines.slice(startIndex).map(line => {
    const values = line.split(',').map(v => v.trim());
    if (!hasHeader) return values;
    
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
    return record;
  });
};

// Try to import CSVs - if they fail, we'll use empty arrays
let salesHistoryData: SalesHistoryRecord[] = [];
let productionPlanData: ProductionPlanRecord[] = [];
let inventoryData: FinishedGoodsInventoryRecord[] = [];

try {
  // In Vite, we can use ?raw to import text files
  // For now, we'll create functions that can be called with fetched data
} catch (e) {
  console.warn('CSV files not available, using empty data');
}

/**
 * Load sales history data
 * In production, this would fetch from API or load CSV
 */
export const loadSalesHistory = async (): Promise<SalesHistoryRecord[]> => {
  // TODO: Replace with actual CSV import or API call
  // For now, return empty array - will be populated by API
  return salesHistoryData;
};

/**
 * Load production plan data
 */
export const loadProductionPlan = async (): Promise<ProductionPlanRecord[]> => {
  // TODO: Replace with actual CSV import or API call
  return productionPlanData;
};

/**
 * Load finished goods inventory data
 */
export const loadFinishedGoodsInventory = async (): Promise<FinishedGoodsInventoryRecord[]> => {
  // TODO: Replace with actual CSV import or API call
  return inventoryData;
};

/**
 * Initialize data loaders with CSV text (for client-side parsing)
 */
export const initializeDataLoaders = (
  salesHistoryCSV: string,
  productionPlanCSV: string,
  inventoryCSV: string
) => {
  try {
    salesHistoryData = parseCSV(salesHistoryCSV, true) as SalesHistoryRecord[];
    productionPlanData = parseCSV(productionPlanCSV, true) as ProductionPlanRecord[];
    inventoryData = parseCSV(inventoryCSV, true) as FinishedGoodsInventoryRecord[];
  } catch (error) {
    console.error('Error parsing CSV data:', error);
  }
};

