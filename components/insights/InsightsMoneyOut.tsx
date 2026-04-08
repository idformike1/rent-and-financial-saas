'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161821] border border-white/[0.08] shadow-2xl p-3 rounded-lg flex flex-col gap-1 z-50">
        <p className="text-[11px] text-[#9D9DA8] uppercase tracking-widest">{label}</p>
        <p className="text-[15px] text-white font-[400] font-finance">
          −${Math.abs(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function InsightsMoneyOut({ data, entries }: { data: any[], entries: any[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [subTab, setSubTab] = useState('Source');
  const primaryColor = '#E5697F'; // Mercury Pink

  // --- Analytical Calculations ---
  const { total, average } = React.useMemo(() => {
    const sum = data.reduce((acc, curr) => acc + curr.moneyOut, 0);
    const avg = data.length > 0 ? sum / data.length : 0;
    return { total: sum, average: avg };
  }, [data]);

  const tableData = React.useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach(e => {
      if (e.account?.category !== "EXPENSE") return;
      
      let key = "Other";
      if (subTab === 'Source') key = e.account?.name || "Unknown";
      else if (subTab === 'Category') key = e.expenseCategory?.name || "Operations";
      else if (subTab === 'GL Code') key = `500${e.account?.id?.slice(-1) || '1'}`;
      
      map[key] = (map[key] || 0) + Math.abs(e.amount);
    });
    
    const totalOut = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: Number((totalOut > 0 ? (amount / totalOut) * 100 : 0).toFixed(1))
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [entries, subTab]);

  const subTabs = ['Source', 'Category', 'GL Code'];

  const formatValue = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 1000000) return Math.round(absVal / 1000).toLocaleString('en-US') + 'K';
    return {
      full: absVal.toLocaleString('en-US', { minimumFractionDigits: 0 }),
      compact: Math.round(absVal / 1000).toLocaleString('en-US') + 'K'
    };
  };

  const renderMetric = (val: number) => {
    const formatted = formatValue(val);
    if (typeof formatted === 'string') return formatted;
    return (
      <>
        <span className="hidden xl:inline">{formatted.full}</span>
        <span className="xl:hidden">{formatted.compact}</span>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-10">

      {/* ── HERO METRICS ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end flex-wrap mb-0 border-b border-[#2D2E39]/50 pb-8 px-4">
        <div className="flex flex-col mr-[144px]">
          <p className="text-[15px] leading-[24px] font-normal text-[#F4F5F9] mb-2 font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Total money out</p>
          <p 
            className="text-[38px] text-white tracking-[-0.02em] leading-[42px] flex items-baseline"
            style={{ fontFamily: '"Arcadia Display", system-ui, sans-serif', fontWeight: 480 }}
          >
            −${renderMetric(total)}
          </p>
        </div>
        <div className="flex flex-col md:pb-0.5">
          <p className="text-[15px] leading-[24px] font-normal text-[#F4F5F9] mb-2 font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Monthly average</p>
          <p 
            className="text-[24px] text-white tracking-[-0.01em] leading-[28px]"
            style={{ fontFamily: '"Arcadia Text", system-ui, sans-serif', fontWeight: 480 }}
          >
            −${renderMetric(average)}
          </p>
        </div>
      </div>

      <div className="w-full h-[320px] min-h-[300px] p-4 relative z-20">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8a8b94', fontSize: 12 }}
              dy={10}
            />
            <YAxis hide={true} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            />
            <Bar
              dataKey="moneyOut"
              radius={[4, 4, 0, 0]}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={primaryColor}
                  fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                  className="transition-all duration-300"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- TASK 1: SUB-NAVIGATION STRATUM --- */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center p-1 bg-white/[0.02] border border-white/[0.05] rounded-lg w-fit ml-4">
          {subTabs.map((tab) => (
              <div
                key={tab}
                onClick={() => setSubTab(tab)}
                className={cn(
                  "text-[15px] leading-[24px] px-4 py-1 rounded-md cursor-pointer transition-all font-normal",
                  subTab === tab ? "bg-[#2D2E39] text-[#F4F5F9] shadow-sm" : "text-[#8A8B94] hover:text-[#F4F5F9]"
                )}
              >
                {tab}
              </div>
          ))}
        </div>

        {/* --- TASK 2 & 3: ANALYTICAL TABLE --- */}
        <div className="px-4 pb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-[15px] leading-[24px] text-[#F4F5F9] font-normal pb-2 w-1/3">Recipient</th>
                <th className="text-left text-[15px] leading-[24px] text-[#F4F5F9]/60 font-normal pb-2 w-1/3">% of total</th>
                <th className="text-right text-[15px] leading-[24px] text-[#F4F5F9]/60 font-normal pb-2 w-1/3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.name} className="border-b border-white/5 h-[48px] hover:bg-white/[0.02] transition-colors group">
                  <td className="text-[15px] leading-[24px] text-[#F4F5F9]">{row.name}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-[6px] w-full max-w-[120px] bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${row.percent}%`, backgroundColor: '#EF4444' }}
                        />
                      </div>
                      <span className="text-[15px] leading-[24px] text-[#8A8B94] font-mono">{row.percent}%</span>
                    </div>
                  </td>
                  <td className="text-right text-[15px] leading-[24px] text-[#F4F5F9] font-mono">
                    ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
