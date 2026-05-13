'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Card } from '@/src/components/system/Card';
import { TrendingUp, TrendingDown, Target, BarChart3, ShieldCheck, Zap, Activity } from 'lucide-react';

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

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  onClick: () => void;
  isCurrency?: boolean;
  colorClass?: string;
  glowClass?: string;
}

function MetricCard({ title, value, icon: Icon, onClick, isCurrency, colorClass, glowClass }: MetricCardProps) {
  return (
    <Card 
      onClick={onClick}
      className="cursor-pointer group relative flex flex-col justify-between p-6 bg-muted/5 border border-border/40 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 rounded-2xl overflow-hidden shadow-none"
    >
      {/* Dynamic Interactive Glow */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-500",
        glowClass || "bg-brand/10"
      )} />

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
            {title}
          </span>
          <div className="p-1.5 rounded-lg bg-muted/10 text-muted-foreground/30 group-hover:text-brand/60 group-hover:bg-brand/10 transition-colors">
            <Icon size={14} />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className={cn(
            "text-3xl font-bold tracking-tight tabular-nums transition-colors duration-300",
            colorClass || "text-foreground"
          )}>
            {isCurrency ? formatCurrency(Number(value)) : value}
          </h2>
        </div>
      </div>
    </Card>
  );
}

export default function PropertyMetricsHud({ metrics, timeframe, onDrillDown }: PropertyMetricsHudProps) {
  const leakage = Number(metrics.revenueLeakage || 0);
  const collection = Number(metrics.collectionEfficiency || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      
      <MetricCard 
        title="Net Operating Income"
        value={metrics?.noi || 0}
        isCurrency
        icon={BarChart3}
        glowClass="bg-emerald-500/10"
        onClick={() => onDrillDown('NOI')}
      />

      <MetricCard 
        title="Gross Potential Rent"
        value={metrics?.grossPotential || 0}
        isCurrency
        icon={Zap}
        glowClass="bg-brand/10"
        onClick={() => onDrillDown('GROSS_POTENTIAL')}
      />

      <MetricCard 
        title="Revenue Leakage"
        value={`${leakage.toFixed(1)}%`}
        icon={Activity}
        colorClass={leakage > 10 ? "text-rose-500" : leakage > 5 ? "text-amber-500" : "text-foreground"}
        glowClass={leakage > 10 ? "bg-rose-500/10" : "bg-amber-500/10"}
        onClick={() => onDrillDown('LEAKAGE')}
      />

      <MetricCard 
        title="Collection Ratio"
        value={`${collection.toFixed(1)}%`}
        icon={ShieldCheck}
        colorClass={collection < 85 ? "text-rose-500" : collection < 95 ? "text-amber-500" : "text-foreground"}
        glowClass={collection < 95 ? "bg-amber-500/10" : "bg-emerald-500/10"}
        onClick={() => onDrillDown('COLLECTION')}
      />

    </div>
  );
}




