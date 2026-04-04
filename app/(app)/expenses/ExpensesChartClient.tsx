'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ExpensesChartClient({ data }: { data: any[] }) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center border-4 border-dashed border-slate-100 rounded-3xl">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No Data Nodes Found</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={3} stroke="#fff" />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#0F172A', 
            border: 'none', 
            borderRadius: '12px',
            fontSize: '10px',
            color: '#fff',
            fontStyle: 'italic',
            fontWeight: '900',
            textTransform: 'uppercase'
          }} cursor={false} 
        />
        <Legend 
            verticalAlign="bottom" 
            height={36} 
            formatter={(value) => <span className="text-[9px] font-black uppercase text-slate-400 italic tracking-tighter ml-2">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
