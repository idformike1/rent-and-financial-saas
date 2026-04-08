'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// --- Task 1: Robust Mock Data ---
const generateMockData = () => {
  const data = [];
  const now = new Date();
  let baseCashflow = 50000;

  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    
    // Simulate some realistic volatility
    const change = Math.floor(Math.random() * 8000) - 3000;
    baseCashflow += change;

    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      netCashflow: baseCashflow,
      moneyIn: Math.max(0, change + (Math.random() * 2000)),
      moneyOut: Math.min(0, change - (Math.random() * 2000)),
    });
  }
  return data;
};

const mockData = generateMockData();

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

// --- Main Chart Component ---
export default function LedgerChart() {
  return (
    <div className="w-full h-full p-4 relative z-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
            data={mockData} 
            margin={{ top: 20, right: 20, left: 20, bottom: 0 }}
        >
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
          
          <Line
            type="monotone"
            dataKey="netCashflow"
            stroke="#10b981" // Primary Axiom green
            strokeWidth={2}
            dot={false}
            activeDot={<CustomActiveDot />}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
