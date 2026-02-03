import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Target, TrendingUp, Award } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';

const statPalette = {
  danger: {
    icon: 'text-red-500',
    track: 'bg-red-500/10'
  },
  success: {
    icon: 'text-green-600',
    track: 'bg-green-500/10'
  },
  primary: {
    icon: 'text-primary',
    track: 'bg-primary/10'
  },
  warning: {
    icon: 'text-yellow-500',
    track: 'bg-yellow-500/10'
  }
};

interface Stat {
  label: string;
  value: string | number;
  sublabel: string;
  icon: ReactNode;
  color: keyof typeof statPalette;
  progress: number;
}

export const StatsBar = () => {
  const { isArabic, localized } = useLocale();

  const stats: Stat[] = [
    {
      label: localized('Critical alerts', 'تنبيهات حرجة'),
      value: localized('3', '٣'),
      sublabel: localized('Active risks', 'المخاطر النشطة'),
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'danger',
      progress: 60
    },
    {
      label: localized('Forecast accuracy', 'دقة التوقعات'),
      value: '94.2%',
      sublabel: localized('Ramadan period', 'فترة رمضان'),
      icon: <Target className="w-5 h-5" />,
      color: 'success',
      progress: 94
    },
    {
      label: localized('Cost saved', 'التكاليف الموفرة'),
      value: 'SAR 2.4M',
      sublabel: localized('This quarter', 'هذا الربع'),
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'primary',
      progress: 72
    },
    {
      label: localized('Efficiency gain', 'تحسن الكفاءة'),
      value: '+28%',
      sublabel: localized('Vision 2030 score', 'مؤشر رؤية ٢٠٣٠'),
      icon: <Award className="w-5 h-5" />,
      color: 'success',
      progress: 80
    }
  ];

  return (
    <div className="section-shell p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-5 lg:mb-6">
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-1 sm:mb-2">
            {localized('Pulse', 'مؤشرات')}
          </p>
          <h2 className="text-lg sm:text-xl font-semibold">
            {localized("Today's watch-floor", 'متابعة اليوم')}
          </h2>
        </div>
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          {localized('Live telemetry', 'قياسات مباشرة')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {stats.map((stat, index) => {
          const palette = statPalette[stat.color];
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl sm:rounded-3xl border border-border/70 bg-white/70 p-4 sm:p-5 hover-lift transition-all duration-200"
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                <div className="rounded-full border border-border/70 px-2 sm:px-3 py-0.5 sm:py-1 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-[11px]">
                  {stat.label}
                </div>
                <div className={`rounded-full bg-muted/50 p-1.5 sm:p-2 ${palette.icon}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-semibold">{stat.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{stat.sublabel}</p>
              <div className="h-1 rounded-full bg-muted">
                <div className={`h-full rounded-full ${palette.track}`} style={{ width: `${stat.progress}%` }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
