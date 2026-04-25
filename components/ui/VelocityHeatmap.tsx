"use client";

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  ComposedChart,
  Line,
  Area
} from 'recharts';

interface VelocityHeatmapProps {
  data: {
    totalBilled: number;
    collected: number;
    remaining: number;
    velocityPercentage: number;
  };
}

/**
 * VELOCITY HEATMAP (AXIOM ANALYTICAL MATRIX)
 * 
 * A high-precision visualization for tracking billing cycle performance.
 * Aesthetic: Monochromatic base with clinical accent colors (Emerald/Amber/Slate).
 * Features custom tooltips and responsive dimensional scaling.
 */
const VelocityHeatmap: React.FC<VelocityHeatmapProps> = ({ data }) => {
  // Normalize data for composed chart visualization
  const chartData = [
    {
      name: 'Batch Performance',
      billed: data.totalBilled,
      collected: data.collected,
      remaining: data.remaining,
      velocity: data.velocityPercentage
    }
  ];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="w-full h-[350px] bg-zinc-950/30 rounded-xl border border-white/5 p-6 backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Collection Velocity</h3>
          <p className="text-2xl font-mono font-bold text-zinc-100">{data.velocityPercentage.toFixed(1)}%</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-400">Collected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-400">Remaining</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barSize={40}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} vertical={true} />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          
          <Tooltip
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-zinc-900 border border-white/10 p-4 rounded-lg shadow-2xl backdrop-blur-xl">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Cycle Metrics</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between space-x-8">
                        <span className="text-[11px] text-zinc-400">Gross Billed</span>
                        <span className="text-[11px] font-mono font-bold text-zinc-100">{formatCurrency(data.totalBilled)}</span>
                      </div>
                      <div className="flex justify-between space-x-8">
                        <span className="text-[11px] text-emerald-400">Liquidated</span>
                        <span className="text-[11px] font-mono font-bold text-emerald-400">{formatCurrency(data.collected)}</span>
                      </div>
                      <div className="flex justify-between space-x-8 border-t border-white/5 pt-1 mt-1">
                        <span className="text-[11px] text-zinc-500">Outstanding</span>
                        <span className="text-[11px] font-mono font-bold text-zinc-300">{formatCurrency(data.remaining)}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <Bar dataKey="collected" stackId="a" fill="#10b981" radius={[4, 0, 0, 4]} />
          <Bar dataKey="remaining" stackId="a" fill="#3f3f46" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VelocityHeatmap;
