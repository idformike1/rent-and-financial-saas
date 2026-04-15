'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  ComposedChart,
  Bar,
  Cell,
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

// --- Custom Bar with Surgical Group Highlight Logic ---
const CustomBipolarBar = (props: any) => {
  const { x, y, width, height, fill, dataKey, payload, hoveredDate } = props;
  if (!height || height === 0) return null;

  // Recharts vector math
  const visualTop = height < 0 ? y + height : y;
  const absHeight = Math.abs(height);

  const isPositive = dataKey === 'moneyIn';

  // High-Fidelity Logic: Compare payload date to the hovered date string
  // This bypasses any Recharts internal index offset issues.
  const isHighlighted = hoveredDate && payload?.date === hoveredDate;

  let finalOpacity = 0.8; // Baseline
  if (hoveredDate !== null) {
    finalOpacity = isHighlighted ? 1 : 0.15;
  }

  // Rule lines at the outer edge
  const lineY = isPositive ? visualTop : visualTop + absHeight;
  const strokeColor = isPositive
    ? (hoveredDate !== null && !isHighlighted ? 'rgba(80, 120, 255, 0.15)' : 'rgba(80, 120, 255, 0.95)')
    : (hoveredDate !== null && !isHighlighted ? 'rgba(255, 120, 140, 0.15)' : 'rgba(255, 120, 140, 0.95)');

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
        stroke={strokeColor}
        strokeWidth={2}
        style={{ transition: 'stroke 0.3s ease' }}
      />
    </g>
  );
};

// --- Hardened Mercury Tooltip ---
const ClinicalTooltip = ({ active, payload, label, mode }: any) => {
  if (active && payload && payload.length) {
    const income = payload.find((p: any) => p.dataKey === 'moneyIn')?.value || 0;
    const expense = payload.find((p: any) => p.dataKey === 'moneyOut')?.value || 0;
    const net = payload.find((p: any) => p.dataKey === 'netCashflow')?.value || 0;

    const showIn = mode === 'overview' || mode === 'money-in';
    const showOut = mode === 'overview' || mode === 'money-out';
    const showNet = mode === 'overview';

    // Technical Formatting
    let monthLabel = '';
    try {
      const date = new Date(label);
      monthLabel = isNaN(date.getTime()) ? label.split(' ')[0] : format(date, 'MMMM');
    } catch (e) {
      monthLabel = label.split(' ')[0];
    }

    return (
      <div
        className="bg-popover/95 border border-white/[0.1] shadow-[0_16px_32px_-8px_rgba(0,0,0,0.8)] px-5 py-4 rounded-[8px] flex flex-col gap-3 z-50 min-w-[220px] backdrop-blur-3xl"
      >
        <div className="flex flex-col gap-2">
          {showIn && (
            <div className="flex items-center justify-between gap-6">
              <span className="text-[11px] text-white font-normal uppercase tracking-[0.08em]">Money in</span>
              <span className="text-[13px] text-white font-medium font-finance">
                ${formatCurrency(income)}
              </span>
            </div>
          )}

          {showOut && (
            <div className="flex items-center justify-between gap-6">
              <span className="text-[11px] text-white font-normal uppercase tracking-[0.08em]">Money out</span>
              <span className="text-[13px] text-white font-medium font-finance">
                ${formatCurrency(Math.abs(expense))}
              </span>
            </div>
          )}
        </div>

        {showNet && (
          <>
            <div className="h-[1px] bg-white/10" />
            <div className="flex items-center justify-between gap-6">
              <span className="text-[11px] text-white font-normal uppercase tracking-[0.08em]">
                {monthLabel} cashflow
              </span>
              <span className="text-[14px] text-white font-bold font-finance">
                {net < 0 ? '-' : ''}${formatCurrency(Math.abs(net))}
              </span>
            </div>
          </>
        )}

        {!showNet && (
          <div className="flex items-center justify-between gap-6 pt-1 border-t border-white/5">
            <span className="text-[11px] text-white font-normal uppercase tracking-[0.08em]">{monthLabel}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

interface LedgerChartProps {
  data: any[];
  type?: 'area' | 'bar';
  mode?: 'overview' | 'money-in' | 'money-out';
}

export default function LedgerChart({ data, type = 'area', mode = 'overview' }: LedgerChartProps) {
  // Switched from Index to ID/Date string to avoid Recharts internal index offset issues
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const onMouseMove = (state: any) => {
    // Standardize on the activeLabel (X-Axis string) for 100% accurate grouping
    if (state && state.activeLabel) {
      setHoveredDate(state.activeLabel);
    } else {
      setHoveredDate(null);
    }
  };

  const showIncome = mode === 'overview' || mode === 'money-in';
  const showExpense = mode === 'overview' || mode === 'money-out';
  const showNet = mode === 'overview';

  return (
    <div className="w-full h-full p-4 relative z-20">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 0, left: 0, bottom: 24 }}
          barGap={-40}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setHoveredDate(null)}
        >
          <defs>
            <linearGradient id="glowIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sidebar-primary)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--sidebar-primary)" stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="glowOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.04} />
              <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.22} />
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
            content={<ClinicalTooltip mode={mode} />}
            cursor={false}
            allowEscapeViewBox={{ x: false, y: true }}
          />

          <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

          {showIncome && (
            <Bar
              dataKey="moneyIn"
              fill="url(#glowIn)"
              barSize={40}
              shape={<CustomBipolarBar dataKey="moneyIn" hoveredDate={hoveredDate} />}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-in-${i}`}
                  fillOpacity={hoveredDate === null ? 0.8 : (entry.date === hoveredDate ? 1 : 0.15)}
                  style={{ transition: 'fill-opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              ))}
            </Bar>
          )}

          {showExpense && (
            <Bar
              dataKey="moneyOut"
              fill="url(#glowOut)"
              barSize={40}
              shape={<CustomBipolarBar dataKey="moneyOut" hoveredDate={hoveredDate} />}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-out-${i}`}
                  fillOpacity={hoveredDate === null ? 0.8 : (entry.date === hoveredDate ? 1 : 0.15)}
                  style={{ transition: 'fill-opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              ))}
            </Bar>
          )}

          {showNet && (
            <Line
              type="monotone"
              dataKey="netCashflow"
              stroke="var(--mercury-green)"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: 'var(--mercury-green)',
                stroke: '#FFFFFF',
                strokeWidth: 2,
                fillOpacity: 1
              }}
              activeDot={{
                r: 5,
                fill: 'var(--mercury-green)',
                stroke: '#FFFFFF',
                strokeWidth: 2
              }}
              style={{
                opacity: hoveredDate !== null ? 0.15 : 1,
                transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
