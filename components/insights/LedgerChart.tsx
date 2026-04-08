'use client';

import React from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

// --- Task 2: Y-Axis Shorthand Formatter ---
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

// --- Task 3: Vertical Highlight Band ---
const CustomCursor = (props: any) => {
  const { points, height } = props;
  if (!points || !points.length) return null;
  const { x } = points[0];
  const columnWidth = 40;
  return (
    <rect
      x={x - columnWidth / 2}
      y={0}
      width={columnWidth}
      height={height}
      fill="rgba(255,255,255,0.05)"
    />
  );
};


// Custom Tooltip to override the default Recharts box
const MinimalTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isNegative = value < 0;
    return (
      <div className="bg-[#161821] border border-white/[0.08] shadow-2xl p-3 rounded-lg flex flex-col gap-1 z-50">
        <p className="text-[11px] text-[#9D9DA8] uppercase tracking-widest">{label}</p>
        <p className="text-[15px] text-white font-[400] font-finance">
          {isNegative ? '−' : ''}${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </p>
      </div>
    );
  }
  return null;
};

interface LedgerChartProps {
  data: any[];
  color?: string;
  type?: 'area' | 'bar';
}

// --- Main Chart Component ---
export default function LedgerChart({ data, color = '#10b981', type = 'area' }: LedgerChartProps) {
  return (
    <div className="w-full h-full p-4 relative z-20">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <ComposedChart
          data={data}
          margin={{ top: 16, right: 0, left: 0, bottom: 24 }}
        >
          <defs>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'inherit' }}
            dy={10}
            minTickGap={30}
          />

          <YAxis
            hide={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'inherit' }}
            tickFormatter={formatYAxis}
            domain={['auto', 'auto']}
            dx={-10}
          />

          <ReferenceLine
            y={0}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />

          <Tooltip
            content={<MinimalTooltip />}
            cursor={<CustomCursor />}
            isAnimationActive={false}
          />

          <Bar dataKey="moneyIn" fill="#3B82F6" fillOpacity={0.15} radius={[2,2,0,0]} barSize={12} isAnimationActive={false} />
          <Bar dataKey="moneyOut" fill="#EF4444" fillOpacity={0.15} radius={[0,0,2,2]} barSize={12} isAnimationActive={false} />

          {type === 'area' ? (
            <Area
              type="linear"
              dataKey="netCashflow"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorNet)"
              dot={{ r: 4, strokeWidth: 2, fill: '#161821', stroke: color }}
              activeDot={{ r: 6, fill: color, stroke: '#161821', strokeWidth: 2 }}
              isAnimationActive={true}
            />
          ) : (
            <Bar
              dataKey="netCashflow"
              fill={color}
              radius={[4, 4, 0, 0]}
              barSize={24}
              isAnimationActive={true}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
