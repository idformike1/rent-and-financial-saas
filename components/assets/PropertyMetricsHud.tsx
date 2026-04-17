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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-white/5 bg-[#1E1E2A]/40 backdrop-blur-md divide-x divide-white/[0.04] overflow-hidden rounded-[var(--radius)] shadow-2xl">
      
      {/* NOI */}
      <Button 
        type="button"
        variant="ghost"
        onClick={() => onDrillDown('NOI')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">Net Operating Income</span>
           <TrendingUp size={14} className="text-white/20 group-hover:text-mercury-green transition-colors" />
        </div>
        <div className={cn("text-[32px] font-display tracking-tight text-white")}>
           <span className="font-finance">${metrics.noi.toLocaleString()}</span>
        </div>
        <p className="mt-3 text-[11px] text-white/20 font-medium tracking-tight">Verified for FY2026</p>
      </Button>

      {/* ADJUSTED NOI */}
      <Button 
        type="button"
        variant="ghost"
        onClick={() => onDrillDown('ADJ_NOI')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">Adjusted NOI</span>
           <Calculator size={14} className="text-white/20 group-hover:text-brand transition-colors" />
        </div>
        <div className="text-[32px] font-display text-white tracking-tight">
           <span className="font-finance">${metrics.adjustedNoi.toLocaleString()}</span>
        </div>
        <p className="mt-3 text-[11px] text-white/20 font-medium tracking-tight">OPEX Adjusted Flow</p>
      </Button>

      {/* REVENUE LEAKAGE */}
      <Button 
        type="button"
        variant="ghost"
        onClick={() => onDrillDown('LEAKAGE')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">Revenue Leakage</span>
           <AlertCircle size={14} className="text-white/20 group-hover:text-amber-500 transition-colors" />
        </div>
        <div className={cn(
          "text-[32px] font-display tracking-tight", 
          metrics.revenueLeakage > 15 ? "text-rose-500/80" : 
          metrics.revenueLeakage > 8 ? "text-amber-500/80" : "text-white"
        )}>
           <span className="font-finance">{metrics.revenueLeakage}%</span>
        </div>
        <p className="mt-3 text-[11px] text-white/20 font-medium tracking-tight">Market Contract Delta</p>
      </Button>

      {/* COLLECTION EFFICIENCY */}
      <Button 
        type="button"
        variant="ghost"
        onClick={() => onDrillDown('COLLECTION')}
        className="p-8 text-left hover:bg-white/[0.02] transition-all group h-auto border-none flex flex-col items-stretch rounded-none"
      >
        <div className="flex justify-between items-start mb-4">
           <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">Collection Ratio</span>
           <CheckCircle2 size={14} className="text-white/20 group-hover:text-mercury-green transition-colors" />
        </div>
        <div className={cn(
          "text-[32px] font-display tracking-tight", 
          metrics.collectionEfficiency >= 95 ? "text-mercury-green/80" : 
          metrics.collectionEfficiency >= 85 ? "text-amber-500/80" : "text-rose-500/80"
        )}>
           <span className="font-finance">{metrics.collectionEfficiency}%</span>
        </div>
        <p className="mt-3 text-[11px] text-white/20 font-medium tracking-tight">Current Cycle Inflow</p>
      </Button>

    </div>
  )
}
