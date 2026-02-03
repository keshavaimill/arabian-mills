import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  type: 'critical' | 'warning' | 'opportunity';
  title: string;
  details: string;
  location: string;
  recommendation: string;
  actions: { label: string; variant?: 'default' | 'outline' }[];
  index: number;
}

const tone = {
  critical: {
    icon: AlertTriangle,
    chip: 'bg-red-50 text-red-700',
    ring: 'border border-red-200',
    glow: 'shadow-[0_10px_30px_rgba(244,63,94,0.15)]'
  },
  warning: {
    icon: AlertCircle,
    chip: 'bg-amber-50 text-amber-700',
    ring: 'border border-amber-200',
    glow: 'shadow-[0_10px_30px_rgba(251,191,36,0.15)]'
  },
  opportunity: {
    icon: TrendingUp,
    chip: 'bg-green-50 text-green-700',
    ring: 'border border-green-200',
    glow: 'shadow-[0_10px_30px_rgba(34,197,94,0.15)]'
  }
};

export const AlertCard = ({
  type,
  title,
  details,
  location,
  recommendation,
  actions,
  index
}: AlertCardProps) => {
  const palette = tone[type];
  const Icon = palette.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        "rounded-2xl sm:rounded-[28px] border border-border/70 bg-white/80 px-4 sm:px-5 lg:px-6 py-4 sm:py-5 lg:py-6",
        "flex flex-col gap-3 sm:gap-4 lg:gap-5",
        "transition-all duration-200 ease-out hover-lift",
        "transform-gpu",
        palette.glow
      )}
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className={cn("inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2 sm:mb-3", palette.chip)}>
            {type}
          </div>
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-1 sm:mb-2 leading-tight">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{location}</p>
        </div>
        <span className={cn("rounded-xl sm:rounded-2xl p-2 sm:p-3 transition-transform duration-200 hover:scale-110 flex-shrink-0", palette.chip, palette.ring)} style={{ willChange: 'transform' }}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      </div>

      <p className="text-xs sm:text-sm text-foreground leading-relaxed">{details}</p>

      <div className="surface-muted p-3 sm:p-4 rounded-xl sm:rounded-2xl flex gap-2 sm:gap-3">
        <span className="text-base sm:text-lg flex-shrink-0">💡</span>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-1">AI recommendation</p>
          <p className="text-xs sm:text-sm text-foreground leading-snug">{recommendation}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3 pt-1">
        {actions.map((action, i) => (
          <Button
            key={`${action.label}-${i}`}
            variant={action.variant || 'default'}
            size="sm"
            className={cn(
              "rounded-full px-3 sm:px-4 lg:px-5 text-xs sm:text-sm h-8 sm:h-9",
              "transition-transform duration-150 ease-out",
              "transform-gpu",
              action.variant === 'outline'
                ? "border-border/70 text-foreground hover:bg-muted/40"
                : "bg-foreground text-white hover:bg-foreground/90"
            )}
            style={{ willChange: 'transform' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02) translateZ(0)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateZ(0)';
            }}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
