"use client";

import React from "react";
import { MetricTile } from "@/src/components/ui/MetricTile";
import { cn } from "@/lib/utils";

interface ReportClientProps {
  stats: {
    totalIncome: number;
    totalExpenses: number;
    noi: number;
    personalExpenses: number;
    businessExpenses: number;
  };
}

export default function ReportClient({ stats }: ReportClientProps) {
  const businessRatio = stats.totalExpenses > 0 
    ? (stats.businessExpenses / stats.totalExpenses) * 100 
    : 0;
  
  const personalRatio = stats.totalExpenses > 0 
    ? (stats.personalExpenses / stats.totalExpenses) * 100 
    : 0;

  return (
    <div className="space-y-12">
      {/* METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile 
          label="Total Income" 
          value={`$${stats.totalIncome.toLocaleString()}`} 
          trend="+4.2%" 
          trendDirection="up" 
        />
        <MetricTile 
          label="Total OPEX" 
          value={`$${stats.totalExpenses.toLocaleString()}`} 
          trend="-1.1%" 
          trendDirection="up" 
        />
        <MetricTile 
          label="Net Operating Income" 
          value={`$${stats.noi.toLocaleString()}`} 
          trend="+8.5%" 
          trendDirection="up" 
        />
        <MetricTile 
          label="Arrears" 
          value="$0.00" 
          trend="0.0%" 
          trendDirection="neutral" 
        />
      </div>

      {/* BIFURCATION ENGINE */}
      <div className="border bg-card rounded-[6px] p-8">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-10">
          Expense Distribution // Business vs Personal
        </h3>
        
        <div className="space-y-10">
          {/* VISUALS: CSS PROGRESS BARS */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] uppercase tracking-wider">
              <span className="text-zinc-100">Business Operations</span>
              <span className="text-zinc-400 tabular-nums">{businessRatio.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-[6px] overflow-hidden">
              <div 
                className="h-full bg-zinc-100 transition-all duration-1000 ease-out" 
                style={{ width: `${businessRatio}%` }} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px] uppercase tracking-wider">
              <span className="text-zinc-500">Personal Draw / Non-OPEX</span>
              <span className="text-zinc-400 tabular-nums">{personalRatio.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-[6px] overflow-hidden">
              <div 
                className="h-full bg-zinc-600 transition-all duration-1000 ease-out" 
                style={{ width: `${personalRatio}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-zinc-800/30">
          <div>
            <div className="text-[10px] uppercase text-zinc-600 mb-1">Business Aggregate</div>
            <div className="text-xl font-medium text-zinc-100 tabular-nums">${stats.businessExpenses.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-zinc-600 mb-1">Personal Aggregate</div>
            <div className="text-xl font-medium text-zinc-400 tabular-nums">${stats.personalExpenses.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
