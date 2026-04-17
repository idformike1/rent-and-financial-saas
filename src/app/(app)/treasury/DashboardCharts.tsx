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
import { useState, useEffect } from 'react'

interface DashboardChartsProps {
  trendData: { month: string; income: number; expense: number }[];
  recoveryData: { name: string; value: number }[];
}

// Mercury chart palette — intentional semantic colors for data visualization.
// These are kept as explicit hex values because they represent DATA series
// colours (not UI chrome) and must remain consistent across both themes.
const CHART_SERIES = ['var(--sidebar-primary)', 'var(--mercury-green)', 'var(--chart-3)', 'var(--destructive)', 'var(--sidebar-primary)'];

export default function DashboardCharts({ trendData, recoveryData }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* HISTORICAL EGR AREA CHART */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="lg:col-span-2 bg-card border border-border rounded-[8px] p-6"
      >
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-[14px] font-bold text-foreground  tracking-tight leading-none">Historical EGR Velocity</h3>
              <p className="text-[11px] font-bold text-muted-foreground  mt-2">Gross realization over 6 months</p>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-[6px]" style={{ backgroundColor: 'var(--sidebar-primary)' }} />
              <span className="text-[10px] font-bold text-muted-foreground ">Gross Revenue</span>
           </div>
        </div>
        
        <div className="h-64 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--sidebar-primary)" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="var(--sidebar-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={1} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }} 
                  dy={12} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }} 
                  tickFormatter={(val) => `$${val/1000}k`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)', 
                    backgroundColor: 'var(--card)', 
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    padding: '12px 16px',
                  }} 
                  itemStyle={{ color: 'var(--foreground)', fontSize: '12px', fontWeight: 700 }}
                  labelStyle={{ color: 'var(--muted-foreground)', fontSize: '10px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="var(--sidebar-primary)" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  activeDot={{ r: 6, fill: 'var(--sidebar-primary)', stroke: 'var(--card)', strokeWidth: 2 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* NOI PIE CHART */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-card border border-border rounded-[8px] p-6 flex flex-col"
      >
        <div className="mb-6">
           <h3 className="text-[14px] font-bold text-foreground  tracking-tight leading-none">NOI Allocation</h3>
           <p className="text-[11px] font-bold text-muted-foreground  mt-2">Operating Breakdown</p>
        </div>
        
        <div className="flex-1 relative min-h-[180px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              <PieChart>
                <Pie
                  data={recoveryData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {recoveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_SERIES[index % CHART_SERIES.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)', 
                    backgroundColor: 'var(--card)', 
                    color: 'var(--foreground)',
                    fontSize: '12px',
                    fontWeight: 700,
                  }} 
                  itemStyle={{ color: 'var(--foreground)', fontSize: '11px', fontWeight: 700 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="font-finance text-2xl font-bold text-foreground">84%</span>
             <span className="text-[9px] font-bold  text-muted-foreground  mt-1">Efficiency</span>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-t border-border pt-6">
           {recoveryData.map((item, idx) => (
             <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-[6px] shrink-0" style={{ backgroundColor: CHART_SERIES[idx % CHART_SERIES.length] }} />
                   <span className="text-[10px] font-bold text-muted-foreground ">{item.name}</span>
                </div>
                <span className="font-finance text-[12px] font-bold text-foreground">${item.value.toLocaleString()}</span>
             </div>
           ))}
        </div>
      </motion.div>
    </div>
  )
}
