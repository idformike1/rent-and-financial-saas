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
        <Card key={s.label} className="p-5 flex flex-col justify-between min-h-[160px] bg-[#0B0D10] border-[#23252A]">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-xs font-medium text-[#8A919E] uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-[10px] text-[#8A919E]/60 uppercase tracking-widest">{s.subtitle}</p>
               </div>
                <Badge variant={s.inverse ? (s.delta > 0 ? 'danger' : 'success') : (s.delta >= 0 ? 'success' : 'danger')} className="text-[9px] px-1.5 py-0 border-[#23252A]/20">
                  {s.delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(s.delta).toFixed(1)}%
                </Badge>
            </div>

            <div className="mt-4">
              <span className="font-finance text-3xl text-white italic tracking-tight leading-none block">
                {s.isPercent ? "" : "$"}{s.val}{s.isPercent ? "%" : ""}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
