'use client'

import { Card, Badge, cn } from '@/components/ui-finova'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

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
       delta: data.deltas.revenue,
       subtitle: 'Total Org Revenue' 
    },
    { 
       label: 'Op. Net Income', 
       val: data.current.revenue - data.current.opex, 
       delta: data.deltas.revenue - data.deltas.opex,
       subtitle: 'Revenue Adjusted for OPEX'
    },
    { 
       label: 'Delinquent Arrears', 
       val: data.current.debt, 
       delta: data.deltas.debt,
       subtitle: 'Total Portfolio Debt',
       inverse: true
    },
    { 
       label: 'Occupancy Yield', 
       val: data.current.yieldRate, 
       delta: data.deltas.yield, 
       isPercent: true,
       subtitle: 'Capacity Saturation'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {CARDS.map((s) => (
        <Card key={s.label} className="p-6 flex flex-col justify-between min-h-[160px]">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[12px] font-bold text-muted-foreground  mb-1">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground/60  tracking-[0.2em] font-bold">{s.subtitle}</p>
               </div>
                <Badge variant={s.inverse ? (s.delta > 0 ? 'danger' : 'success') : (s.delta >= 0 ? 'success' : 'danger')} className="text-[10px] font-bold px-2 py-0.5">
                  {s.delta >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {Math.abs(s.delta).toFixed(1)}%
                </Badge>
            </div>

            <div className="mt-8">
              <span className="font-finance text-display font-weight-display font-bold text-foreground leading-none block">
                {s.isPercent ? "" : "$"}{s.val.toLocaleString()}{s.isPercent ? "%" : ""}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
