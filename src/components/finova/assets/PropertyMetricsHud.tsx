'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Card } from '@/src/components/system/Card';
import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';

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


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      
      {/* NOI */}
      <Card 
        onClick={() => onDrillDown('NOI')}
        className="cursor-pointer group flex flex-col gap-4 p-6 hover:border-brand/40 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Net Operating Income
          </span>
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {formatCurrency(Number(metrics?.noi || 0))}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
              <TrendingUp className="w-3 h-3" /> +2.4%
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-medium">vs previous period</span>
          </div>
        </div>
      </Card>

      {/* GROSS POTENTIAL */}
      <Card 
        onClick={() => onDrillDown('GROSS_POTENTIAL')}
        className="cursor-pointer group flex flex-col gap-4 p-6 hover:border-brand/40 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Gross Potential Rent
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {formatCurrency(Number(metrics?.grossPotential || 0))}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-brand font-bold">Est. Cap: 5.2%</span>
            <span className="text-[10px] text-muted-foreground/40 font-medium ml-auto">market benchmark</span>
          </div>
        </div>
      </Card>

      {/* REVENUE LEAKAGE */}
      <Card 
        onClick={() => onDrillDown('LEAKAGE')}
        className="cursor-pointer group flex flex-col gap-4 p-6 hover:border-brand/40 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Revenue Leakage
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
             <span className={cn(
               "text-3xl font-bold tabular-nums",
               metrics.revenueLeakage > 10 ? "text-rose-500" : metrics.revenueLeakage > 5 ? "text-amber-500" : "text-foreground"
             )}>
               {Number(metrics.revenueLeakage || 0).toFixed(1)}%
             </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "flex items-center gap-1 text-[10px] font-bold",
              metrics.revenueLeakage > 10 ? "text-rose-500" : "text-amber-500"
            )}>
              <TrendingDown className="w-3 h-3" /> vs last period
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-medium ml-auto">improvement trend</span>
          </div>
        </div>
      </Card>

      {/* COLLECTION RATIO */}
      <Card 
        onClick={() => onDrillDown('COLLECTION')}
        className="cursor-pointer group flex flex-col gap-4 p-6 hover:border-brand/40 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Collection Ratio
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
             <span className={cn(
               "text-3xl font-bold tabular-nums",
               metrics.collectionEfficiency < 90 ? "text-rose-500" : metrics.collectionEfficiency < 95 ? "text-amber-500" : "text-foreground"
             )}>
               {Number(metrics.collectionEfficiency || 0).toFixed(1)}%
             </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
              <Target className="w-3 h-3" /> Target
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-medium ml-auto">action required</span>
          </div>
        </div>
      </Card>

    </div>
  );
}

