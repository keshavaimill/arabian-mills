import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Package, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/use-locale';

interface ImpactConfig {
  label: { en: string; ar: string };
  value: string;
  percentage: number;
  icon: ReactNode;
  tone: string;
}

export const ImpactDashboard = () => {
  const { localized } = useLocale();

  const impactConfigs: ImpactConfig[] = [
    {
      label: { en: 'Stockout costs avoided', ar: 'تكاليف النفاد المتجنبة' },
      value: 'SAR 980K',
      percentage: 90,
      icon: <ShieldCheck className="w-4 h-4" />,
      tone: 'from-green-500/40 via-green-500/10 to-transparent'
    },
    {
      label: { en: 'Lost sales prevention', ar: 'منع المبيعات المفقودة' },
      value: 'SAR 720K',
      percentage: 70,
      icon: <TrendingUp className="w-4 h-4" />,
      tone: 'from-primary/40 via-primary/10 to-transparent'
    },
    {
      label: { en: 'Emergency freight reduction', ar: 'خفض الشحن الطارئ' },
      value: 'SAR 450K',
      percentage: 50,
      icon: <Package className="w-4 h-4" />,
      tone: 'from-yellow-500/40 via-yellow-500/10 to-transparent'
    },
    {
      label: { en: 'Write-off reduction (SFDA)', ar: 'تقليل الإتلاف (هيئة الغذاء والدواء)' },
      value: 'SAR 250K',
      percentage: 30,
      icon: <DollarSign className="w-4 h-4" />,
      tone: 'from-blue-500/40 via-blue-500/10 to-transparent'
    }
  ];

  const impacts = impactConfigs.map((impact) => ({
    ...impact,
    label: localized(impact.label.en, impact.label.ar)
  }));

  return (
    <div className="section-shell p-4 sm:p-5 lg:p-6 h-full flex flex-col gap-4 sm:gap-5 lg:gap-6">
      <div>
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-1 sm:mb-2">
          {localized('Impact', 'الأثر')}
        </p>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">
          {localized('Savings summary', 'ملخص التوفير')}
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-gradient-to-br from-white to-white/60 px-4 sm:px-5 lg:px-6 py-6 sm:py-7 lg:py-8 text-center shadow-card"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%)]" />
        <div className="relative z-10 space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {localized('Quarter-to-date', 'منذ بداية الربع')}
          </p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">SAR 2.4M</p>
          <p className="text-xs sm:text-sm text-green-600">
            {localized('+28% vs last quarter', '+٢٨٪ مقارنة بالربع السابق')}
          </p>
        </div>
      </motion.div>

      <div className="space-y-3 sm:space-y-4">
        {impacts.map((impact, index) => (
          <motion.div
            key={impact.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl sm:rounded-3xl border border-border/70 bg-white/80 p-3 sm:p-4 transition-all duration-200 hover-lift"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className="rounded-full border border-border/60 p-1.5 sm:p-2 text-muted-foreground transition-transform duration-200 hover:scale-110 flex-shrink-0" style={{ willChange: 'transform' }}>
                  {impact.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium mb-0.5 truncate">{impact.label}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{impact.value}</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-semibold flex-shrink-0">{impact.percentage}%</span>
            </div>
            <div className="h-1.5 sm:h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${impact.percentage}%` }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.6 }}
                className={cn("h-full rounded-full bg-gradient-to-r", impact.tone)}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-[10px] sm:text-xs text-muted-foreground">
        <span className="leading-relaxed">{localized('Automations covering ports, plants & SFDA audits', 'أتمتة تغطي الموانئ والمصانع وتدقيق هيئة الغذاء والدواء')}</span>
        {/* <span className="text-saudi-green">🇸🇦 {localized('Vision 2030 aligned', 'متوافق مع رؤية ٢٠٣٠')}</span> */}
      </div>
    </div>
  );
};
