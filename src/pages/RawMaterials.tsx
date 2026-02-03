import { Navigation } from "@/components/Navigation";
import { TextSqlHelper } from "@/components/TextSqlHelper";
import InventoryKPIDashboard from "@/components/InventoryKPIDashboard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Line, ComposedChart, Area } from "recharts";

const filters = [
  { label: "Region", options: ["Riyadh", "Jeddah", "Dammam", "Abha"] },
  { label: "Material", options: ["Wheat", "Packaging", "Additives"] },
  { label: "Supplier Country", options: ["Ukraine", "India", "Australia", "Germany"] },
  { label: "Port", options: ["Jeddah", "Dammam", "Yanbu"] },
  { label: "Customs status", options: ["Cleared", "Pending", "Delayed"] }
];

const materialRisk = [
  { material: "Wheat Type A", plant: "Riyadh", stock: 420, coverage: 6, stockout: "28 Jan", supplier: "Almar", country: "Ukraine", port: "Dammam", customs: "High", heat: "Medium", order: "2,400t" },
  { material: "Premium Flour", plant: "Jeddah", stock: 210, coverage: 4, stockout: "25 Jan", supplier: "WestFoods", country: "Australia", port: "Jeddah", customs: "Medium", heat: "Low", order: "1,200t" },
  { material: "Packaging Film", plant: "Dammam", stock: 310, coverage: 12, stockout: "6 Feb", supplier: "PolyCraft", country: "India", port: "Dammam", customs: "Low", heat: "High", order: "800t" },
  { material: "Yeast", plant: "Asir", stock: 120, coverage: 5, stockout: "30 Jan", supplier: "BioFer", country: "Germany", port: "Yanbu", customs: "Low", heat: "Medium", order: "300t" }
];

const coverageBuckets = [
  { label: "0-3 days", value: 12, tone: "bg-red-500" },
  { label: "4-7 days", value: 18, tone: "bg-amber-500" },
  { label: "8-14 days", value: 28, tone: "bg-yellow-400" },
  { label: "15+ days", value: 42, tone: "bg-green-500" }
];

const consumptionVsForecast = [
  { day: "Mon", consumption: 92, forecast: 88, tempAdj: 4 },
  { day: "Tue", consumption: 95, forecast: 93, tempAdj: 3 },
  { day: "Wed", consumption: 99, forecast: 95, tempAdj: 5 },
  { day: "Thu", consumption: 110, forecast: 105, tempAdj: 7 },
  { day: "Fri", consumption: 120, forecast: 112, tempAdj: 8 },
  { day: "Sat", consumption: 118, forecast: 115, tempAdj: 6 },
  { day: "Sun", consumption: 100, forecast: 98, tempAdj: 4 }
];

const supplierPerformance = [
  { country: "Ukraine", delay: 32, port: "Dammam" },
  { country: "India", delay: 18, port: "Dammam" },
  { country: "Australia", delay: 12, port: "Jeddah" },
  { country: "Germany", delay: 8, port: "Yanbu" }
];

const kpis = [
  { label: "High risk materials", value: "12", subtitle: "Next 7 days", ar: "مواد عالية الخطورة" },
  { label: "Days of coverage", value: "8.4", subtitle: "Critical inputs", ar: "أيام التغطية" },
  { label: "Port-to-plant lead time", value: "11d", subtitle: "Avg across plants", ar: "زمن النقل" },
  { label: "Customs delay index", value: "0.42", subtitle: "Dammam focus", ar: "مؤشر الجمارك" },
  { label: "Emergency procurement", value: "SAR 5.4M", subtitle: "Past 30 days", ar: "الشراء الطارئ" },
  { label: "Supplier delay probability", value: "18%", subtitle: "India / Ukraine", ar: "تأخير المورد" }
];

const FilterGroup = () => (
  <div className="section-shell p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs sm:text-sm font-semibold">Localized Filters</p>
    </div>
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
      {filters.map((filter) => (
        <div key={filter.label} className="space-y-2 sm:space-y-3">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground">{filter.label}</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {filter.options.map((option) => (
              <button
                key={option}
                className="rounded-full border border-border/60 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-muted-foreground hover:bg-white transition-all duration-200 transform-gpu hover:scale-105 active:scale-95"
                style={{ willChange: 'transform' }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const KPIGrid = () => (
  <div className="grid gap-3 sm:gap-4 lg:gap-5 md:grid-cols-2 lg:grid-cols-3">
    {kpis.map((kpi) => (
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
);

const MaterialTable = () => (
  <div className="section-shell p-0 overflow-hidden">
    <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-border/60">
      <div>
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-1 sm:mb-2">Table</p>
        <h3 className="text-lg sm:text-xl font-semibold">Material Risk</h3>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground">Sorted by stockout</span>
    </div>
    <div className="overflow-x-auto -mx-3 sm:mx-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      <div className="inline-block min-w-full align-middle">
        <table className="w-full text-xs sm:text-sm min-w-[600px]">
          <thead className="text-left text-muted-foreground uppercase tracking-wider text-[10px] sm:text-xs bg-muted/30">
            <tr>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">Material</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap">Plant</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap">Stock (t)</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap">Days</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden sm:table-cell">Stockout</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden md:table-cell">Supplier</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">Country</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">Port</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden xl:table-cell">Customs</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden xl:table-cell">Heat</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden xl:table-cell">PO</th>
            </tr>
          </thead>
          <tbody>
            {materialRisk.map((row) => (
              <tr key={`${row.material}-${row.plant}`} className="border-t border-border/60 hover:bg-muted/30 transition-all duration-150">
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 font-semibold">{row.material}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">{row.plant}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">{row.stock}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">{row.coverage}d</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 hidden sm:table-cell">{row.stockout}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 hidden md:table-cell">{row.supplier}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 hidden lg:table-cell">{row.country}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 hidden lg:table-cell">{row.port}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 hidden xl:table-cell">{row.customs}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 hidden xl:table-cell">{row.heat}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 hidden xl:table-cell">{row.order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const ConsumptionPanel = () => {
  return (
    <div className="h-full">
      <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] transition-shadow duration-200 ease-out">
        <div className="h-1 w-full rounded-t-xl sm:rounded-t-2xl bg-gradient-to-r from-emerald-400/60 via-sky-400/40 to-transparent" />

        <div className="p-4 sm:p-5 lg:p-6 flex flex-col gap-3 sm:gap-4">
          <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400">
                Consumption
              </p>
              <h3 className="text-base sm:text-lg lg:text-[19px] font-semibold text-slate-900 leading-tight">
                Climate-adjusted burn vs forecast
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                Week-level demand signal with overlay for heat &amp; humidity impact.
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1 text-[10px] sm:text-[11px] text-slate-500 flex-shrink-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Actual burn
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Forecast
              </span>
            </div>
          </header>

          <div className="relative h-56 sm:h-64 md:h-72 lg:h-72">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-slate-50 via-slate-50/40 to-transparent pointer-events-none" />

            <div className="relative h-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={consumptionVsForecast}>
                  <defs>
                    <linearGradient id="tempAdjGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.24)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                    style={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                    style={{ fontSize: 12 }}
                  />

                  <Tooltip
                    cursor={{ stroke: "rgba(148,163,184,0.4)", strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid rgba(148,163,184,0.35)",
                      borderRadius: 12,
                      padding: 10,
                      boxShadow: "0 14px 35px rgba(15,23,42,0.16)",
                    }}
                    labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                  />

                  <Area
                    type="monotone"
                    dataKey="tempAdj"
                    stroke="none"
                    fill="url(#tempAdjGradient)"
                  />

                  <Line
                    type="monotone"
                    dataKey="consumption"
                    stroke="#22c55e"
                    strokeWidth={3}
                    strokeLinecap="round"
                    dot={{
                      r: 4,
                      strokeWidth: 1.5,
                      stroke: "#ffffff",
                      fill: "#22c55e",
                    }}
                    activeDot={{
                      r: 6,
                      style: {
                        filter: "drop-shadow(0 0 8px rgba(34,197,94,0.55))",
                      },
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                    dot={{
                      r: 4,
                      strokeWidth: 1.5,
                      stroke: "#ffffff",
                      fill: "#38bdf8",
                    }}
                    activeDot={{
                      r: 6,
                      style: {
                        filter: "drop-shadow(0 0 8px rgba(56,189,248,0.55))",
                      },
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-1 flex flex-wrap gap-2 md:hidden text-[10px] sm:text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-slate-50 px-2 sm:px-3 py-0.5 sm:py-1">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500" />
              Actual consumption
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-slate-50 px-2 sm:px-3 py-0.5 sm:py-1">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-sky-500" />
              Forecast
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SupplierPanel = () => (
  <div className="section-shell p-6 h-full">
    <div className="mb-5">
      <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-2">Suppliers</p>
      <h3 className="text-xl font-semibold">Delay probability by origin country</h3>
    </div>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={supplierPerformance} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="country" />
          <Tooltip />
          <Bar dataKey="delay" fill="hsl(var(--primary))" radius={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <ul className="mt-5 pt-3 border-t border-border/60 text-xs text-muted-foreground space-y-1">
      {supplierPerformance.map((entry) => (
        <li key={entry.country} className="flex items-center justify-between">
          <span className="truncate">{entry.country} via {entry.port}</span>
          <span className="ml-4 shrink-0">{entry.delay}%</span>
        </li>
      ))}
    </ul>
  </div>
);

const InventoryDistribution = () => (
  <div className="section-shell p-4 sm:p-5 lg:p-6">
    <div className="flex items-center justify-between mb-4 sm:mb-5">
      <div>
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-1 sm:mb-2">Inventory</p>
        <h3 className="text-lg sm:text-xl font-semibold">Health distribution</h3>
      </div>
    </div>
    <div className="space-y-3 sm:space-y-4">
      {coverageBuckets.map((bucket) => (
        <div key={bucket.label}>
          <div className="flex justify-between text-xs sm:text-sm">
            <span>{bucket.label}</span>
            <span>{bucket.value}%</span>
          </div>
          <div className="mt-1.5 sm:mt-2 h-1.5 sm:h-2 rounded-full bg-muted">
            <div className={`h-full rounded-full ${bucket.tone}`} style={{ width: `${bucket.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RawMaterials = () => (
  <div className="min-h-screen">
    <Navigation />
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-10">
      <header className="space-y-3 sm:space-y-4">
        <p className="pill w-fit text-[10px] sm:text-[11px] px-3 sm:px-4 py-1">Vision 2030 · Raw Materials</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">Raw Materials & Supplier Risk</h1>
            <p className="text-muted-foreground max-w-3xl text-sm sm:text-base lg:text-lg leading-relaxed">
              Monitor port congestion, customs delays, supplier origin risk, and consumption-adjusted coverage
              tuned for Saudi heat and national procurement strategy.
            </p>
          </div>
          <div className="text-left sm:text-right text-xs sm:text-sm text-muted-foreground space-y-1">
            <p>Region filters auto-sync</p>
          </div>
        </div>
      </header>

      <InventoryKPIDashboard />

      <FilterGroup />

      <div className="grid gap-4 sm:gap-5 lg:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 lg:space-y-6">
          <MaterialTable />
          <InventoryDistribution />
        </div>
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          <ConsumptionPanel />
          {/* <SupplierPanel /> */}
        </div>
      </div>

      <div className="mt-6 sm:mt-8 lg:mt-10">
        <TextSqlHelper
          title="Text-to-SQL · Raw Materials"
          examples={[
            "Show materials at risk due to customs delays in Dammam Port",
            "Which supplier country drives the highest delay probability?",
            "Forecast wheat coverage if Jeddah port slips by 4 days"
          ]}
        />
      </div>
    </div>
  </div>
);

export default RawMaterials;

