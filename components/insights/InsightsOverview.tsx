'use client';

import React from 'react';
import LedgerChart from './LedgerChart';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  const [chartType, setChartType] = React.useState<'area' | 'bar'>('area');
  // --- Mercury Dynamic Color Steering ---
  const primaryColor = netCashflow >= 0 ? '#37CC73' : '#E5697F'; // Green vs Pink

  const formatValue = (val: number, forceCompact?: boolean) => {
    const absVal = Math.abs(val);
    
    // If it's over 1M, always compact to prevent total layout destruction
    if (absVal >= 1000000) {
      return Math.round(absVal / 1000).toLocaleString('en-US') + 'K';
    }

    // Otherwise, we provide both versions for CSS-based toggling
    return {
      full: absVal.toLocaleString('en-US', { minimumFractionDigits: 0 }),
      compact: Math.round(absVal / 1000).toLocaleString('en-US') + 'K'
    };
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* ── HERO METRICS ─────────────────────────────────────────── */}
      <div className="flex flex-col mb-8 border-b border-[#2D2E39]/50 pb-8">
        <div className="flex flex-row items-end flex-wrap">
          
          {/* COLUMN 1: Net Cashflow (Alpha) */}
          <div className="flex flex-col mr-[144px]">
            <p className="text-[15px] leading-[24px] font-normal text-[#F4F5F9] mb-2 font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Net cashflow</p>
            <p 
              className="text-[38px] text-white tracking-[-0.02em] leading-[42px] flex items-baseline"
              style={{ fontFamily: '"Arcadia Display", system-ui, sans-serif', fontWeight: 480 }}
            >
              {netCashflow < 0 ? '−' : ''}${typeof formatValue(netCashflow) === 'string' 
                ? formatValue(netCashflow) as string
                : (
                  <>
                    <span className="hidden xl:inline">{(formatValue(netCashflow) as any).full}</span>
                    <span className="xl:hidden">{(formatValue(netCashflow) as any).compact}</span>
                  </>
                )
              }
            </p>
          </div>

          {/* COLUMN 2: Money In (Beta) */}
          <div className="flex flex-col mr-12 md:pb-0.5">
            <p className="text-[15px] leading-[24px] font-normal text-[#F4F5F9] mb-[4px] font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Money in</p>
            <p 
              className="text-[24px] text-white tracking-[-0.01em] leading-[28px]"
              style={{ fontFamily: '"Arcadia Text", system-ui, sans-serif', fontWeight: 480 }}
            >
              +${typeof formatValue(totalIncome) === 'string'
                ? formatValue(totalIncome) as string
                : (
                  <>
                    <span className="hidden xl:inline">{(formatValue(totalIncome) as any).full}</span>
                    <span className="xl:hidden">{(formatValue(totalIncome) as any).compact}</span>
                  </>
                )
              }
            </p>
          </div>

          {/* COLUMN 3: Money Out (Gamma) */}
          <div className="flex flex-row flex-1 justify-between items-end md:pb-0.5">
            <div className="flex flex-col">
              <p className="text-[15px] leading-[24px] font-normal text-[#F4F5F9] mb-[4px] font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Money out</p>
              <p 
                className="text-[24px] text-white tracking-[-0.01em] leading-[28px]"
                style={{ fontFamily: '"Arcadia Text", system-ui, sans-serif', fontWeight: 480 }}
              >
                −${typeof formatValue(totalExpense) === 'string'
                  ? formatValue(totalExpense) as string
                  : (
                    <>
                      <span className="hidden xl:inline">{(formatValue(totalExpense) as any).full}</span>
                      <span className="xl:hidden">{(formatValue(totalExpense) as any).compact}</span>
                    </>
                  )
                }
              </p>
            </div>

            {/* CHART CONTROLS */}
            <div className="hidden lg:flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 h-8 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-[15px] leading-[24px] font-normal transition-colors text-[#F4F5F9]">
                Month <span className="text-[10px] opacity-70">▼</span>
              </button>
              <div className="flex p-1 bg-white/5 border border-white/5 rounded-lg h-8 items-center">
                <button 
                  onClick={() => setChartType('area')}
                  className={cn(
                    "h-full px-2.5 transition-all rounded-[6px] flex items-center justify-center",
                    chartType === 'area' ? "bg-[#2D2E39] border border-white/10 text-white shadow-sm" : "text-[#8A8B94] hover:text-white border border-transparent"
                  )} 
                  aria-label="Area Chart"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </button>
                <button 
                  onClick={() => setChartType('bar')}
                  className={cn(
                    "h-full px-2.5 transition-all rounded-[6px] flex items-center justify-center",
                    chartType === 'bar' ? "bg-[#2D2E39] border border-white/10 text-white shadow-sm" : "text-[#8A8B94] hover:text-white border border-transparent"
                  )} 
                  aria-label="Bar Chart"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── THE MAIN WORKSTATION GRID ────────────────────────────── */}
      <div className="flex flex-col gap-10">
        {/* Main Chart Area (Top) - UNBOXED for Mercury Parity */}
        <div className="w-full h-[400px] relative overflow-hidden">
          {/* The subtle atmospheric glow stays, but the dotted grid is gone */}
          <div className="absolute inset-0 bg-gradient-radial from-[#6C6C8F]/10 to-transparent opacity-50 blur-2xl"></div>
          <LedgerChart data={chartData} color={primaryColor} type={chartType} />
        </div>

        {/* Narrative Text Block Row (Bottom, Flat layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-2">
          <div className="bg-transparent flex flex-col justify-start">
            <p className="text-[15px] leading-[24px] font-normal text-[#F4F5F9] mb-3 flex items-center gap-2">
              <span className="text-[#9D9DA8]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 9 8 12 2 12"></polyline></svg></span> Runway and cash position
            </p>
            <div className="text-[15px] leading-[24px] font-normal text-[#C3C3CC]">
              {runwayNode}
            </div>
          </div>

          <div className="bg-transparent flex flex-col justify-start">
            <p className="text-[15px] leading-[24px] font-normal text-[#F4F5F9] mb-3 flex items-center gap-2">
              <span className="text-[#E5697F]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path><polyline points="15,9 18,9 18,11"></polyline><path d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2v0"></path></svg></span> Money out trends
            </p>
            <div className="text-[15px] leading-[24px] font-normal text-[#C3C3CC]">
              {outflowNode}
            </div>
          </div>

          <div className="bg-transparent flex flex-col justify-start">
            <p className="text-[15px] leading-[24px] font-normal text-[#F4F5F9] mb-3 flex items-center gap-2">
               <span className="text-[#37CC73]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span> Money in trends
            </p>
            <div className="text-[15px] leading-[24px] font-normal text-[#C3C3CC]">
              {incomeNode}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
