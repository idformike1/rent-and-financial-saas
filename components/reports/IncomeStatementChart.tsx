'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface ChartData {
  name: string;
  revenue: number;
  expense: number;
}

export default function IncomeStatementChart({ data }: { data: ChartData[] }) {
  if (!data?.length) return (
    <div className="h-64 flex items-center justify-center border-4 border-dashed border-zinc-200 rounded-3xl bg-zinc-50">
       <span className="text-[10px] font-black uppercase text-zinc-300">Insufficient historical data for MoM projection</span>
    </div>
  );

  return (
    <div className="h-[400px] w-full bg-card p-6 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-3xl overflow-hidden">
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-zinc-100">
        <h4 className="text-xl font-black italic uppercase italic tracking-tighter">MoM Performance Matrix (Revenue vs OpEx)</h4>
        <div className="flex gap-4">
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[var(--primary)] rounded-xl" /> <span className="text-[8px] font-black uppercase">Growth Revenue</span></div>
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-600 rounded-xl" /> <span className="text-[8px] font-black uppercase">Operational Loss</span></div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" strokeWidth={2} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 900, fill: '#A1A1AA' }}
          />
          <YAxis 
             axisLine={false} 
             tickLine={false} 
             tick={{ fontSize: 10, fontWeight: 900, fill: '#A1A1AA' }}
             tickFormatter={(val) => `$${val.toLocaleString()}`}
          />
          <Tooltip 
             cursor={{ fill: '#F4F4F5' }}
             contentStyle={{ 
                border: '4px solid black', 
                borderRadius: '12px',
                padding: '12px',
                backgroundColor: 'white',
                boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                fontSize: '10px',
                fontWeight: 900,
                textTransform: 'uppercase'
             }}
          />
          <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={24} />
          <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
