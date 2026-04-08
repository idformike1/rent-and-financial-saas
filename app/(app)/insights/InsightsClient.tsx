'use client';

import React, { useState, useMemo } from 'react';
import InsightsOverview from '@/components/insights/InsightsOverview';
import InsightsMoneyIn from '@/components/insights/InsightsMoneyIn';
import InsightsMoneyOut from '@/components/insights/InsightsMoneyOut';
import InsightsDatePicker from '@/components/insights/InsightsDatePicker';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DateRange } from 'react-day-picker';
import { subMonths, isWithinInterval, parse, format, differenceInDays, addDays, startOfDay } from 'date-fns';
import { generateRunwayNarrative, generateIncomeNarrative, generateOutflowNarrative } from './semanticGenerator';

const TIMELINE_START = new Date(2025, 4, 1);
const TIMELINE_END = new Date(2026, 4, 1);
const TOTAL_DAYS = differenceInDays(TIMELINE_END, TIMELINE_START);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InsightsClientProps {
  chartData: any[];
  entries: any[];
  totalAssets: number;
}

type TabType = 'overview' | 'money-in' | 'money-out';

export default function InsightsClient(props: InsightsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  const scrubberState = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return { left: 0, width: 100 };
    const leftDays = differenceInDays(startOfDay(dateRange.from), TIMELINE_START);
    const rangeDays = differenceInDays(startOfDay(dateRange.to), startOfDay(dateRange.from));
    return {
      left: Math.max(0, (leftDays / TOTAL_DAYS) * 100),
      width: Math.min(100, (rangeDays / TOTAL_DAYS) * 100)
    };
  }, [dateRange]);

  const updateFromPercentages = (newLeft: number, newWidth: number) => {
    const from = addDays(TIMELINE_START, Math.round((newLeft / 100) * TOTAL_DAYS));
    const to = addDays(from, Math.round((newWidth / 100) * TOTAL_DAYS));
    setDateRange({ from, to });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const initialLeft = scrubberState.left;

    const onMove = (moveEvent: PointerEvent) => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.getBoundingClientRect().width;
      const deltaX = moveEvent.clientX - startX;
      let newLeft = initialLeft + (deltaX / trackWidth) * 100;
      newLeft = Math.max(0, Math.min(newLeft, 100 - scrubberState.width));
      updateFromPercentages(newLeft, scrubberState.width);
    };

    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const handleLeftDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const startX = e.clientX;
    const initialLeft = scrubberState.left;
    const initialWidth = scrubberState.width;

    const onMove = (moveEvent: PointerEvent) => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.getBoundingClientRect().width;
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / trackWidth) * 100;

      let newLeft = initialLeft + deltaPercent;
      let newWidth = initialWidth - deltaPercent;

      if (newWidth < 5) {
        newLeft = initialLeft + initialWidth - 5;
        newWidth = 5;
      }
      if (newLeft < 0) {
        newWidth = initialWidth + initialLeft;
        newLeft = 0;
      }
      updateFromPercentages(newLeft, newWidth);
    };

    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const handleRightDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const startX = e.clientX;
    const initialLeft = scrubberState.left;
    const initialWidth = scrubberState.width;

    const onMove = (moveEvent: PointerEvent) => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.getBoundingClientRect().width;
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / trackWidth) * 100;

      let newWidth = initialWidth + deltaPercent;

      if (newWidth < 5) newWidth = 5;
      if (initialLeft + newWidth > 100) {
        newWidth = 100 - initialLeft;
      }
      updateFromPercentages(initialLeft, newWidth);
    };

    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  // --- CLIENT-SIDE FILTERING ENGINE ---
  const filteredData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return props.chartData;
    return props.chartData.filter((item) => {
      try {
        const itemDate = parse(item.date, 'MMM yy', new Date());
        return isWithinInterval(itemDate, { start: dateRange.from!, end: dateRange.to! });
      } catch { return true; }
    });
  }, [props.chartData, dateRange]);

  const filteredEntries = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return props.entries;
    return props.entries.filter((entry) => {
      try {
        const itemDate = new Date(entry.transactionDate);
        return isWithinInterval(itemDate, { start: dateRange.from!, end: dateRange.to! });
      } catch { return true; }
    });
  }, [props.entries, dateRange]);

  // Recalculate hero metrics based on exact math: Net = Income - Math.abs(Expense)
  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredEntries.forEach(e => {
      if (e.account?.category === "INCOME") income += Math.abs(e.amount);
      if (e.account?.category === "EXPENSE") expense += Math.abs(e.amount);
    });
    return { income, expense, net: income - expense };
  }, [filteredEntries]);

  const activeMonths = filteredData.length > 0 ? filteredData.length : 1;
  const burnRate = metrics.expense / activeMonths;

  const semanticNodes = useMemo(() => ({
    runway: generateRunwayNarrative(burnRate, props.totalAssets),
    income: generateIncomeNarrative(metrics.income, filteredEntries),
    outflow: generateOutflowNarrative(metrics.expense, filteredEntries)
  }), [burnRate, props.totalAssets, metrics, filteredEntries]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'money-in', label: 'Money in' },
    { id: 'money-out', label: 'Money out' },
  ];

  return (
    <div className="pt-8 pb-16 px-8 max-w-[1280px] mx-auto w-full">
      {/* ── CONTEXT RESTORATION (Page Identity) ── */}
      <h1 className="text-[24px] font-normal text-[#F4F5F9] mb-6 flex items-center gap-3 tracking-tight font-arcadia">
        Insights
        <button className="text-[10px] px-2 py-[2px] bg-white/[0.04] border border-white/5 hover:bg-white/10 transition-colors rounded-[4px] text-[#F4F5F9]/70 font-sans tracking-normal font-normal flex items-center mt-[4px]">
          Share feedback
        </button>
      </h1>

      {/* ── CONTROL STRATUM (State Machine) ────────────────────────────────── */}
      <div className="flex justify-between items-center w-full mb-2">
        {/* Segmented Control */}
        <div className="flex items-center gap-2">
          <div className="flex items-center h-8 bg-transparent border border-[#2D2E39] rounded-[8px] p-[2px] shadow-sm">
            {tabs.map((tab, idx) => (
              <React.Fragment key={tab.id}>
                <div
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "text-[14px] leading-none h-full flex items-center px-4 rounded-[6px] cursor-pointer transition-all font-normal whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-[#2D2E39] text-white shadow-sm"
                      : "text-[#8A8B94] hover:text-[#F4F5F9]"
                  )}
                >
                  {tab.label}
                </div>
                {/* Divider logic: only between Money in and Money out as per screenshot */}
                {idx === 1 && (
                  <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="w-[1px] h-3 bg-white/10 mx-0.5"></div>
          <button className="h-8 w-8 flex items-center justify-center rounded-[8px] hover:bg-white/5 text-[#8A8B94] transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <InsightsDatePicker date={dateRange} setDate={setDateRange} />
          <button className="h-8 px-4 bg-white/[0.03] border border-[#2D2E39] rounded-[8px] text-[15px] leading-[24px] font-normal text-[#F4F5F9] hover:bg-white/5 hover:text-white transition flex items-center gap-2 shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Compare to</span>
            <span className="text-[10px] ml-1 opacity-70">▼</span>
          </button>
        </div>
      </div>

      {/* ── TIMELINE SCRUBBER (Horizontal Visual Context) ── */}
      <div className="w-full flex flex-col mb-6 mt-4">
        <div className="relative w-full h-[60px] flex items-end" ref={trackRef}>
          {/* Base track line - Subdued Opacity */}
          <div className="absolute bottom-[4px] w-full border-b border-white/10"></div>

          {/* Render months evenly spaced */}
          {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((month, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative pointer-events-none">
              {/* 5 small equidistant lines (White) */}
              <div className="absolute bottom-[4px] left-[16.6%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-[33.3%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-[50.0%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-[66.6%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-[83.3%] w-[1px] h-[4px] bg-white opacity-20"></div>

              {/* BIG TICK mark at month START */}
              <div className="absolute bottom-[4px] left-0 w-[1.2px] h-[12px] bg-white"></div>

              {/* Label Aligned to Day 1 tick */}
              <span className="absolute bottom-[16px] left-0 text-[11px] font-normal text-[#8A8B94]">{month}</span>

              {/* Year text aligned to January START, closer to month labels */}
              {month === 'Jan' && (
                <span className="absolute bottom-[36px] left-0 text-[16px] font-normal text-white/40 tracking-tight">2026</span>
              )}
            </div>
          ))}

          {/* Highlight Scrubber Box overlaid */}
          <div
            onPointerDown={handlePointerDown}
            style={{ left: `${scrubberState.left}%`, width: `${scrubberState.width}%` }}
            className={cn(
              "absolute bottom-[4px] h-[48px] bg-[#5063F4]/15 border border-[#5063F4]/60 rounded-[4px] cursor-grab active:cursor-grabbing transition-[background-color,border-color] z-10 select-none backdrop-blur-[1px]",
              isDragging ? "bg-[#5063F4]/25" : "hover:bg-[#5063F4]/20"
            )}
          >
            {/* Date Text - Top Left Aligned */}
            <span className="absolute top-2 left-2 text-white text-[16px] font-normal whitespace-nowrap pointer-events-none tracking-tight leading-none drop-shadow-sm">
              {dateRange?.from && dateRange?.to ? (
                `${format(dateRange.from, 'LLL dd')} – ${format(dateRange.to, 'LLL dd')}`
              ) : (
                'Select Range'
              )}
            </span>

            {/* Dual Axis Interactive Handles - INCREASED HIT AREA TO 20px */}
            <div
              onPointerDown={(e) => { e.stopPropagation(); handleLeftDown(e); }}
              className="absolute top-0 left-0 bottom-0 w-[20px] flex items-center justify-start cursor-col-resize z-20 group"
            >
              <div className="w-[2px] h-[16px] bg-[#5063F4] opacity-40 group-hover:opacity-100 transition-opacity ml-1 rounded-full"></div>
            </div>

            <div
              onPointerDown={(e) => { e.stopPropagation(); handleRightDown(e); }}
              className="absolute top-0 right-0 bottom-0 w-[20px] flex items-center justify-end cursor-col-resize z-20 group"
            >
              <div className="w-[2px] h-[16px] bg-[#5063F4] opacity-40 group-hover:opacity-100 transition-opacity mr-1 rounded-full"></div>
            </div>
          </div>
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
            runwayNode={semanticNodes.runway}
            incomeNode={semanticNodes.income}
            outflowNode={semanticNodes.outflow}
          />
        )}
        {activeTab === 'money-in' && <InsightsMoneyIn data={filteredData} entries={filteredEntries} />}
        {activeTab === 'money-out' && <InsightsMoneyOut data={filteredData} entries={filteredEntries} />}
      </div>
    </div>
  );
}
