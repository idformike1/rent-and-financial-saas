'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DashboardChartsProps {
  trendData: { month: string; income: number; expense: number }[];
  recoveryData: { name: string; value: number }[];
}

const COLORS = ['#4f46e5', '#cbd5e1']; // Indigo-600 vs Slate-300

export default function DashboardCharts({ trendData, recoveryData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Area Chart: NOI Trend */}
      <div className="lg:col-span-2 bg-white p-6 shadow-sm border border-slate-200 sm:rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">NOI Trend (Income vs Expense)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, '']}
              />
              <Area type="monotone" dataKey="income" stroke="#4f46e5" fill="#e0e7ff" strokeWidth={2} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="#ffe4e6" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Gauge: Utility Recovery */}
      <div className="bg-white p-6 shadow-sm border border-slate-200 sm:rounded-lg flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-2 w-full text-left">Utility Recovery</h3>
        <p className="text-sm text-slate-500 w-full text-left mb-6 font-medium">Algorithm B Insight</p>
        
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={recoveryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {recoveryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-2xl font-bold text-slate-900">
              {recoveryData[0]?.value > 0 ? ((recoveryData[0].value / (recoveryData[0].value + recoveryData[1].value)) * 100).toFixed(0) : 0}%
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-1">Recovered</span>
          </div>
        </div>
      </div>
    </div>
  )
}
