'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrendChartProps {
  data: any[]
  title: string
}

export default function TrendChart({ data, title }: TrendChartProps) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
      <h3 className="text-xs font-bold text-clinical-muted uppercase tracking-widest mb-6">{title}</h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(245, 158, 11)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="rgb(245, 158, 11)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              tickFormatter={(val) => `$${val/1000}k`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="rgb(245, 158, 11)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#wealthGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
