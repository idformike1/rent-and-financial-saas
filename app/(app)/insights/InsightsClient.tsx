'use client';

import React, { useState, useMemo } from 'react';
import InsightsOverview from '@/components/insights/InsightsOverview';
import InsightsMoneyIn from '@/components/insights/InsightsMoneyIn';
import InsightsMoneyOut from '@/components/insights/InsightsMoneyOut';
import InsightsDatePicker from '@/components/insights/InsightsDatePicker';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DateRange } from 'react-day-picker';
import { subMonths, isWithinInterval, parse } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InsightsClientProps {
  netCashflow: number;
  totalIncome: number;
  totalExpense: number;
  chartData: any[];
  runwayNode: React.ReactNode;
  outflowNode: React.ReactNode;
  incomeNode: React.ReactNode;
}

type TabType = 'overview' | 'money-in' | 'money-out';

export default function InsightsClient(props: InsightsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  // --- CLIENT-SIDE FILTERING ENGINE ---
  const filteredData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return props.chartData;

    return props.chartData.filter((item) => {
      try {
        // Parse 'Jan 25' format
        const itemDate = parse(item.date, 'MMM yy', new Date());
        return isWithinInterval(itemDate, { 
          start: dateRange.from!, 
          end: dateRange.to! 
        });
      } catch {
        return true; // Keep "Today" or malformed dates for now
      }
    });
  }, [props.chartData, dateRange]);

  // Recalculate hero metrics based on filtered set
  const metrics = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
      income: acc.income + curr.moneyIn,
      expense: acc.expense + curr.moneyOut,
      net: acc.net + curr.netCashflow
    }), { income: 0, expense: 0, net: 0 });
  }, [filteredData]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'money-in', label: 'Money in' },
    { id: 'money-out', label: 'Money out' },
  ];

  return (
    <div className="min-h-screen bg-[#090A0E] text-white p-8">
      {/* ── CONTROL STRATUM (State Machine) ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        
        {/* Segmented Control */}
        <div className="flex items-center p-1 bg-white/[0.02] border border-white/[0.05] rounded-lg w-fit">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "text-[13px] px-3 py-1 rounded-md cursor-pointer transition-all font-medium tracking-wide",
                activeTab === tab.id 
                  ? "bg-[#2D2E39] text-white shadow-sm" 
                  : "text-[#8A8B94] hover:text-white"
              )}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <InsightsDatePicker date={dateRange} setDate={setDateRange} />
          <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2 font-medium shadow-sm">
            <span>Compare to</span>
            <span className="text-[10px]">▼</span>
          </button>
        </div>
      </div>

      {/* ── CONDITIONAL RENDERING BLOCK ────────────────────────────── */}
      <div className="transition-all duration-300">
        {activeTab === 'overview' && (
          <InsightsOverview 
            {...props} 
            chartData={filteredData}
            netCashflow={metrics.net}
            totalIncome={metrics.income}
            totalExpense={metrics.expense}
          />
        )}
        {activeTab === 'money-in' && <InsightsMoneyIn data={filteredData} />}
        {activeTab === 'money-out' && <InsightsMoneyOut data={filteredData} />}
      </div>
    </div>
  );
}
