'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface ChartData {
  name: string;
  revenue: number;
  expense: number;
}

export default function IncomeStatementChart({ data }: { data: ChartData[] }) {
  if (!data?.length) return (
    <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-[8px] bg-muted/30">
       <span className="text-[10px] font-bold uppercase text-muted-foreground">Insufficient historical data for MoM projection</span>
    </div>
  );

  return (
    <div className="h-[400px] w-full bg-card p-6 border border-border rounded-[8px] overflow-hidden">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <h4 className="text-[13px] font-bold text-foreground uppercase">MoM Performance Matrix (Revenue vs OpEx)</h4>
        <div className="flex gap-4">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> <span className="text-[9px] font-bold text-muted-foreground uppercase">Growth Revenue</span></div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-rose-500 rounded-full" /> <span className="text-[9px] font-bold text-muted-foreground uppercase">Operational Loss</span></div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeWidth={1} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--muted-foreground)' }}
          />
          <YAxis 
             axisLine={false} 
             tickLine={false} 
             tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-ibm-plex-mono)' }}
             tickFormatter={(val) => `$${val.toLocaleString()}`}
          />
          <Tooltip 
             cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
             contentStyle={{ 
                border: '1px solid var(--border)', 
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: 'var(--card)',
                boxShadow: 'none',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--foreground)'
             }}
             itemStyle={{ color: 'var(--foreground)', fontWeight: 700 }}
          />
          {/* Data series colours are intentional — emerald=positive, rose=negative */}
          <Bar dataKey="revenue" fill="#10B981" radius={[3, 3, 0, 0]} barSize={20} />
          <Bar dataKey="expense" fill="#F43F5E" radius={[3, 3, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
