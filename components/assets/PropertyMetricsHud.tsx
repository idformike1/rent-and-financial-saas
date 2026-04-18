'use client'

import { Button, cn } from '@/components/ui-finova'
import { TrendingUp, Calculator, AlertCircle, CheckCircle2 } from 'lucide-react'

interface HudMetrics {
  noi: number
  adjustedNoi: number
  revenueLeakage: number
  collectionEfficiency: number
}

interface PropertyMetricsHudProps {
  metrics: HudMetrics
  onDrillDown: (type: string) => void
}

export default function PropertyMetricsHud({ metrics, onDrillDown }: PropertyMetricsHudProps) {
  return (
    <div className="bg-muted/10 border border-border divide-x divide-border overflow-hidden rounded-[var(--radius)] shadow-2xl backdrop-blur-md">
      
      {/* NOI */}
      <Button 
        type="button"
        variant="ghost"
        onClick={() => onDrillDown('NOI')}
        className="p-8 text-left hover:bg-muted/50 transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.15em] leading-none">Net Operating Income</span>
           <TrendingUp size={14} className="text-foreground/20 group-hover:text-mercury-green transition-colors" />
        </div>
        <div className={cn("text-[32px] font-display font-weight-display tracking-tight text-foreground")}>
           <span className="font-finance">${metrics.noi.toLocaleString()}</span>
        </div>
        <p className="mt-3 text-[10px] font-bold text-foreground/20 uppercase tracking-[0.15em]">Verified for FY2026</p>
      </Button>

      {/* ADJUSTED NOI */}
      <Button 
        type="button"
        variant="ghost"
        onClick={() => onDrillDown('ADJ_NOI')}
        className="p-8 text-left hover:bg-muted/50 transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.15em] leading-none">Adjusted NOI</span>
           <Calculator size={14} className="text-foreground/20 group-hover:text-brand transition-colors" />
        </div>
        <div className="text-[32px] font-display font-weight-display text-foreground tracking-tight">
           <span className="font-finance">${metrics.adjustedNoi.toLocaleString()}</span>
        </div>
        <p className="mt-3 text-[10px] font-bold text-foreground/20 uppercase tracking-[0.15em]">OPEX Adjusted Flow</p>
      </Button>

      {/* REVENUE LEAKAGE */}
      <Button 
        type="button"
        variant="ghost"
        onClick={() => onDrillDown('LEAKAGE')}
        className="p-8 text-left hover:bg-muted/50 transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.15em] leading-none">Revenue Leakage</span>
           <AlertCircle size={14} className="text-foreground/20 group-hover:text-amber-500 transition-colors" />
        </div>
        <div className={cn(
          "text-[32px] font-display font-weight-display tracking-tight", 
          metrics.revenueLeakage > 15 ? "text-destructive/80" : 
          metrics.revenueLeakage > 8 ? "text-amber-500/80" : "text-foreground"
        )}>
           <span className="font-finance">{metrics.revenueLeakage}%</span>
        </div>
        <p className="mt-3 text-[10px] font-bold text-foreground/20 uppercase tracking-[0.15em]">Market Contract Delta</p>
      </Button>

      {/* COLLECTION EFFICIENCY */}
      <Button 
        type="button"
        variant="ghost"
        onClick={() => onDrillDown('COLLECTION')}
        className="p-8 text-left hover:bg-muted/50 transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.15em] leading-none">Collection Ratio</span>
           <CheckCircle2 size={14} className="text-foreground/20 group-hover:text-mercury-green transition-colors" />
        </div>
        <div className={cn(
          "text-[32px] font-display font-weight-display tracking-tight", 
          metrics.collectionEfficiency >= 95 ? "text-mercury-green/80" : 
          metrics.collectionEfficiency >= 85 ? "text-amber-500/80" : "text-destructive/80"
        )}>
           <span className="font-finance">{metrics.collectionEfficiency}%</span>
        </div>
        <p className="mt-3 text-[10px] font-bold text-foreground/20 uppercase tracking-[0.15em]">Current Cycle Inflow</p>
      </Button>

    </div>
  )
}
