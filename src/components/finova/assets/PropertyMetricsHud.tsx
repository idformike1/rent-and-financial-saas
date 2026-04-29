'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from '@/src/components/finova/ui-finova';

interface PropertyMetricsHudProps {
  metrics: {
    noi: number;
    grossPotential: number;
    revenueLeakage: number;
    collectionEfficiency: number;
  };
  timeframe: 'MONTHLY' | 'YEARLY' | 'ALL_TIME';
  onDrillDown: (type: string) => void;
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val);

export default function PropertyMetricsHud({ metrics, timeframe, onDrillDown }: PropertyMetricsHudProps) {
  const multiplier = timeframe === 'YEARLY' ? 12 : 1;

  return (
    <div className="flex items-end justify-between w-full gap-12 py-4">
      
      {/* TIER 1: CORE FINANCIALS (Left, Dominant) */}
      <div className="flex items-end gap-12">
        {/* NOI */}
        <div 
          onClick={() => onDrillDown('NOI')}
          className="cursor-pointer group flex flex-col gap-2"
        >
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
            Net Operating Income
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-foreground">
              {formatCurrency(Number(metrics?.noi || 0) * multiplier)}
            </span>
            <span className="text-xs font-bold text-emerald-500 mb-1">↑ 2.4%</span>
          </div>
        </div>

        {/* GROSS POTENTIAL */}
        <div 
          onClick={() => onDrillDown('GROSS_POTENTIAL')}
          className="cursor-pointer group flex flex-col gap-2"
        >
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
            Gross Potential Rent
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-foreground">
              {formatCurrency(Number(metrics?.grossPotential || 0) * multiplier)}
            </span>
            <span className="text-xs font-bold text-muted-foreground/40 mb-1">Est. Cap: 5.2%</span>
          </div>
        </div>
      </div>

      {/* TIER 2: RISK / EFFICIENCY (Right, Compressed) */}
      <div className="flex items-end gap-10 border-l border-border pl-10">
        {/* REVENUE LEAKAGE */}
        <div 
          onClick={() => onDrillDown('LEAKAGE')}
          className="cursor-pointer group flex flex-col gap-1.5"
        >
          <div className="flex items-center justify-between min-w-[120px]">
             <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Revenue Leakage</span>
          </div>
          <div className="flex items-baseline gap-2">
             <span className={cn(
               "text-xl font-bold tabular-nums",
               metrics.revenueLeakage > 10 ? "text-rose-500" : metrics.revenueLeakage > 5 ? "text-amber-500" : "text-foreground"
             )}>
               {Number(metrics.revenueLeakage || 0).toFixed(1)}%
             </span>
             <span className="text-[10px] text-muted-foreground/40 font-medium">↓ vs last period</span>
          </div>
        </div>

        {/* COLLECTION RATIO */}
        <div 
          onClick={() => onDrillDown('COLLECTION')}
          className="cursor-pointer group flex flex-col gap-1.5"
        >
          <div className="flex items-center justify-between min-w-[120px]">
             <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Collection Ratio</span>
          </div>
          <div className="flex items-baseline gap-2">
             <span className={cn(
               "text-xl font-bold tabular-nums",
               metrics.collectionEfficiency < 90 ? "text-rose-500" : metrics.collectionEfficiency < 95 ? "text-amber-500" : "text-foreground"
             )}>
               {Number(metrics.collectionEfficiency || 0).toFixed(1)}%
             </span>
             <span className="text-[10px] text-emerald-500/60 font-medium">↑ Target</span>
          </div>
        </div>
      </div>

    </div>
  );
}
