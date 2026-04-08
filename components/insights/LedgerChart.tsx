'use client';

import React, { useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

// --- Analytical Formatting ---
const formatCurrency = (val: number) => {
  return val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatYAxis = (value: number) => {
  if (value === 0) return '$0';
  const absValue = Math.abs(value);
  if (absValue >= 1000000) {
    return `${value < 0 ? '-' : ''}$${(absValue / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (absValue >= 1000) {
    return `${value < 0 ? '-' : ''}$${(absValue / 1000).toFixed(0)}k`;
  }
  return `${value < 0 ? '-' : ''}$${absValue}`;
};

// --- Custom Bar with Global Muting Logic ---
const CustomBipolarBar = (props: any) => {
  const { x, y, width, height, fill, dataKey, index, hoverIndex } = props;
  if (!height || height === 0) return null;

  // Recharts vector math
  const visualTop = height < 0 ? y + height : y;
  const absHeight = Math.abs(height);
  
  const isPositive = dataKey === 'moneyIn';
  
  // Interaction Logic: "All are muted on hover"
  // If any point is being hovered, every bar (including the active one) is dimmed.
  const anyHovered = hoverIndex !== null;
  const opacity = anyHovered ? 0.3 : 0.8; 
  
  // Rule lines at the outer edge
  const lineY = isPositive ? visualTop : visualTop + absHeight;
  const strokeColor = isPositive 
    ? (anyHovered ? 'rgba(80, 120, 255, 0.4)' : 'rgba(80, 120, 255, 0.8)') 
    : (anyHovered ? 'rgba(255, 120, 140, 0.4)' : 'rgba(255, 120, 140, 0.8)');

  return (
    <g style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <rect 
        x={x} 
        y={visualTop} 
        width={width} 
        height={absHeight} 
        fill={fill} 
        style={{ 
          opacity: opacity, 
          transition: 'opacity 0.25s ease',
          cursor: 'pointer'
        }}
      />
      <line 
        x1={x} 
        y1={lineY} 
        x2={x + width} 
        y2={lineY} 
        stroke={strokeColor} 
        strokeWidth={2} 
        style={{ transition: 'stroke 0.25s ease' }}
      />
    </g>
  );
};

// --- High-Fidelity Tooltip ---
const ClinicalTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const net = payload.find((p: any) => p.dataKey === 'netCashflow')?.value || 0;
    const income = payload.find((p: any) => p.dataKey === 'moneyIn')?.value || 0;
    const expense = payload.find((p: any) => p.dataKey === 'moneyOut')?.value || 0;
    const month = label?.split(' ')[0] || '';

    return (
      <div className="bg-[#1C1D24] border border-white/[0.08] shadow-[0_32px_64px_rgba(0,0,0,0.8)] px-6 py-5 rounded-[12px] flex flex-col gap-5 z-50 min-w-[280px] backdrop-blur-xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-10">
            <span className="text-[15px] text-[#8E8F99] font-normal font-finance tracking-tight">Money in</span>
            <span className="text-[17px] text-white font-medium font-finance">
              ${formatCurrency(income)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-10">
            <span className="text-[15px] text-[#8E8F99] font-normal font-finance tracking-tight">Money out</span>
            <span className="text-[17px] text-white font-medium font-finance">
              ${formatCurrency(Math.abs(expense))}
            </span>
          </div>
        </div>

        <div className="h-[1px] bg-white/[0.05]" />

        <div className="flex items-center justify-between gap-10">
          <span className="text-[15px] text-[#8E8F99] font-normal lowercase first-letter:uppercase font-finance tracking-tight">
            {month} cashflow
          </span>
          <span className="text-[18px] text-white font-bold font-finance">
            {net < 0 ? '-' : ''}${formatCurrency(Math.abs(net))}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

interface LedgerChartProps {
  data: any[];
}

export default function LedgerChart({ data }: LedgerChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const onMouseMove = (state: any) => {
    if (state && state.activeTooltipIndex !== undefined) {
      setHoverIndex(state.activeTooltipIndex);
    } else {
      setHoverIndex(null);
    }
  };

  return (
    <div className="w-full h-full p-4 relative z-20">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 0, left: 32, bottom: 24 }}
          barGap={-40} 
          onMouseMove={onMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="glowIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F6EF7" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#4F6EF7" stopOpacity={0.04} />
            </linearGradient>
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
            tick={{ fill: 'rgb(157, 157, 168)', fontSize: 13, fontFamily: '"Arcadia Text", system-ui, sans-serif' }}
            dy={16}
            minTickGap={20}
            padding={{ left: 40, right: 40 }}
          />

          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: 'rgb(157, 157, 168)', 
              fontSize: 13, 
              fontFamily: '"Arcadia Text", system-ui, sans-serif',
              fontWeight: 400
            }}
            tickFormatter={formatYAxis}
            dx={-10}
            width={70}
          />

          <Tooltip 
            content={<ClinicalTooltip />} 
            cursor={false}
            allowEscapeViewBox={{ x: false, y: true }}
          />

          <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

          <Bar 
            dataKey="moneyIn" 
            fill="url(#glowIn)" 
            barSize={40}
            shape={<CustomBipolarBar dataKey="moneyIn" hoverIndex={hoverIndex} />}
          />

          <Bar 
            dataKey="moneyOut" 
            fill="url(#glowOut)" 
            barSize={40} 
            shape={<CustomBipolarBar dataKey="moneyOut" hoverIndex={hoverIndex} />}
          />

          <Line
            type="monotone"
            dataKey="netCashflow"
            stroke="#10B981" // Precision Emerald / Mint - Best non-red/blue standard for cashflow.
            strokeWidth={2}
            dot={{ 
              r: 4, 
              fill: '#059669', // Darker emerald for point stability
              stroke: '#FFFFFF', 
              strokeWidth: 2,
              fillOpacity: 1
            }}
            activeDot={{ 
              r: 5, 
              fill: '#10B981', 
              stroke: '#FFFFFF', 
              strokeWidth: 2 
            }}
            style={{ 
              opacity: hoverIndex !== null ? 0.3 : 1, 
              transition: 'opacity 0.25s ease' 
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
