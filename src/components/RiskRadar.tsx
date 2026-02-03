import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/use-locale';
import { chartTheme } from '@/lib/chart-theme';

interface LocalizedValue {
  en: string;
  ar: string;
}

interface RiskItem {
  id: string;
  material: LocalizedValue;
  plant: LocalizedValue;
  risk: 'high' | 'medium' | 'low';
  daysUntilStockout: number;
  port: LocalizedValue;
  supplierCountry: {
    code: string;
    name: LocalizedValue;
  };
}

const riskColors = {
  high: '#ef4444', // red
  medium: '#f59e0b', // yellow
  low: '#10b981' // green
};

export const RiskRadar = () => {
  const { localized } = useLocale();
  const [supplierFilter, setSupplierFilter] = useState<'all' | string>('all');

  const riskData: RiskItem[] = [
    {
      id: '1',
      material: { en: 'Wheat Type A', ar: 'قمح النوع أ' },
      plant: { en: 'Riyadh', ar: 'الرياض' },
      risk: 'high',
      daysUntilStockout: 6,
      port: { en: 'Dammam', ar: 'الدمام' },
      supplierCountry: { code: 'ua', name: { en: 'Ukraine', ar: 'أوكرانيا' } }
    },
    {
      id: '2',
      material: { en: 'Flour Premium', ar: 'دقيق فاخر' },
      plant: { en: 'Jeddah', ar: 'جدة' },
      risk: 'high',
      daysUntilStockout: 8,
      port: { en: 'Jeddah', ar: 'جدة' },
      supplierCountry: { code: 'au', name: { en: 'Australia', ar: 'أستراليا' } }
    },
    {
      id: '3',
      material: { en: 'Packaging Material', ar: 'مواد التغليف' },
      plant: { en: 'Dammam', ar: 'الدمام' },
      risk: 'medium',
      daysUntilStockout: 12,
      port: { en: 'Dammam', ar: 'الدمام' },
      supplierCountry: { code: 'in', name: { en: 'India', ar: 'الهند' } }
    },
    {
      id: '4',
      material: { en: 'Wheat Type B', ar: 'قمح النوع ب' },
      plant: { en: 'Asir', ar: 'عسير' },
      risk: 'medium',
      daysUntilStockout: 14,
      port: { en: 'Jeddah', ar: 'جدة' },
      supplierCountry: { code: 'ua', name: { en: 'Ukraine', ar: 'أوكرانيا' } }
    },
    {
      id: '5',
      material: { en: 'Yeast', ar: 'خميرة' },
      plant: { en: 'Riyadh', ar: 'الرياض' },
      risk: 'low',
      daysUntilStockout: 21,
      port: { en: 'Dammam', ar: 'الدمام' },
      supplierCountry: { code: 'de', name: { en: 'Germany', ar: 'ألمانيا' } }
    }
  ];

  const supplierOptions = ['all', ...new Set(riskData.map((item) => item.supplierCountry.code))];

  const filteredData =
    supplierFilter === 'all' ? riskData : riskData.filter((item) => item.supplierCountry.code === supplierFilter);

  return (
    <div className={cn(chartTheme.card, "p-4 sm:p-5 lg:p-6 h-full space-y-4 sm:space-y-5 lg:space-y-6")}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground">
            {localized('Ports', 'الموانئ')}
          </p>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">
            {localized('Raw materials risk radar', 'رادار مخاطر المواد الخام')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {localized('Probability by plant readiness & port delay', 'احتمالية الخطر حسب جاهزية المصانع وتأخّر الموانئ')}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {supplierOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSupplierFilter(option as typeof supplierFilter)}
              className={cn(
                "rounded-full border border-border/60 px-2.5 sm:px-3 lg:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs lg:text-sm capitalize",
                "transition-all duration-200 ease-out transform-gpu",
                "hover:scale-105 active:scale-95",
                supplierFilter === option ? "bg-foreground text-white" : "bg-white/70 text-muted-foreground"
              )}
              style={{ willChange: 'transform' }}
            >
              {option === 'all'
                ? localized('All suppliers', 'جميع الموردين')
                : localized(
                    riskData.find((item) => item.supplierCountry.code === option)?.supplierCountry.name.en ?? '',
                    riskData.find((item) => item.supplierCountry.code === option)?.supplierCountry.name.ar ?? ''
                  )}
            </button>
          ))}
        </div>
      </div>

      <div className={cn(chartTheme.chartArea, "h-[280px] sm:h-[320px] lg:h-[360px] overflow-hidden border border-slate-100/60")}>
        {/* Soft risk zones grid */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: 9 }).map((_, idx) => {
            const row = Math.floor(idx / 3);
            const bg =
              row === 2
                ? "#fee2e2" // high risk
                : row === 1
                ? "#fef3c7" // medium
                : "#d1fae5"; // low
            return (
              <div
                key={idx}
                className="border border-white/60"
                style={{ backgroundColor: bg, opacity: 0.8 }}
              />
            );
          })}
          {/* Soft grid overlay */}
          <div
            className="pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)",
              backgroundSize: "calc(100%/6) calc(100%/6)",
            }}
          />
        </div>

        <div className="absolute inset-0 p-6">
          {filteredData.map((item, index) => {
            const xPos = (index * 22 + 10) % 80;
            const yPos = item.risk === 'high' ? 70 : item.risk === 'medium' ? 45 : 20;
            return (
              <motion.div
                key={item.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute group cursor-pointer"
                style={{ left: `${xPos}%`, top: `${yPos}%` }}
              >
                <div
                  className={cn(
                    "inline-flex items-center justify-center px-4 h-9 rounded-full text-white text-xs font-semibold",
                    "transition-all duration-200 ease-out transform-gpu",
                    "hover:scale-105",
                    "shadow-[0_4px_16px_rgba(15,23,42,0.12)]",
                    "group-hover:shadow-[0_0_0_1px_rgba(15,23,42,0.08)]"
                  )}
                  style={{
                    willChange: 'transform',
                    backgroundColor: riskColors[item.risk],
                    boxShadow: `0 8px 18px ${riskColors[item.risk]}33`,
                  }}
                >
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white/90" />
                  {localized(`${item.daysUntilStockout}d`, `${item.daysUntilStockout} يوم`)}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-52 opacity-0 group-hover:opacity-100 transition-all">
                  <div className="surface-muted p-3 text-xs">
                    <p className="font-semibold">{localized(item.material.en, item.material.ar)}</p>
                    <p className="text-muted-foreground">
                      {localized(item.plant.en, item.plant.ar)} · {localized(item.port.en, item.port.ar)}
                    </p>
                    <p className="text-muted-foreground">
                      {localized('Supplier:', 'المورد:')} {localized(item.supplierCountry.name.en, item.supplierCountry.name.ar)}
                    </p>
                    <p className="text-saudi-green mt-1">
                      {localized(`Stockout in ${item.daysUntilStockout} days`, `نفاد خلال ${item.daysUntilStockout} يوم`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-[10px] sm:text-xs text-muted-foreground">
        {[
          { label: localized('High risk (<10 days)', 'مخاطر مرتفعة (< ١٠ أيام)'), color: 'bg-red-500' },
          { label: localized('Medium (10-15 days)', 'مخاطر متوسطة (١٠-١٥ يوم)'), color: 'bg-amber-500' },
          { label: localized('Low risk (>15 days)', 'مخاطر منخفضة (> ١٥ يوم)'), color: 'bg-green-500' }
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 sm:gap-2">
            <span className={cn("h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full", item.color)} />
            <span className="whitespace-nowrap">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
