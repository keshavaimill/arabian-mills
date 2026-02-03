import { Navigation } from "@/components/Navigation";
import { TextSqlHelper } from "@/components/TextSqlHelper";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { useLocale } from "@/hooks/use-locale";
import { useMemo } from "react";
import { getFinishedGoodsForecasts } from "@/lib/finished-goods-data";
import {
  getSalesHistory,
  getProductionPlan,
  getFinishedGoodsInventory
} from "@/lib/finished-goods-data-real";
import {
  calculateForecastAccuracy,
  calculateFillRate,
  calculateDemandSurgeIndex,
  calculateProductionVariance,
  calculateCoverageDays,
  calculateLostSalesSAR,
  getActualVsForecast,
  getSeasonalityDates
} from "@/lib/finished-goods-kpis-correct";
import {
  getSKUServiceData,
  getCriticalSKUs
} from "@/lib/finished-goods-kpis";

// Keep heatmap static as it's cultural/seasonal data that would need separate historical analysis
const heatmap = [
  { period: "Ramadan", central: 120, west: 132, east: 110, south: 98 },
  { period: "Umrah", central: 108, west: 140, east: 103, south: 92 },
  { period: "Eid Al-Fitr", central: 130, west: 125, east: 118, south: 104 },
  { period: "Eid Al-Adha", central: 118, west: 126, east: 109, south: 96 },
  { period: "Back to School", central: 102, west: 108, east: 100, south: 90 }
];

// Keep scenarios static as they're what-if planning scenarios
const scenarios = [
  { title: "Ramadan +25%", impact: "Requires +2 milling shifts, +3.5KT wheat", financial: "+SAR 4.2M upside" },
  { title: "Umrah surge +18%", impact: "Reallocate FG to Western DC, expedite Dammam shipments", financial: "+SAR 1.1M" },
  { title: "Port congestion +7 days", impact: "Trigger emergency import, raise customs watch", financial: "‑SAR 2.6M risk" },
  { title: "Heatwave spoilage risk", impact: "Increase cold storage, accelerate turnover South", financial: "‑SAR 0.9M risk" }
];

const FinishedGoods = () => {
  const { localized } = useLocale();
  
  // Load all data sources
  const forecasts = useMemo(() => getFinishedGoodsForecasts(), []);
  const salesHistory = useMemo(() => getSalesHistory(), []);
  const productionPlan = useMemo(() => getProductionPlan(), []);
  const inventory = useMemo(() => getFinishedGoodsInventory(), []);
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('📊 Finished Goods Data Loaded:', {
      forecasts: forecasts.length,
      salesHistory: salesHistory.length,
      productionPlan: productionPlan.length,
      inventory: inventory.length
    });
    
    // Run comprehensive verification
    import('@/lib/verify-integration').then(module => {
      module.printVerificationReport();
    });
  }
  
  // Calculate KPIs using correct logic from specification
  
  // KPI 1: Forecast Accuracy % (SKU × Region)
  const forecastAccuracy = useMemo(() => {
    return calculateForecastAccuracy(salesHistory, productionPlan);
  }, [salesHistory, productionPlan]);
  
  // KPI 2: Fill Rate (by region)
  const fillRateRiyadh = useMemo(() => 
    calculateFillRate(salesHistory, forecasts, 'Riyadh'), [salesHistory, forecasts]);
  const fillRateJeddah = useMemo(() => 
    calculateFillRate(salesHistory, forecasts, 'Jeddah'), [salesHistory, forecasts]);
  const fillRateDammam = useMemo(() => 
    calculateFillRate(salesHistory, forecasts, 'Dammam'), [salesHistory, forecasts]);
  const fillRateSouth = useMemo(() => 
    calculateFillRate(salesHistory, forecasts, 'South'), [salesHistory, forecasts]);
  
  // Average fill rate across all regions
  const avgFillRate = useMemo(() => {
    const rates = [fillRateRiyadh, fillRateJeddah, fillRateDammam, fillRateSouth].filter(r => r > 0);
    return rates.length > 0 
      ? rates.reduce((sum, r) => sum + r, 0) / rates.length 
      : 0;
  }, [fillRateRiyadh, fillRateJeddah, fillRateDammam, fillRateSouth]);
  
  // KPI 3: Demand Surge Index (Ramadan)
  const currentYear = new Date().getFullYear();
  const seasonDates = getSeasonalityDates(currentYear);
  const baselineStart = new Date(currentYear, 0, 1); // Jan 1
  const baselineEnd = new Date(currentYear, 1, 28); // Feb 28
  
  const demandSurge = useMemo(() => {
    return calculateDemandSurgeIndex(
      salesHistory,
      seasonDates.ramadan.start,
      seasonDates.ramadan.end,
      baselineStart,
      baselineEnd
    );
  }, [salesHistory, seasonDates, baselineStart, baselineEnd]);
  
  // KPI 4: Over/Under Production %
  const productionVariance = useMemo(() => {
    return calculateProductionVariance(productionPlan);
  }, [productionPlan]);
  
  // KPI 5: FG Inventory Coverage Days (average)
  const avgCoverage = useMemo(() => {
    if (inventory.length === 0) return 0;
    
    const coverages = inventory.map(inv => {
      return calculateCoverageDays(inv, salesHistory, inv.sku_id);
    }).filter(c => c > 0);
    
    return coverages.length > 0
      ? coverages.reduce((sum, c) => sum + c, 0) / coverages.length
      : 0;
  }, [inventory, salesHistory]);
  
  // KPI 6: Lost Sales (SAR)
  const lostSales = useMemo(() => {
    return calculateLostSalesSAR(salesHistory, forecasts);
  }, [salesHistory, forecasts]);
  
  const criticalSKUs = useMemo(() => getCriticalSKUs(forecasts), [forecasts]);
  
  // KPI 7: Actual vs Forecast (for regional chart)
  const regionalForecast = useMemo(() => {
    const regions = ['Riyadh', 'Jeddah', 'Dammam', 'South'];
    return regions.map(region => {
      const actualVsForecast = getActualVsForecast(salesHistory, productionPlan, region);
      const recent = actualVsForecast.slice(-7); // Last 7 days
      const actual = recent.reduce((sum, d) => sum + d.actual, 0);
      const forecast = recent.reduce((sum, d) => sum + d.forecast, 0);
      
      return {
        region,
        actual: Number(actual.toFixed(0)),
        forecast: Number(forecast.toFixed(0))
      };
    });
  }, [salesHistory, productionPlan]);
  
  const fgKpis = [
    { 
      label: "Forecast accuracy", 
      value: `${forecastAccuracy.toFixed(1)}%`, 
      subtitle: `SKU × Region (${forecasts.length} SKUs)`, 
      ar: "دقة التنبؤ" 
    },
    { 
      label: "Fill rate", 
      value: `${avgFillRate.toFixed(0)}%`, 
      subtitle: `Riyadh: ${fillRateRiyadh.toFixed(0)}% | Jeddah: ${fillRateJeddah.toFixed(0)}% | Dammam: ${fillRateDammam.toFixed(0)}% | South: ${fillRateSouth.toFixed(0)}%`, 
      ar: "معدل التلبية" 
    },
    { 
      label: "Demand surge index", 
      value: `${demandSurge >= 0 ? '+' : ''}${demandSurge.toFixed(1)}%`, 
      subtitle: "Ramadan vs Baseline", 
      ar: "مؤشر الزيادة" 
    },
    { 
      label: "Over / under production", 
      value: `${productionVariance >= 0 ? '+' : ''}${productionVariance.toFixed(1)}%`, 
      subtitle: "Actual vs Planned", 
      ar: "الإنتاج مقابل الخطة" 
    },
    { 
      label: "FG coverage days", 
      value: avgCoverage.toFixed(1), 
      subtitle: `${criticalSKUs.length} critical SKUs`, 
      ar: "أيام التغطية" 
    },
    { 
      label: "Lost sales (SAR)", 
      value: `${lostSales.toFixed(1)}M`, 
      subtitle: "Last 30 days", 
      ar: "المبيعات المفقودة" 
    }
  ];
  
  // Get SKU service data from real forecasts
  const skuService = useMemo(() => getSKUServiceData(forecasts), [forecasts]);
  
  return (
  <div className="min-h-screen">
    {/* Uncomment to enable debug logging */}
    {/* <FinishedGoodsDebug /> */}
    <Navigation />
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-10">
      <header className="space-y-3 sm:space-y-4">
        <p className="pill w-fit text-[10px] sm:text-[11px] px-3 sm:px-4 py-1">Vision 2030 · Finished Goods</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">Finished Goods & Demand Forecasting</h1>
            <p className="text-muted-foreground max-w-3xl text-sm sm:text-base lg:text-lg leading-relaxed">
              Regional forecast intelligence, cultural seasonality, and SKU service levels tuned for Riyadh, Jeddah,
              Dammam, and Southern corridors.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:gap-4 lg:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {fgKpis.map((kpi) => (
          <div key={kpi.label} className="section-shell p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-xs sm:text-sm text-muted-foreground/80 font-arabic">{kpi.ar}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold">{kpi.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-5 lg:gap-6 lg:grid-cols-2">
        <div className="section-shell p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
          <div className="mb-2">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-1 sm:mb-2">Regions</p>
            <h3 className="text-lg sm:text-xl font-semibold leading-tight">Actual vs forecast by region</h3>
          </div>
          <div className="h-56 sm:h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={regionalForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={3} />
                <Line type="monotone" dataKey="forecast" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="6 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-shell p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
          <div className="mb-2">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-1 sm:mb-2">Seasonality</p>
            <h3 className="text-lg sm:text-xl font-semibold leading-tight">Demand heatmap (Events)</h3>
          </div>
          <div className="h-56 sm:h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmap}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="central" stackId="a" fill="rgba(249,115,22,0.8)" />
                <Bar dataKey="west" stackId="a" fill="rgba(14,165,233,0.8)" />
                <Bar dataKey="east" stackId="a" fill="rgba(5,150,105,0.8)" />
                <Bar dataKey="south" stackId="a" fill="rgba(147,51,234,0.8)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:gap-6 lg:grid-cols-2">
        <div className="section-shell p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-1 sm:mb-2">Service</p>
              <h3 className="text-lg sm:text-xl font-semibold leading-tight">SKU profitability & service levels</h3>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">MT · TT · HORECA</span>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {skuService.map((sku) => (
              <div key={sku.sku} className="rounded-2xl sm:rounded-3xl border border-border/70 bg-white/80 p-3 sm:p-4 transition-all duration-200 hover-lift" style={{ willChange: 'transform' }}>
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold truncate">{sku.sku}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{sku.region}</p>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold flex-shrink-0">{sku.fill}% fill</p>
                </div>
                <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                  <div>Lost sales: SAR {sku.lostSales}M</div>
                  <div>Write-off risk: {sku.writeOff}%</div>
                </div>
                <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-foreground" style={{ width: `${sku.fill}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-shell p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
          <div className="mb-2">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-1 sm:mb-2">Simulation</p>
            <h3 className="text-lg sm:text-xl font-semibold leading-tight">Scenario sandbox (Priorities)</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {scenarios.map((scenario) => (
              <div key={scenario.title} className="rounded-2xl sm:rounded-3xl border border-border/70 bg-white/80 p-3 sm:p-4 transition-all duration-200 hover-lift" style={{ willChange: 'transform' }}>
                <p className="text-xs sm:text-sm font-semibold">{scenario.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-snug">{scenario.impact}</p>
                <p className="text-[10px] sm:text-xs text-saudi-green mt-1 sm:mt-2">{scenario.financial}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 lg:mt-10">
        <TextSqlHelper
          title="Text-to-SQL · Finished Goods"
          examples={[
            "Which SKUs had the highest lost sales during Ramadan this year?",
            "Forecast demand uplift for Western Region during Umrah season",
            "Compare forecast accuracy for flour SKUs across Riyadh vs Jeddah"
          ]}
        />
      </div>
    </div>
  </div>
);
};

export default FinishedGoods;

