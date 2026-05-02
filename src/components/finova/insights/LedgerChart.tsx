'use client';

import React, { useState, useEffect } from 'react';
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
import { LineChart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const visualTop = height < 0 ? y + height : y;
  const absHeight = Math.abs(height);

  const isPositive = dataKey === 'moneyIn';
  const isHighlighted = hoveredDate && payload?.date === hoveredDate;

  let finalOpacity = 0.8;
  if (hoveredDate !== null) {
    finalOpacity = isHighlighted ? 1 : 0.15;
  }

  const strokeColor = isPositive
    ? (hoveredDate !== null && !isHighlighted ? 'var(--color-positive-low)' : 'var(--color-positive)')
    : (hoveredDate !== null && !isHighlighted ? 'var(--color-negative-low)' : 'var(--color-negative)');

  // Dynamic series coloring
  const finalFill = isPositive ? 'var(--color-positive)' : 'var(--color-negative)';

  return (
    <g style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <rect
        x={x}
        y={visualTop}
        width={width}
        height={absHeight}
        fill={finalFill}
        style={{
          opacity: finalOpacity,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer'
        }}
      />
      <line
        x1={x}
        y1={isPositive ? visualTop : visualTop + absHeight}
        x2={x + width}
        y2={isPositive ? visualTop : visualTop + absHeight}
        stroke={strokeColor}
        strokeWidth={2}
        style={{ transition: 'stroke 0.3s ease', opacity: finalOpacity }}
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

    let monthLabel = '';
    try {
      const date = new Date(label);
      monthLabel = isNaN(date.getTime()) ? label.split(' ')[0] : format(date, 'MMMM');
    } catch (e) {
      monthLabel = label.split(' ')[0];
    }

    return (
      <div className="mercury-card bg-surface border border-border/10 shadow-elevation p-4 flex flex-col gap-3 min-w-[200px]">
        <div className="flex flex-col gap-2">
          {showIn && (
            <div className="flex items-center justify-between gap-6">
              <span className="text-label text-foreground/50">Money in</span>
              <span className="text-sm font-finance text-positive">
                ${formatCurrency(income)}
              </span>
            </div>
          )}

          {showOut && (
            <div className="flex items-center justify-between gap-6">
              <span className="text-label text-foreground/50">Money out</span>
              <span className="text-sm font-finance text-negative">
                ${formatCurrency(Math.abs(expense))}
              </span>
            </div>
          )}
        </div>

        {showNet && (
          <>
            <div className="h-[1px] bg-border/5" />
            <div className="flex items-center justify-between gap-6">
              <span className="text-label text-foreground/50">
                Net Cashflow
              </span>
              <span className="text-display text-sm font-bold font-finance text-brand">
                {net < 0 ? '-' : ''}${formatCurrency(Math.abs(net))}
              </span>
            </div>
          </>
        )}

        <div className="pt-2 mt-1 border-t border-border/5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{label}</span>
        </div>
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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const onMouseMove = (state: any) => {
    if (state && state.activeLabel) {
      setHoveredDate(state.activeLabel);
    } else {
      setHoveredDate(null);
    }
  };

  const showIncome = mode === 'overview' || mode === 'money-in';
  const showExpense = mode === 'overview' || mode === 'money-out';
  const showNet = mode === 'overview';

  if (!mounted) {
    return (
      <div className="w-full h-full p-4 flex items-center justify-center bg-surface/5 border border-border/5 rounded-2xl animate-pulse">
        <Zap size={24} className="text-brand/20" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-surface/5 border border-border/10 rounded-2xl animate-in fade-in duration-700">
        <div className="w-16 h-16 rounded-full bg-brand/5 flex items-center justify-center mb-4">
          <LineChart size={32} className="text-brand/40" />
        </div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/60 mb-2">Awaiting Telemetry Data</h3>
        <p className="text-[11px] text-foreground/30 text-center max-w-[240px] leading-relaxed">The fiscal engine is currently scanning the ledger for transactional patterns and reconciliation events.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 relative z-20">
      {mounted && (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 0, left: 0, bottom: 24 }}
          barGap={-40}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setHoveredDate(null)}
        >
          <defs>
            <linearGradient id="glowIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-positive)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="var(--color-positive)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="glowOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-negative)" stopOpacity={0.02} />
              <stop offset="100%" stopColor="var(--color-negative)" stopOpacity={0.15} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            horizontal={true}
            stroke="var(--color-border-subtle)"
            strokeDasharray="4 4"
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            className="text-label"
            tick={{ 
              fill: 'var(--color-text-secondary)', 
              fontSize: 10, 
              fontWeight: 500
            }}
            dy={16}
            minTickGap={20}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            className="text-label"
            tick={{
              fill: 'var(--color-text-secondary)',
              fontSize: 10,
              fontWeight: 500
            }}
            tickFormatter={formatYAxis}
            dx={-10}
            width={60}
          />

          <Tooltip
            content={<ClinicalTooltip mode={mode} />}
            cursor={false}
            allowEscapeViewBox={{ x: false, y: true }}
          />

          <ReferenceLine y={0} stroke="var(--color-border-subtle)" strokeWidth={1} />

          {showIncome && (
            <Bar
              dataKey="moneyIn"
              fill="url(#glowIn)"
              barSize={32}
              shape={<CustomBipolarBar dataKey="moneyIn" hoveredDate={hoveredDate} />}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-in-${i}`}
                  fillOpacity={hoveredDate === null ? 0.8 : (entry.date === hoveredDate ? 1 : 0.15)}
                />
              ))}
            </Bar>
          )}

          {showExpense && (
            <Bar
              dataKey="moneyOut"
              fill="url(#glowOut)"
              barSize={32}
              shape={<CustomBipolarBar dataKey="moneyOut" hoveredDate={hoveredDate} />}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-out-${i}`}
                  fillOpacity={hoveredDate === null ? 0.8 : (entry.date === hoveredDate ? 1 : 0.15)}
                />
              ))}
            </Bar>
          )}

          {showNet && (
            <Line
              type="monotone"
              dataKey="netCashflow"
              stroke="var(--color-brand)"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: 'var(--color-brand)',
                stroke: 'var(--color-bg)',
                strokeWidth: 2,
                fillOpacity: 1
              }}
              activeDot={{
                r: 5,
                fill: 'var(--color-brand)',
                stroke: 'var(--color-bg)',
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
      )}
    </div>
  );
}
