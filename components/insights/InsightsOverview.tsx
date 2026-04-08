'use client';

import React from 'react';
import LedgerChart from './LedgerChart';

interface InsightsOverviewProps {
  netCashflow: number;
  totalIncome: number;
  totalExpense: number;
  chartData: any[];
  runwayNode: React.ReactNode;
  outflowNode: React.ReactNode;
  incomeNode: React.ReactNode;
}

export default function InsightsOverview({
  netCashflow,
  totalIncome,
  totalExpense,
  chartData,
  runwayNode,
  outflowNode,
  incomeNode
}: InsightsOverviewProps) {
  // --- Mercury Dynamic Color Steering ---
  const primaryColor = netCashflow >= 0 ? '#37CC73' : '#E5697F'; // Green vs Pink

  return (
    <div className="flex flex-col gap-10">
      
      {/* ── HERO METRICS ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-12 mb-0 border-b border-[#2D2E39]/50 pb-8">
        <div className="flex flex-col gap-1">
          <p className="text-[14px] text-white/60 font-medium">Net cashflow</p>
          <p className="text-[40px] font-semibold text-white tracking-tight font-arcadia leading-none">
            {netCashflow < 0 ? '−' : ''}${Math.abs(netCashflow).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[14px] text-white/60 font-medium">Money in</p>
          <p className="text-[36px] font-semibold text-white tracking-tight font-arcadia leading-none">
            +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[14px] text-white/60 font-medium">Money out</p>
          <p className="text-[36px] font-semibold text-white tracking-tight font-arcadia leading-none">
            −${Math.abs(totalExpense).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* ── THE MAIN WORKSTATION GRID ────────────────────────────── */}
      <div className="flex flex-col gap-10">
        {/* Main Chart Area (Top) - UNBOXED for Mercury Parity */}
        <div className="w-full h-[400px] relative overflow-hidden">
          {/* The subtle atmospheric glow stays, but the dotted grid is gone */}
          <div className="absolute inset-0 bg-gradient-radial from-[#6C6C8F]/10 to-transparent opacity-50 blur-2xl"></div>
          <LedgerChart data={chartData} color={primaryColor} />
        </div>

        {/* Narrative Text Block Row (Bottom, Flat layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-2">
          <div className="bg-transparent flex flex-col justify-start">
            <p className="text-[14px] text-white mb-2 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">↘</span> Runway and cash position
            </p>
            <div className="text-[14px] text-[#A1A1AA] leading-relaxed">
              {runwayNode}
            </div>
          </div>

          <div className="bg-transparent flex flex-col justify-start">
            <p className="text-[14px] text-white mb-2 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">↗</span> Money out trends
            </p>
            <div className="text-[14px] text-[#A1A1AA] leading-relaxed">
              {outflowNode}
            </div>
          </div>

          <div className="bg-transparent flex flex-col justify-start">
            <p className="text-[14px] text-white mb-2 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">*</span> Money in trends
            </p>
            <div className="text-[14px] text-[#A1A1AA] leading-relaxed">
              {incomeNode}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
