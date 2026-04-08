'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Brush,
} from 'recharts';

// --- Task 2: The Drop-Line Cursor ---
const CustomCursor = (props: any) => {
  const { points, width, height } = props;
  if (!points || !points.length) return null;

  const { x, y } = points[0];

  // Define the highlight column width
  const columnWidth = 40;

  return (
    <svg>
      {/* The glowing vertical highlight column */}
      <rect
        x={x - columnWidth / 2}
        y={0}
        width={columnWidth}
        height={height + 20} // Extend slightly down
        fill="rgba(255,255,255,0.03)"
      />
      {/* The strict vertical drop-line from node to X-axis */}
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={height + 20} // Assuming standard axis offset
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
    </svg>
  );
};

// --- Task 3: The Custom Workstation Node ---
const CustomActiveDot = (props: any) => {
  const { cx, cy } = props;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill="#ffffff"
      stroke="#1E1E2A"
      strokeWidth={3}
      style={{
        filter: 'drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.4))'
      }}
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
}

// --- Main Chart Component ---
export default function LedgerChart({ data }: LedgerChartProps) {
  return (
    <div className="w-full h-full p-4 relative z-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 50, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#37CC73" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#37CC73" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* TASK 2: Data Brush Minimap Integration - Top Mounted */}
          <Brush
            dataKey="date"
            height={30}
            y={0}
            stroke="#8a8b94"
            fill="rgba(255,255,255,0.05)"
            travellerWidth={2}
          />

          {/* Subtle horizontal grid lines only, to mimic workstation depth */}
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8a8b94', fontSize: 12, fontFamily: 'inherit' }}
            dy={10}
            minTickGap={30}
          />

          <YAxis hide={true} domain={['dataMin - 5000', 'dataMax + 5000']} />

          <Tooltip
            content={<MinimalTooltip />}
            cursor={<CustomCursor />}
            isAnimationActive={false} // Disable standard animation for tighter responsiveness
          />

          <Area
            type="linear" // <-- Changed from "monotone"
            dataKey="netCashflow"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorNet)"
            dot={{ r: 3, fill: '#090A0E', stroke: '#10b981', strokeWidth: 2 }} // <-- Changed from false
            activeDot={<CustomActiveDot />}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
