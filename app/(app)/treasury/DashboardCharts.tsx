'use client'

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts'
import { motion } from 'framer-motion'

interface DashboardChartsProps {
  trendData: { month: string; income: number; expense: number }[];
  recoveryData: { name: string; value: number }[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function DashboardCharts({ trendData, recoveryData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      
      {/* HISTORICAL EGR LINE CHART (PHASE 2) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="lg:col-span-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2.5rem] p-10 shadow-premium"
      >
        <div className="flex items-center justify-between mb-10">
           <div>
              <h3 className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Historical EGR Velocity</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Gross realization over 6 months</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand" />
                 <span className="text-[9px] font-bold text-slate-500 uppercase">Gross Revenue</span>
              </div>
           </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                dy={16} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                tickFormatter={(val) => `$${val/1000}k`} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1.5rem', 
                  border: 'none', 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '1rem',
                  backdropFilter: 'blur(10px)'
                }} 
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#4f46e5" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                activeDot={{ r: 8, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* OPERATING BREAKDOWN (NOI) PIE CHART (PHASE 2) */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2.5rem] p-10 shadow-premium flex flex-col"
      >
        <div className="mb-8">
           <h3 className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">NOI Allocation</h3>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Operating Breakdown</p>
        </div>
        
        <div className="flex-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={recoveryData}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {recoveryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} 
                itemStyle={{ color: '#fff', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">84%</span>
             <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">Efficiency</span>
          </div>
        </div>

        <div className="mt-8 space-y-3">
           {recoveryData.map((item, idx) => (
             <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-slate-900 dark:text-white">${item.value.toLocaleString()}</span>
             </div>
           ))}
        </div>
      </motion.div>
    </div>
  )
}
