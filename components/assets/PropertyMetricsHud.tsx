'use client'

import { TrendingUp, Activity, AlertCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border bg-card divide-x divide-border overflow-hidden rounded-xl shadow-sm">
      
      {/* NOI */}
      <button 
        onClick={() => onDrillDown('NOI')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Net Operating Income</span>
           <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-mercury-green transition-colors" />
        </div>
        <div className={cn("text-[28px] font-display tracking-tight", metrics.noi >= 0 ? "text-mercury-green" : "text-rose-500")}>
           <span className="font-finance">${metrics.noi.toLocaleString()}</span>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium">Verified FY2026</p>
      </button>

      {/* ADJUSTED NOI */}
      <button 
        onClick={() => onDrillDown('ADJ_NOI')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Adjusted NOI</span>
           <Activity className="w-4 h-4 text-muted-foreground group-hover:text-vibrant-blue transition-colors" />
        </div>
        <div className="text-[28px] font-display text-foreground tracking-tight font-finance">
           <span className="font-finance">${metrics.adjustedNoi.toLocaleString()}</span>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium tracking-tight underline decoration-border/50">OPEX Adjusted Flow</p>
      </button>

      {/* REVENUE LEAKAGE */}
      <button 
        onClick={() => onDrillDown('LEAKAGE')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Revenue Leakage</span>
           <AlertCircle className="w-4 h-4 text-muted-foreground group-hover:text-rose-500 transition-colors" />
        </div>
        <div className={cn("text-[28px] font-display tracking-tight", metrics.revenueLeakage > 10 ? "text-rose-500" : "text-foreground")}>
           <span className="font-finance">{metrics.revenueLeakage}%</span>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium">Market Contract Delta</p>
      </button>

      {/* COLLECTION EFFICIENCY */}
      <button 
        onClick={() => onDrillDown('COLLECTION')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Collection Ratio</span>
           <ShieldCheck className="w-4 h-4 text-muted-foreground group-hover:text-mercury-green transition-colors" />
        </div>
        <div className={cn("text-[28px] font-display tracking-tight", metrics.collectionEfficiency >= 90 ? "text-mercury-green" : "text-amber-500")}>
           <span className="font-finance">{metrics.collectionEfficiency}%</span>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium">Current_Cycle_Inflow</p>
      </button>

    </div>
  )
}
