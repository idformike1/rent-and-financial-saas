'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDown,
  Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getInsightsData, Timeframe } from './actions';
import { cn } from '@/lib/utils';

export default function InsightsClient({ organizationId }: { organizationId: string | undefined }) {
  const [timeframe, setTimeframe] = useState<Timeframe>('ALL');
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Money in', 'Money out', 'Burn rate', 'Cash runway'];
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getInsightsData(organizationId, timeframe)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch insights", err);
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [timeframe, organizationId]);

  const { totalIncome, totalExpense } = useMemo(() => {
    if (!data?.chartData) return { totalIncome: 0, totalExpense: 0 };
    return data.chartData.reduce((acc: any, curr: any) => ({
      totalIncome: acc.totalIncome + curr.income,
      totalExpense: acc.totalExpense + curr.expense
    }), { totalIncome: 0, totalExpense: 0 });
  }, [data]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(val));
  };

  const isNegativeNet = data?.netCashFlow < 0;

  return (
    <div className="space-y-0 bg-[#090A0E] min-h-screen font-sans selection:bg-white/10 text-white">
      
      {/* ── 1. HEADER & DATE CONTROLS ───────────────────────────────────── */}
      <div className="px-10 pt-10 pb-4">
        <div className="flex items-center justify-between">
            <h1 className="text-[28px] font-[400] text-[#DDE1E5]">
               Insights
            </h1>
            <div className="flex items-center gap-3">
               <button className="px-4 py-2 border border-white/[0.1] rounded-full text-[13px] text-[#DDE1E5] flex items-center gap-2 hover:bg-white/[0.03] transition-colors relative group bg-[#161821]">
                  <span>{timeframe === 'ALL' ? 'All time' : timeframe === '3M' ? 'Last 3 months' : 'Year to date'}</span>
                  <ChevronDown size={14} className="text-[#9D9DA8] group-hover:text-white transition-colors" />
                  
                  {/* Native select overlaid invisibly for click handling */}
                  <select 
                    title="timeframe"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                  >
                    <option value="3M">Last 3 months</option>
                    <option value="YTD">Year to date</option>
                    <option value="ALL">All time</option>
                  </select>
               </button>
            </div>
        </div>
      </div>

      {/* ── 2. INLINE NAVIGATION TABS ───────────────────────────────────── */}
      <div className="px-10 border-b border-white/[0.05]">
        <div className="flex items-center gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-[14px] font-[400] transition-colors relative",
                activeTab === tab 
                  ? "text-[#DDE1E5]" 
                  : "text-[#9D9DA8] hover:text-[#DDE1E5]"
              )}
            >
              <span>{tab}</span>
              {activeTab === tab && (
                <motion.div 
                  layoutId="insightsTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. DATA STRATUM (TYPOGRAPHIC PARITY) ────────────────────────── */}
      <div className="px-10 pt-10 grid grid-cols-12 gap-8 h-full">
        
        {/* Left Column: Metadata */}
        <div className="col-span-3 space-y-12">
          {loading ? (
             <div className="animate-pulse space-y-8">
               <div className="h-16 bg-white/5 w-3/4 rounded-lg" />
               <div className="h-24 bg-white/5 w-full rounded-lg" />
             </div>
          ) : (
            <>
              {/* Primary Metric */}
              <div className="space-y-1 group">
                <p className="text-[12px] text-[#9D9DA8] font-[400] uppercase tracking-[0.05em]">Net cashflow</p>
                <div className="flex items-baseline">
                  <span className={cn(
                    "text-[32px] font-[400] font-finance",
                    isNegativeNet ? "text-white" : "text-white"
                  )}>
                    {isNegativeNet ? '−' : ''}${formatCurrency(data?.netCashFlow || 0)}
                  </span>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-[11px] text-[#9D9DA8] font-[400] uppercase tracking-wider">Money in</p>
                    <p className="text-[15px] text-[#6CC08F] font-[400] font-finance">
                       +${formatCurrency(totalIncome)}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[11px] text-[#9D9DA8] font-[400] uppercase tracking-wider">Money out</p>
                    <p className="text-[15px] text-[#DDE1E5] font-[400] font-finance">
                       −${formatCurrency(totalExpense)}
                    </p>
                 </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Visualization Canvas */}
        <div className="col-span-9 relative h-[450px]">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center">
               <Loader2 className="w-8 h-8 animate-spin text-[#9D9DA8]/40" />
             </div>
          ) : (
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data?.chartData || []} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                   {/* Gradient for NET Cashflow */}
                   <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor={isNegativeNet ? "#DDE1E5" : "#6CC08F"} stopOpacity={0.25}/>
                     <stop offset="95%" stopColor={isNegativeNet ? "#DDE1E5" : "#6CC08F"} stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 
                 {/* Subtle axis lines */}
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                 
                 <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#9D9DA8' }} 
                    dy={16}
                 />
                 <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#9D9DA8' }}
                    tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                    dx={-10}
                 />
                 
                 {/* Custom Minimal Tooltip */}
                 <Tooltip 
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const val = payload[0].payload.net;
                        const isNeg = val < 0;
                        return (
                          <div className="bg-[#161821] border border-white/[0.05] shadow-xl p-3 rounded-md space-y-1">
                            <p className="text-[12px] text-[#9D9DA8] uppercase tracking-wide">{label}</p>
                            <p className="text-[15px] text-white font-[400] font-finance">
                              {isNeg ? '−' : ''}${formatCurrency(val)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                 />
                 
                 {/* The Area Mapping */}
                 <Area 
                   type="monotone" 
                   dataKey="net" 
                   stroke={isNegativeNet ? "#DDE1E5" : "#6CC08F"} 
                   strokeWidth={2.5} 
                   fillOpacity={1} 
                   fill="url(#colorNet)" 
                 />
               </AreaChart>
             </ResponsiveContainer>
          )}
        </div>
      </div>
      
    </div>
  );
}
