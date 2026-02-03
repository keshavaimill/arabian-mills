import { AlertTriangle, CalendarDays, Gauge, LineChart } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import {
  computeKingdomWideStockoutRiskIndex,
  computeMAPE,
  computeDaysCoverage,
  getAverageDaysCoverage,
  getHighRiskMaterials,
  getInventoryHealthDistribution,
  getPredictedStockouts,
  getDeviationRatio,
} from "@/lib/inventory-kpis";
import { getInventoryForecastRecords } from "@/lib/inventory-data";

const InventoryKPIDashboard = () => {
  const materials = getInventoryForecastRecords();

  const riskIndex = computeKingdomWideStockoutRiskIndex(materials);
  const { highRisk7d, highRisk14d } = getHighRiskMaterials(materials);
  const avgCoverage = getAverageDaysCoverage(materials);
  const healthBuckets = getInventoryHealthDistribution(materials);
  const stockouts = getPredictedStockouts(materials);

  // Example arrays for MAPE – in a real setup, pull from historical snapshots
  // Approximate MAPE by comparing implied_daily_avg (treated as forecast)
  // vs historical_daily_avg (treated as "actual") for each material.
  const mape = computeMAPE(
    materials.map((m) => m.historical_daily_avg),
    materials.map((m) => m.implied_daily_avg)
  );

  const avgDeviationRatio =
    materials.reduce((acc, r) => acc + getDeviationRatio(r), 0) /
    (materials.length || 1);

  const criticalBucket = healthBuckets.find((b) => b.label === "0-3");
  const highRiskBucket = healthBuckets.find((b) => b.label === "4-7");

  const firstStockout = stockouts
    .filter((s) => s.predicted_stockout_date)
    .sort(
      (a, b) =>
        (a.predicted_stockout_date as Date).getTime() -
        (b.predicted_stockout_date as Date).getTime()
    )[0];

  return (
    <div className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        index={0}
        title="Stockout Risk Index"
        value={riskIndex.index.toFixed(1)}
        subtitle={`Kingdom-wide · materials weighted: ${riskIndex.totalWeight.toFixed(1)}`}
        icon={AlertTriangle}
        status={riskIndex.index >= 60 ? "danger" : riskIndex.index >= 30 ? "warning" : "success"}
        trend={{
          value: `${highRisk7d.length} at risk (7d)`,
          isPositive: riskIndex.index < 30
        }}
        compact
      />

      <KPICard
        index={1}
        title="High Risk Materials"
        value={`${highRisk7d.length} / ${highRisk14d.length}`}
        subtitle="7-day / 14-day risk windows"
        icon={Gauge}
        status={highRisk7d.length > 0 ? "warning" : "success"}
        trend={{
          value: `${criticalBucket?.percentage ?? 0}% in 0–3d`,
          isPositive: (criticalBucket?.percentage ?? 0) < 10
        }}
        compact
      />

      <KPICard
        index={2}
        title="Avg Coverage (days)"
        value={avgCoverage.toFixed(1)}
        subtitle={`Health: ${highRiskBucket?.percentage ?? 0}% in 4–7d bucket`}
        icon={LineChart}
        status={avgCoverage < 7 ? "danger" : avgCoverage < 14 ? "warning" : "success"}
        trend={{
          value: `Deviation ratio ~${avgDeviationRatio.toFixed(2)}×`,
          isPositive: avgDeviationRatio <= 1.1
        }}
        compact
      />

      <KPICard
        index={3}
        title="Forecast Accuracy (MAPE)"
        value={`${mape.toFixed(2)}%`}
        subtitle={
          firstStockout
            ? `Next stockout: ${firstStockout.name.split("—")[0].trim()} in ${
                firstStockout.days_to_stockout ?? "N/A"
              } days`
            : "Next stockout: N/A"
        }
        icon={CalendarDays}
        status={mape <= 10 ? "success" : mape <= 20 ? "warning" : "danger"}
        trend={{
          value: "Lower is better",
          isPositive: mape <= 15
        }}
        compact
      />
    </div>
  );
};

export default InventoryKPIDashboard;


