import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5 sm:p-3 lg:p-3.5">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5 sm:space-y-1">
          <p className="text-[10px] sm:text-xs lg:text-xs text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <h3 className="text-base sm:text-xl lg:text-xl font-semibold tracking-tight">{value}</h3>
            {trend && (
              <span className={cn(
                "inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground line-clamp-1">{subtitle}</p>
          )}
        </div>
        <div className="p-1.5 sm:p-2 rounded-md bg-muted text-muted-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
}