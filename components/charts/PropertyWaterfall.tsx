'use client'

import { Card } from '@/components/ui-finova'
import { History } from 'lucide-react'

interface WaterfallData {
  revenue: number
  opex: number
  capex: number
  netCash: number
}

interface PropertyWaterfallProps {
  data: WaterfallData
}

export default function PropertyWaterfall({ data }: PropertyWaterfallProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-[12px] text-muted-foreground font-bold uppercase tracking-widest mb-4 flex items-center gap-3">
        <History className="w-4 h-4" /> Fiscal Materialization
      </h3>
      <Card className="bg-card border-border p-10 h-[480px] flex flex-col justify-between relative overflow-hidden group rounded-2xl">
        <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none group-hover:opacity-10 transition-opacity">
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="rotate-90">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-vibrant-blue" />
          </svg>
        </div>
        
        <div className="space-y-12 relative z-10 w-full">
          <div className="flex justify-between items-end border-b border-white/[0.04] pb-6">
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Gross Revenue</span>
            <span className="text-mercury-green font-finance text-[17px] font-medium">
              +${data.revenue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-end border-b border-white/[0.04] pb-6 pl-8">
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">OpEx</span>
            <span className="text-rose-500/80 font-finance text-[17px] font-medium">
              -${data.opex.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-end border-b border-white/[0.04] pb-6 pl-8">
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">CapEx</span>
            <span className="text-rose-500/80 font-finance text-[17px] font-medium">
              -${data.capex.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pt-12 border-t border-vibrant-blue/20 relative z-10">
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-3">Net Cash Yield</p>
          <div className="text-[32px] font-display text-foreground font-finance drop-shadow-sm">
            ${data.netCash.toLocaleString()}
          </div>
        </div>
      </Card>
    </div>
  )
}
