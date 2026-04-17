import React from 'react';
import { cn } from '@/lib/utils';

interface MetricTileProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricTile({
  label,
  value,
  trend,
  trendDirection = 'neutral',
  className,
}: MetricTileProps) {
  return (
    <div className={cn("border bg-card p-5 rounded-[6px] flex flex-col gap-2", className)}>
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
        {label}
      </span>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold text-zinc-100 tabular-nums tracking-tight">
          {value}
        </span>
        {trend && (
          <span className={cn(
            "text-[10px] font-bold tabular-nums",
            trendDirection === 'up' ? "text-mercury-green" : 
            trendDirection === 'down' ? "text-red-500" : "text-zinc-500"
          )}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
