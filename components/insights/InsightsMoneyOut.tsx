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
  Cell,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Hardened Mercury Tooltip ---
const ClinicalTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value || 0;
    
    let monthLabel = '';
    try {
      const date = new Date(label);
      monthLabel = isNaN(date.getTime()) ? label.split(' ')[0] : format(date, 'MMMM');
    } catch (e) {
      monthLabel = label.split(' ')[0];
    }

    return (
      <div
        className="bg-[#0a0a0b]/95 border border-white/[0.1] shadow-[0_16px_32px_-8px_rgba(0,0,0,0.8)] px-5 py-4 rounded-[8px] flex flex-col gap-3 z-50 min-w-[200px] backdrop-blur-3xl"
      >
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-white/50 font-normal uppercase tracking-[0.08em]">Money out</span>
          <div className="flex items-center justify-between gap-6">
            <span className="text-[11px] text-white font-normal uppercase tracking-[0.08em]">{monthLabel}</span>
            <span className="text-[15px] text-white font-medium font-finance">
              −${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// --- Custom Bar with Surgical Highlight Logic ---
const CustomBar = (props: any) => {
  const { x, y, width, height, fill, payload, hoveredDate } = props;
  if (!height || height === 0) return null;

  // Recharts vector math: visualTop is always the uppermost Y coordinate
  const visualTop = height < 0 ? y + height : y;
  const absHeight = Math.abs(height);

  const isHighlighted = hoveredDate && payload?.date === hoveredDate;

  let finalOpacity = 0.8;
  if (hoveredDate !== null) {
    finalOpacity = isHighlighted ? 1 : 0.15;
  }

  // Rule line at the tip (outer edge)
  const lineY = height < 0 ? visualTop + absHeight : visualTop;

  return (
    <g style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <rect
        x={x}
        y={visualTop}
        width={width}
        height={absHeight}
        fill={fill}
        style={{
          opacity: finalOpacity,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer'
        }}
      />
      <line
        x1={x}
        y1={lineY}
        x2={x + width}
        y2={lineY}
        stroke={hoveredDate !== null && !isHighlighted ? 'rgba(255, 120, 140, 0.15)' : 'rgba(255, 120, 140, 0.95)'}
        strokeWidth={2}
        style={{ transition: 'stroke 0.3s ease' }}
      />
    </g>
  );
};

export default function InsightsMoneyOut({ data, entries }: { data: any[], entries: any[] }) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
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
      <div className="flex flex-col mb-8 border-b border-[#2D2E39]/50 pb-8 px-4">
        <div className="flex flex-row items-end flex-wrap">
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
      </div>

      <div className="w-full h-[320px] min-h-[300px] p-4 relative z-20">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: 32, bottom: 24 }}
            onMouseMove={(state) => {
              if (state && state.activeLabel) setHoveredDate(state.activeLabel);
              else setHoveredDate(null);
            }}
            onMouseLeave={() => setHoveredDate(null)}
          >
            <defs>
              <linearGradient id="glowOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF788C" stopOpacity={0.04} />
                <stop offset="100%" stopColor="#FF788C" stopOpacity={0.22} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              vertical={true} 
              horizontal={true} 
              stroke="rgba(255,255,255,0.05)" 
              strokeDasharray="1 39" 
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: '"Arcadia Text", system-ui, sans-serif' }}
              dy={16}
              minTickGap={20}
              padding={{ left: 40, right: 40 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{
                fill: 'rgba(255,255,255,0.5)',
                fontSize: 13,
                fontFamily: '"Arcadia Text", system-ui, sans-serif'
              }}
              dx={-10}
              width={70}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={<ClinicalTooltip />}
              cursor={false}
              allowEscapeViewBox={{ x: false, y: true }}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
            <Bar
              dataKey="moneyOut"
              fill="url(#glowOut)"
              barSize={40}
              shape={<CustomBar hoveredDate={hoveredDate} />}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fillOpacity={hoveredDate === null ? 0.8 : (entry.date === hoveredDate ? 1 : 0.15)}
                  style={{ transition: 'fill-opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
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
