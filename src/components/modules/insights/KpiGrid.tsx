'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/src/components/finova/ui-finova';
import { Card } from '@/src/components/system/Card';

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
  telemetry: any; // Using any for now to handle potential nulls from server
  aggregation: string;
  setAggregation: (agg: any) => void;
  chartType: string;
  setChartType: (type: any) => void;
}

export function KpiGrid({
  activeTab,
  metrics,
  telemetry,
  aggregation,
  setAggregation,
  chartType,
  setChartType
}: KpiGridProps) {
  
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
    if (delta === 0 || delta === undefined) return null;
    const isPositive = delta > 0;
    const isGood = inverted ? !isPositive : isPositive;
    
    return (
      <span className={cn(
        "text-[11px] font-bold ml-2 px-1.5 py-0.5 rounded-[4px] flex items-center gap-1",
        isGood 
          ? "bg-positive/10 text-positive" 
          : "bg-negative/10 text-negative"
      )}>
        {isPositive ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="flex flex-col mb-10 transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {activeTab === 'overview' ? (
          <>
            <Card variant="glass" className="p-6 border-border/10 shadow-elevation">
              <div className="flex justify-between items-start mb-4">
                <span className="text-label uppercase tracking-widest text-foreground/40 font-bold">Net Cashflow</span>
                {telemetry && renderDelta(telemetry.deltas?.revenue - telemetry.deltas?.opex)}
              </div>
              <div className="text-display text-foreground font-finance">
                {renderMetric(metrics.net, true)}
              </div>
            </Card>

            <Card variant="glass" className="p-6 border-border/10 shadow-elevation">
              <div className="flex justify-between items-start mb-4">
                <span className="text-label uppercase tracking-widest text-foreground/40 font-bold">Gross Income</span>
                {telemetry && renderDelta(telemetry.deltas?.revenue)}
              </div>
              <div className="text-display text-positive font-finance">
                {renderMetric(metrics.income)}
              </div>
            </Card>

            <Card variant="glass" className="p-6 border-border/10 shadow-elevation">
              <div className="flex justify-between items-start mb-4">
                <span className="text-label uppercase tracking-widest text-foreground/40 font-bold">Total Expenses</span>
                {telemetry && renderDelta(telemetry.deltas?.opex, true)}
              </div>
              <div className="text-display text-negative font-finance">
                {renderMetric(-metrics.expense)}
              </div>
            </Card>

            <Card variant="glass" className="p-6 border-border/10 shadow-elevation">
              <div className="flex justify-between items-start mb-4">
                <span className="text-label uppercase tracking-widest text-foreground/40 font-bold">Yield Rate</span>
                {telemetry && <span className="text-brand font-bold text-[11px]">{telemetry.current?.yieldRate.toFixed(1)}%</span>}
              </div>
              <div className="text-display text-brand font-finance">
                {telemetry?.current?.yieldRate.toFixed(1)}%
              </div>
            </Card>
          </>
        ) : activeTab === 'money-in' ? (
          <>
            <Card variant="glass" className="p-6 border-border/10 shadow-elevation">
              <div className="flex justify-between items-start mb-4">
                <span className="text-label uppercase tracking-widest text-foreground/40 font-bold">Total Money In</span>
                {telemetry && renderDelta(telemetry.deltas?.revenue)}
              </div>
              <div className="text-display text-positive font-finance">
                {renderMetric(metrics.income)}
              </div>
            </Card>

            <Card variant="glass" className="p-6 border-border/10 shadow-elevation">
              <div className="flex justify-between items-start mb-4">
                <span className="text-label uppercase tracking-widest text-foreground/40 font-bold">Monthly Average</span>
              </div>
              <div className="text-display text-foreground font-finance">
                {renderMetric(metrics.avgIncome)}
              </div>
            </Card>
            <div className="xl:col-span-2"></div>
          </>
        ) : (
          <>
            <Card variant="glass" className="p-6 border-border/10 shadow-elevation">
              <div className="flex justify-between items-start mb-4">
                <span className="text-label uppercase tracking-widest text-foreground/40 font-bold">Total Money Out</span>
                {telemetry && renderDelta(telemetry.deltas?.opex, true)}
              </div>
              <div className="text-display text-negative font-finance">
                {renderMetric(-metrics.expense)}
              </div>
            </Card>

            <Card variant="glass" className="p-6 border-border/10 shadow-elevation">
              <div className="flex justify-between items-start mb-4">
                <span className="text-label uppercase tracking-widest text-foreground/40 font-bold">Monthly Average</span>
              </div>
              <div className="text-display text-foreground font-finance">
                {renderMetric(-metrics.avgExpense)}
              </div>
            </Card>
            <div className="xl:col-span-2"></div>
          </>
        )}
      </div>

      {/* CONTROLS */}
      <div className="flex items-center justify-end gap-3 mt-8">
          <div className="flex p-1 bg-white/5 border border-white/5 rounded-[var(--radius-sm)] h-8 items-center relative group">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {}} // Relying on group-hover for now but ensuring it's recognized as a button
              className="flex items-center gap-2 px-3 h-full rounded-[var(--radius-sm)] text-[11px] font-bold border-none bg-transparent uppercase tracking-wider text-clinical-muted"
             >
              {aggregation} <span className="text-[10px] opacity-70">▼</span>
            </Button>
            <div className="absolute top-full right-0 mt-1 w-32 bg-popover border border-white/10 rounded-[var(--radius-sm)] invisible group-hover:visible hover:visible z-50 overflow-hidden shadow-elevation">
              {['day', 'month', 'quarter'].map((agg) => (
                <div 
                  key={agg}
                  onClick={() => setAggregation(agg)}
                  className={cn("px-4 py-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-white/5 border-t border-white/5 first:border-t-0", aggregation === agg ? "text-white" : "text-clinical-muted")}
                >
                  {agg}
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
  );
}
