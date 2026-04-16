'use client'

import { Button, cn } from '@/components/ui-finova'

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border bg-card divide-x divide-border overflow-hidden rounded-[6px] ">
      
      {/* NOI */}
      <Button 
        type="button"
        variant="ghost"
        disabled={false}
        onClick={() => onDrillDown('NOI')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Net Operating Income</span>
           <span className="text-muted-foreground group-hover:text-mercury-green transition-colors font-bold">📈</span>
        </div>
        <div className={cn("text-[28px] font-display tracking-tight", metrics.noi >= 0 ? "text-mercury-green" : "text-rose-500")}>
           <span className="font-finance">${metrics.noi.toLocaleString()}</span>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium">Verified FY2026</p>
      </Button>

      {/* ADJUSTED NOI */}
      <Button 
        type="button"
        variant="ghost"
        disabled={false}
        onClick={() => onDrillDown('ADJ_NOI')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Adjusted NOI</span>
           <span className="text-muted-foreground group-hover:text-vibrant-blue transition-colors font-bold">[A]</span>
        </div>
        <div className="text-[28px] font-display text-foreground tracking-tight font-finance">
           <span className="font-finance">${metrics.adjustedNoi.toLocaleString()}</span>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium tracking-tight underline decoration-border/50">OPEX Adjusted Flow</p>
      </Button>

      {/* REVENUE LEAKAGE */}
      <Button 
        type="button"
        variant="ghost"
        disabled={false}
        onClick={() => onDrillDown('LEAKAGE')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Revenue Leakage</span>
           <span className="text-muted-foreground group-hover:text-rose-500 transition-colors font-bold">[!]</span>
        </div>
        <div className={cn("text-[28px] font-display tracking-tight", metrics.revenueLeakage > 10 ? "text-rose-500" : "text-foreground")}>
           <span className="font-finance">{metrics.revenueLeakage}%</span>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium">Market Contract Delta</p>
      </Button>

      {/* COLLECTION EFFICIENCY */}
      <Button 
        type="button"
        variant="ghost"
        disabled={false}
        onClick={() => onDrillDown('COLLECTION')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Collection Ratio</span>
           <span className="text-muted-foreground group-hover:text-mercury-green transition-colors font-bold">✓</span>
        </div>
        <div className={cn("text-[28px] font-display tracking-tight", metrics.collectionEfficiency >= 90 ? "text-mercury-green" : "text-amber-500")}>
           <span className="font-finance">{metrics.collectionEfficiency}%</span>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium">Current_Cycle_Inflow</p>
      </Button>

    </div>
  )
}
