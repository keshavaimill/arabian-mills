import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  titleAr?: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  sparklineData?: number[];
  index: number;
  compact?: boolean;
}

const statusColors = {
  success: {
    icon: 'text-green-600',
    chip: 'bg-green-50 text-green-700',
    accent: 'from-green-500/10 to-green-500/0'
  },
  warning: {
    icon: 'text-amber-600',
    chip: 'bg-amber-50 text-amber-700',
    accent: 'from-amber-500/10 to-amber-500/0'
  },
  danger: {
    icon: 'text-red-600',
    chip: 'bg-red-50 text-red-700',
    accent: 'from-red-500/10 to-red-500/0'
  },
  neutral: {
    icon: 'text-foreground',
    chip: 'bg-muted text-muted-foreground',
    accent: 'from-foreground/10 to-foreground/0'
  }
};

export const KPICard = ({
  title,
  titleAr,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = 'neutral',
  sparklineData,
  index,
  compact = false
}: KPICardProps) => {
  const palette = statusColors[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        "rounded-2xl sm:rounded-[28px] border border-border/60 bg-white/80 shadow-card hover-lift",
        "transition-all duration-200 ease-out",
        "transform-gpu",
        compact ? "p-3 sm:p-4" : "p-4 sm:p-5 lg:p-6"
      )}
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 flex-wrap">
            <div className={`rounded-xl sm:rounded-2xl bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium ${palette.chip}`}>
              {titleAr ? 'ثنائي' : 'KPI'}
            </div>
            {trend && (
              <span className={cn(
                "rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold whitespace-nowrap",
                trend.isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          <h3 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground/80 mb-1 leading-tight">
            {title}
          </h3>
          {titleAr && (
            <p className="text-[10px] sm:text-xs text-muted-foreground/60 font-arabic">{titleAr}</p>
          )}
        </div>
        <div className="rounded-xl sm:rounded-2xl bg-muted/30 p-2 sm:p-3 transition-transform duration-200 hover:scale-110 flex-shrink-0" style={{ willChange: 'transform' }}>
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", palette.icon)} />
        </div>
      </div>

      <div className={cn("mt-4 sm:mt-5 lg:mt-6 flex items-end justify-between gap-2", compact && "mt-3 sm:mt-4")}>
        <div className="min-w-0 flex-1">
          <p className={cn(
            "font-semibold tracking-tight mb-1 break-words",
            compact ? "text-xl sm:text-2xl lg:text-3xl" : "text-2xl sm:text-3xl lg:text-4xl"
          )}>
            {value}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-snug">{subtitle}</p>
        </div>
        {sparklineData && !compact && (
          <div className="h-10 sm:h-12 lg:h-14 w-20 sm:w-24 lg:w-28 relative flex-shrink-0 hidden sm:block">
            <div className={cn("absolute inset-0 bg-gradient-to-b rounded-xl", palette.accent)} />
            <svg className="relative h-full w-full" preserveAspectRatio="none">
              <polyline
                points={sparklineData
                  .map((val, i) => {
                    const x = (i / (sparklineData.length - 1)) * 100;
                    const y = 100 - (val / Math.max(...sparklineData)) * 100;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className={palette.icon}
              />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};
