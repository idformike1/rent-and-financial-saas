'use client'

import { Card, RollingCounter, Badge, cn } from '@/components/ui-finova'
import { BarChart3, TrendingUp, ShieldCheck, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface DashboardClientGridProps {
  data: {
    current: { revenue: number, opex: number, debt: number, yieldRate: number },
    deltas: { revenue: number, opex: number, debt: number, yield: number }
  }
}

export default function DashboardClientGrid({ data }: DashboardClientGridProps) {
  const CARDS = [
    { 
       label: 'Gross Recognition', 
       val: data.current.revenue, 
       color: 'text-brand', 
       icn: BarChart3, 
       delta: data.deltas.revenue,
       subtitle: 'Total Org Revenue' 
    },
    { 
       label: 'Op. Net Income', 
       val: data.current.revenue - data.current.opex, 
       color: 'text-[var(--primary)]', 
       icn: TrendingUp, 
       delta: data.deltas.revenue - data.deltas.opex,
       subtitle: 'Revenue Adjusted for OPEX'
    },
    { 
       label: 'Delinquent Arrears', 
       val: data.current.debt, 
       color: 'text-rose-500', 
       icn: ShieldCheck, 
       delta: data.deltas.debt,
       subtitle: 'Total Portfolio Debt',
       inverse: true
    },
    { 
       label: 'Occupancy Yield', 
       val: data.current.yieldRate, 
       color: 'text-[var(--primary)]', 
       icn: PieChart, 
       delta: data.deltas.yield, 
       isPercent: true,
       subtitle: 'Capacity Saturation'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {CARDS.map((s) => (
        <Card key={s.label} variant="glass" className="p-8 rounded-3xl border border-border group hover:border-[var(--primary)]/30 hover:shadow-[0_0_30px_rgba(255,87,51,0.08)] transition-all duration-300 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <s.icn className="w-20 h-20 stroke-[1]" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black font-mono text-slate-300 uppercase tracking-widest leading-none mb-2">{s.label}</p>
                  <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">{s.subtitle}</p>
               </div>
               <Badge className={cn(
                 "font-mono text-[9px] border-none px-2 py-1 rounded-xl flex items-center gap-1",
                 s.inverse 
                  ? (s.delta > 0 ? "bg-rose-500/10 text-rose-500" : "bg-[var(--primary-muted)] text-[var(--primary)]")
                  : (s.delta >= 0 ? "bg-[var(--primary-muted)] text-[var(--primary)]" : "bg-rose-500/10 text-rose-500")
               )}>
                  {s.delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(s.delta).toFixed(1)}%
               </Badge>
            </div>

            <div className="mt-8">
              <h2 className={cn("text-4xl md:text-5xl font-black italic tracking-tighter leading-none font-mono", s.color)}>
                <RollingCounter value={s.val} prefix={s.isPercent ? "" : "$"} suffix={s.isPercent ? "%" : ""} />
              </h2>
              <div className={cn("mt-4 h-0.5 w-12 rounded-full opacity-60 transition-all duration-700 group-hover:w-full", s.color.replace('text-', 'bg-').replace('[var(--primary)]', '[var(--primary)]'))} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
