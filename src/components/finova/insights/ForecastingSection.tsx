'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Wallet, TrendingUp, AlertTriangle, Send } from 'lucide-react'
import { Button } from '@/src/components/finova/ui-finova'

const CHART_DATA = [
  { name: 'Jan', collected: 105000, target: 115000 },
  { name: 'Feb', collected: 112000, target: 120000 },
  { name: 'Mar', collected: 118000, target: 125000 },
  { name: 'Apr', collected: 121000, target: 130000 },
  { name: 'May', collected: 114280, target: 135000 },
]

export default function ForecastingSection() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* CHART COLUMN */}
      <div className="xl:col-span-2 p-6 rounded-2xl bg-[#1E1E2A] border border-white/5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-neutral-200">Cash collection vs. Target (monthly)</h3>
          </div>
          <select className="bg-white/5 border border-white/10 text-xs font-medium text-neutral-400 rounded px-2.5 py-1.5 outline-none">
            <option>Last 6 months</option>
            <option>Year to date</option>
          </select>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3A3A3', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3A3A3', fontSize: 12, fontWeight: 500 }}
                tickFormatter={(val) => `$${val/1000}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E1E2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px', fontWeight: '500' }}
                labelStyle={{ fontSize: '12px', color: '#A3A3A3', marginBottom: '4px' }}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#D4D4D4', paddingBottom: '20px' }}
              />
              <Bar dataKey="collected" name="Cash Collected ($)" fill="#5D71F9" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="target" name="Target Collection ($)" fill="#ffffff10" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-400">Average collection rate</span>
            <span className="text-2xl font-medium text-white">89.3%</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-neutral-400">Projected inflow (next month)</span>
            <p className="text-2xl font-medium text-white">$114,200</p>
            <p className="text-xs text-neutral-500 mt-1">Based on current occupied units + utility recovery</p>
          </div>
        </div>
      </div>

      {/* PROJECTION WIDGET COLUMN */}
      <div className="p-8 rounded-2xl bg-[#1E1E2A] border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <Wallet size={120} className="text-white" />
        </div>

        <div className="space-y-8 relative">
          <h3 className="text-base font-semibold text-neutral-200 mb-6">Cash flow projection</h3>
          
          <div className="space-y-6">
             <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-neutral-400">
                   Cash on hand (reserve)
                </div>
                <p className="text-3xl font-medium text-white tracking-tight">$123,890</p>
             </div>

             <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-neutral-400">
                   What will be collected (next 30d)
                </div>
                <p className="text-2xl font-medium text-white">$82,500</p>
                <p className="text-sm text-neutral-500 mt-1">Rent: $73,200 | Utilities: $9,300</p>
             </div>

             <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-neutral-400">
                   At risk / delinquent exposure
                </div>
                <p className="text-xl font-medium text-red-400">$16,050 rent + $4,550 utilities</p>
             </div>
          </div>
        </div>

        <div className="relative pt-8 space-y-4">
           <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium text-white h-11 gap-2">
              Send batch reminders
           </Button>
           <p className="text-xs text-center text-neutral-500 font-medium">Collections automation active</p>
        </div>
      </div>
    </div>
  )
}
