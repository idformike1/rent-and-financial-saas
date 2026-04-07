'use client'

import { Card, Badge, cn } from '@/components/ui-finova'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface DashboardClientGridProps {
  data: {
    current: { revenue: number, opex: number, debt: number, yieldRate: number },
    deltas: { revenue: number, opex: number, debt: number, yield: number }
  }
}

const UpArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-3 h-3 mr-1 fill-current">
    <path d="M363.3 148.7c3.1 3.1 3.1 8.2 0 11.3s-8.2 3.1-11.3 0L203.3 21 349.4 167.1c3.1 3.1 3.1 8.2 0 11.3s-8.2 3.1-11.3 0L192 32.7 45.9 178.8c-3.1 3.1-8.2 3.1-11.3 0s-3.1-8.2 0-11.3L180.7 21l34.6 146.1c3.1 3.1 3.1 8.2 0 11.3s8.2 3.1 11.3 0L192 40.7 363.3 212.1c3.1 3.1 3.1 8.2 0 11.3z"/>
  </svg>
)

const DownArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-3 h-3 mr-1 fill-current">
    <path d="M363.3 363.3c3.1 3.1 8.2 3.1 11.3 0s3.1-8.2 0-11.3L203.3 206 349.4 59.9c3.1-3.1 3.1-8.2 0-11.3s-8.2-3.1-11.3 0L192 194.7 45.9 48.6c-3.1-3.1-8.2-3.1-11.3 0s-3.1 8.2 0 11.3L180.7 206 34.6 352.1c-3.1 3.1-3.1 8.2 0 11.3s8.2 3.1 11.3 0L192 217.3 363.3 363.3z"/>
  </svg>
)

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {CARDS.map((s) => (
        <Card key={s.label} className="flex flex-col justify-between min-h-[140px] shadow-none rounded-[8px] p-6 bg-white/[0.02]">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[12px] font-[400] text-[#9D9DA8] tracking-wider mb-1">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground/30 font-medium lowercase italic">{s.subtitle}</p>
               </div>
                <Badge variant={s.inverse ? (s.delta > 0 ? 'danger' : 'success') : (s.delta >= 0 ? 'success' : 'danger')} className="text-[9px] font-bold px-1.5 py-0 rounded-full tracking-tight desaturate">
                  {s.delta >= 0 ? <UpArrow /> : <DownArrow />}
                  {Math.abs(s.delta).toFixed(1)}%
                </Badge>
            </div>

            <div className="mt-8">
              <span className="text-[32px] font-[380] text-foreground tracking-[-0.03em] leading-none block font-finance">
                {s.isPercent ? "" : "$"}{s.val.toLocaleString()}{s.isPercent ? "%" : ""}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
