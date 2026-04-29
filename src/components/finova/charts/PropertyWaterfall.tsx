'use client'

import { Card } from '@/src/components/system/Card'


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
      <h3 className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.15em] mb-4 flex items-center gap-3">
        <span className="text-foreground/20 font-bold">[H]</span> Fiscal Node Materialization
      </h3>
      <Card className="bg-muted/10 border border-border p-10 h-[480px] flex flex-col justify-between relative overflow-hidden group rounded-[var(--radius-sm)] shadow-2xl backdrop-blur-sm">
        <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none group-hover:opacity-10 transition-opacity">
          <div className="w-96 h-96 rounded-full border border-brand/20" />
        </div>
        
        <div className="space-y-12 relative z-10 w-full">
          <div className="flex justify-between items-end border-b border-border pb-6">
            <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.15em]">Gross Revenue</span>
            <span className="text-mercury-green font-finance text-[18px] font-medium tracking-clinical">
              +${data.revenue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-end border-b border-border pb-6 pl-8">
            <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.15em]">OpEx</span>
            <span className="text-destructive/80 font-finance text-[18px] font-medium tracking-clinical">
              -${data.opex.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-end border-b border-border pb-6 pl-8">
            <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.15em]">CapEx</span>
            <span className="text-destructive/80 font-finance text-[18px] font-medium tracking-clinical">
              -${data.capex.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pt-12 border-t border-border relative z-10">
          <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.15em] mb-4">Net Cash Yield</p>
          <div className="text-display font-weight-display text-foreground font-finance text-4xl leading-none">
            ${data.netCash.toLocaleString()}
          </div>
          <p className="mt-3 text-[10px] font-bold text-foreground/20 uppercase tracking-[0.15em]">Verified Settlement Portfolio</p>
        </div>
      </Card>
    </div>
  );
}
