import { useState } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceArea
} from 'recharts';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/use-locale';
import { chartTheme, chartColors } from '@/lib/chart-theme';

export const SeasonalityChart = () => {
  const [view, setView] = useState<'historical' | 'forecast' | 'both'>('both');
  const { localized } = useLocale();

  const data = [
    { month: 'Jan', demand: 85, forecast: 87, event: null },
    { month: 'Feb', demand: 88, forecast: 90, event: null },
    { month: 'Mar', demand: 92, forecast: 95, event: 'Ramadan' },
    { month: 'Apr', demand: 125, forecast: 128, event: 'Ramadan' },
    { month: 'May', demand: 110, forecast: 108, event: 'Eid Al-Fitr' },
    { month: 'Jun', demand: 95, forecast: 93, event: null },
    { month: 'Jul', demand: 105, forecast: 107, event: 'Hajj' },
    { month: 'Aug', demand: 98, forecast: 100, event: null },
    { month: 'Sep', demand: 90, forecast: 92, event: 'Back to School' },
    { month: 'Oct', demand: 87, forecast: 88, event: null },
    { month: 'Nov', demand: 85, forecast: 86, event: null },
    { month: 'Dec', demand: 88, forecast: 90, event: null }
  ];

  const eventColors: Record<string, string> = {
    Ramadan: '#9333ea',
    'Eid Al-Fitr': '#059669',
    'Eid Al-Adha': '#fb923c',
    Hajj: '#eab308',
    'Back to School': '#3b82f6'
  };

  const eventBands = [
    { start: 'Mar', end: 'Apr', label: 'Ramadan', color: 'rgba(147,51,234,0.08)' },
    { start: 'May', end: 'May', label: 'Eid Al-Fitr', color: 'rgba(5,150,105,0.08)' },
    { start: 'Jul', end: 'Jul', label: 'Hajj', color: 'rgba(234,179,8,0.08)' },
    { start: 'Aug', end: 'Sep', label: 'Back to School', color: 'rgba(59,130,246,0.08)' },
    { start: 'Jun', end: 'Aug', label: 'Heat & Humidity', color: 'rgba(15,118,110,0.04)' }
  ];

  return (
    <div className={cn(chartTheme.card, "p-4 sm:p-5 lg:p-6 h-full space-y-4 sm:space-y-5 lg:space-y-6")}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground">
            {localized('Demand', 'الطلب')}
          </p>
          <h2 className="text-lg sm:text-xl lg:text-[22px] font-semibold text-slate-900 leading-tight">
            {localized('Seasonality intelligence', 'ذكاء الموسمية')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {localized(
              'Cultural cadence overlayed with forecast confidence',
              'التقلبات الموسمية الثقافية مع ثقة التوقعات'
            )}
          </p>
        </div>
        <div className="flex gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-slate-50/80 p-0.5 sm:p-1">
          {['historical', 'forecast', 'both'].map((option) => (
            <button
              key={option}
              onClick={() => setView(option as typeof view)}
              className={cn(
                "rounded-full px-2.5 sm:px-3 lg:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs lg:text-sm capitalize",
                "transition-all duration-200 ease-out transform-gpu",
                "hover:scale-105 active:scale-95",
                view === option ? "bg-slate-900 text-white shadow-sm" : "text-slate-500"
              )}
              style={{ willChange: 'transform' }}
            >
              {localized(
                option === 'historical' ? 'Historical' : option === 'forecast' ? 'Forecasted' : 'Both',
                option === 'historical' ? 'بيانات تاريخية' : option === 'forecast' ? 'متوقعة' : 'كلاهما'
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={cn(chartTheme.chartArea, "h-[280px] sm:h-[320px] lg:h-[360px] px-2 sm:px-3 py-3 sm:py-4")}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.orange} stopOpacity={0.18} />
                <stop offset="95%" stopColor={chartColors.orange} stopOpacity={0} />
              </linearGradient>
            </defs>
            {eventBands.map((band) => (
              <ReferenceArea
                key={band.label}
                x1={band.start}
                x2={band.end}
                strokeOpacity={0}
                fill={band.color}
              />
            ))}
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
            <XAxis
              dataKey="month"
              stroke={chartTheme.labelColor}
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={chartTheme.labelColor}
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Demand Index',
                angle: -90,
                position: 'insideLeft',
                fill: chartTheme.labelColor,
                style: { fontSize: 11 }
              }}
            />
            <Tooltip
              cursor={{ stroke: chartTheme.gridColor, strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(148,163,184,0.35)',
                borderRadius: 12,
                padding: 12,
                boxShadow: '0 10px 30px rgba(15,23,42,0.08)'
              }}
              labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            />

            {(view === 'historical' || view === 'both') && (
              <>
                <Area type="monotone" dataKey="demand" fill="url(#demandGradient)" stroke="none" />
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke={chartColors.orange}
                  strokeWidth={3}
                  strokeLinecap="round"
                  dot={{
                    r: 4,
                    strokeWidth: 1.5,
                    stroke: '#ffffff',
                    fill: chartColors.orange
                  }}
                  activeDot={{
                    r: 6,
                    style: { filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.45))' }
                  }}
                />
              </>
            )}

            {(view === 'forecast' || view === 'both') && (
              <Line
                type="monotone"
                dataKey="forecast"
                stroke={chartColors.green}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="6 4"
                dot={{
                  r: 4,
                  strokeWidth: 1.5,
                  stroke: '#ffffff',
                  fill: chartColors.green
                }}
                activeDot={{
                  r: 6,
                  style: { filter: 'drop-shadow(0 0 8px rgba(22,163,74,0.45))' }
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Line legend */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {[
          {
            key: 'demand',
            label: localized('Historical demand', 'الطلب التاريخي'),
            color: chartColors.orange
          },
          {
            key: 'forecast',
            label: localized('Forecasted demand', 'الطلب المتوقع'),
            color: chartColors.green
          }
        ]
          .filter(
            (item) =>
              view === 'both' ||
              (item.key === 'demand' && view === 'historical') ||
              (item.key === 'forecast' && view === 'forecast')
          )
          .map((item) => (
            <div
              key={item.key}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-black/5 bg-slate-50 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-slate-600"
            >
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
      </div>

      {/* Event Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {Object.entries(eventColors).map(([event, color]) => (
          <div key={event} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-black/5 flex-shrink-0"
              style={{ backgroundColor: color, opacity: 0.7 }}
            />
            <span className="truncate">
              {localized(
                event,
                event === 'Ramadan'
                  ? 'رمضان'
                  : event === 'Eid Al-Fitr'
                  ? 'عيد الفطر'
                  : event === 'Eid Al-Adha'
                  ? 'عيد الأضحى'
                  : event === 'Hajj'
                  ? 'الحج'
                  : 'العودة للمدارس'
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
