'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui-finova';

import { useFinancialMetrics } from '@/src/hooks/useWorkspaceData';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KpiGridProps {
  activeTab: 'overview' | 'money-in' | 'money-out';
  metrics: {
    income: number;
    expense: number;
    net: number;
    avgIncome: number;
    avgExpense: number;
  };
  aggregation: string;
  setAggregation: (agg: any) => void;
  chartType: string;
  setChartType: (type: any) => void;
}

export function KpiGrid({
  activeTab,
  metrics,
  aggregation,
  setAggregation,
  chartType,
  setChartType
}: KpiGridProps) {
  const { data: telemetry, isLoading } = useFinancialMetrics();

  const formatValue = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 1000000) return Math.round(absVal / 1000).toLocaleString('en-US') + 'K';
    return {
      full: absVal.toLocaleString('en-US', { minimumFractionDigits: 0 }),
      compact: Math.round(absVal / 1000).toLocaleString('en-US') + 'K'
    };
  };

  const renderMetric = (val: number, isNet: boolean = false) => {
    const formatted = formatValue(val);
    const prefix = isNet ? (val < 0 ? '−' : '') : (val < 0 ? '−' : '+');
    if (typeof formatted === 'string') return `${prefix}$${formatted}`;
    return (
      <>
        <span className="hidden xl:inline">{prefix}${formatted.full}</span>
        <span className="xl:hidden">{prefix}${formatted.compact}</span>
      </>
    );
  };

  const renderDelta = (delta: number, inverted: boolean = false) => {
    if (delta === 0) return null;
    const isPositive = delta > 0;
    const isGood = inverted ? !isPositive : isPositive;
    
    return (
      <span className={cn(
        "text-[12px] font-bold ml-3 px-2 py-0.5 rounded-[var(--radius-sm)] flex items-center gap-1 shadow-sm",
        isGood 
          ? "bg-mercury-green text-white" // High contrast green
          : "bg-destructive text-white"  // Solid red
      )}>
        {isPositive ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="flex flex-col mb-8 border-b border-border/50 pb-8 transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8 items-end min-h-[100px]">
        {activeTab === 'overview' ? (
          <>
            <div className="flex flex-col h-full justify-end border-r border-border/20 pr-8 last:border-none">
              <div className="flex items-center">
                <p className="text-mercury-body text-foreground mb-2 tracking-clinical border-b border-dotted border-white/20 pb-0.5 w-fit">Net cashflow</p>
                {telemetry && renderDelta(telemetry.deltas.revenue - telemetry.deltas.opex)}
              </div>
              <p className="text-mercury-headline text-white tracking-clinical truncate">
                {renderMetric(metrics.net, true)}
              </p>
            </div>

            <div className="flex flex-col h-full justify-end border-r border-border/20 pr-8 last:border-none">
              <div className="flex items-center">
                <p className="text-mercury-body text-foreground mb-[4px] tracking-clinical border-b border-dotted border-white/20 pb-0.5 w-fit">Money in</p>
                {telemetry && renderDelta(telemetry.deltas.revenue)}
              </div>
              <p className="text-mercury-heading text-white tracking-clinical truncate">
                {renderMetric(metrics.income)}
              </p>
            </div>

            <div className="flex flex-col h-full justify-end">
              <div className="flex items-center">
                <p className="text-mercury-body text-foreground mb-[4px] tracking-clinical border-b border-dotted border-white/20 pb-0.5 w-fit">Money out</p>
                {telemetry && renderDelta(telemetry.deltas.opex, true)}
              </div>
              <p className="text-mercury-heading text-white tracking-clinical truncate">
                {renderMetric(-metrics.expense)}
              </p>
            </div>
          </>
        ) : activeTab === 'money-in' ? (
          <>
            <div className="flex flex-col h-full justify-end border-r border-border/20 pr-8 last:border-none">
              <div className="flex items-center">
                <p className="text-mercury-body text-foreground mb-2 tracking-clinical border-b border-dotted border-white/20 pb-0.5 w-fit">Total money in</p>
                {telemetry && renderDelta(telemetry.deltas.revenue)}
              </div>
              <p className="text-mercury-headline text-white tracking-clinical truncate">
                {renderMetric(metrics.income)}
              </p>
            </div>

            <div className="flex flex-col h-full justify-end">
              <p className="text-mercury-body text-foreground mb-[4px] tracking-clinical border-b border-dotted border-white/20 pb-0.5 w-fit">Monthly average</p>
              <p className="text-mercury-heading text-white tracking-clinical truncate">
                {renderMetric(metrics.avgIncome)}
              </p>
            </div>
            <div className="md:col-span-1"></div>
          </>
        ) : (
          <>
            <div className="flex flex-col h-full justify-end border-r border-border/20 pr-8 last:border-none">
              <div className="flex items-center">
                <p className="text-mercury-body text-foreground mb-2 tracking-clinical border-b border-dotted border-white/20 pb-0.5 w-fit">Total money out</p>
                {telemetry && renderDelta(telemetry.deltas.opex, true)}
              </div>
              <p className="text-mercury-headline text-white tracking-clinical truncate">
                {renderMetric(-metrics.expense)}
              </p>
            </div>

            <div className="flex flex-col h-full justify-end">
              <p className="text-mercury-body text-foreground mb-[4px] tracking-clinical border-b border-dotted border-white/20 pb-0.5 w-fit">Monthly average</p>
              <p className="text-mercury-heading text-white tracking-clinical truncate">
                {renderMetric(-metrics.avgExpense)}
              </p>
            </div>
            <div className="md:col-span-1"></div>
          </>
        )}

        <div className="flex items-center justify-end gap-3 h-full pb-1">
          <div className="flex p-1 bg-white/5 border border-white/5 rounded-[var(--radius-sm)] h-8 items-center relative group">
            <Button 
              type="button" 
              variant="ghost" 
              className="flex items-center gap-2 px-3 h-full rounded-[var(--radius-sm)] text-mercury-body font-normal border-none bg-transparent"
             >
              {aggregation.charAt(0).toUpperCase() + aggregation.slice(1)} <span className="text-[10px] opacity-70">▼</span>
            </Button>
            <div className="absolute top-full left-0 mt-1 w-32 bg-popover border border-white/10 rounded-[var(--radius-sm)] invisible group-hover:visible z-50 overflow-hidden">
              {['day', 'month', 'quarter'].map((agg) => (
                <div 
                  key={agg}
                  onClick={() => setAggregation(agg)}
                  className={cn("px-4 py-2 text-mercury-body cursor-pointer hover:bg-white/5 border-t border-white/5 first:border-t-0", aggregation === agg ? "text-white" : "text-clinical-muted")}
                >
                  {agg.charAt(0).toUpperCase() + agg.slice(1)}
                </div>
              ))}
            </div>
          </div>
          <div className="flex p-1 bg-white/5 border border-white/5 rounded-[var(--radius-sm)] h-8 items-center transition-all">
             <Button 
              type="button" 
              variant="ghost"
              onClick={() => setChartType('area')} 
              className={cn("h-full px-2.5 transition-all rounded-[var(--radius-sm)] flex items-center justify-center p-0 border-none bg-transparent", chartType === 'area' ? "bg-muted text-white " : "text-clinical-muted hover:text-white")}
             >
               📈
             </Button>
             <Button 
              type="button" 
              variant="ghost"
              onClick={() => setChartType('bar')} 
              className={cn("h-full px-2.5 transition-all rounded-[var(--radius-sm)] flex items-center justify-center p-0 border-none bg-transparent", chartType === 'bar' ? "bg-muted text-white " : "text-clinical-muted hover:text-white")}
             >
               📊
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
