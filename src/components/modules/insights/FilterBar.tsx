'use client';

import React from 'react';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfYear, subMonths } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/src/components/finova/ui-finova';
import InsightsDatePicker from '@/src/components/finova/insights/InsightsDatePicker';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TimeframeType = 'ALL' | 'YTD' | '12M' | '30D' | 'CUSTOM';

interface FilterBarProps {
  activeTab: 'overview' | 'money-in' | 'money-out';
  setActiveTab: (tab: any) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  selectedTimeframe: TimeframeType;
  setSelectedTimeframe: (tf: TimeframeType) => void;
  aggregation: 'day' | 'month' | 'quarter';
  setAggregation: (agg: any) => void;
  chartType: 'area' | 'bar';
  setChartType: (type: any) => void;
  handleDownload: () => void;
  handleCompare: () => void;
  // Scrubber Props
  scrubberState: { left: number, width: number };
  isDragging: boolean;
  trackRef: React.RefObject<HTMLDivElement | null>;
  handlePointerDown: (e: React.PointerEvent) => void;
  handleLeftDown: (e: React.PointerEvent) => void;
  handleRightDown: (e: React.PointerEvent) => void;
}

export function FilterBar({
  activeTab,
  setActiveTab,
  dateRange,
  setDateRange,
  selectedTimeframe,
  setSelectedTimeframe,
  aggregation,
  setAggregation,
  chartType,
  setChartType,
  handleDownload,
  handleCompare,
  scrubberState,
  isDragging,
  trackRef,
  handlePointerDown,
  handleLeftDown,
  handleRightDown
}: FilterBarProps) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'money-in', label: 'Money in' },
    { id: 'money-out', label: 'Money out' },
  ];

  const timeframes: { id: TimeframeType, label: string }[] = [
    { id: 'ALL', label: 'All Time' },
    { id: 'YTD', label: 'YTD' },
    { id: '12M', label: 'Last 12M' },
    { id: '30D', label: 'Last 30D' },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center w-full mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center h-8 bg-transparent border border-border/10 rounded-[var(--radius-sm)] p-[2px] ">
            {tabs.map((tab, idx) => (
              <React.Fragment key={tab.id}>
                <div
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "text-[11px] h-full flex items-center px-4 rounded-[var(--radius-sm)] cursor-pointer transition-all font-bold uppercase tracking-wider whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-muted text-white "
                      : "text-clinical-muted hover:text-foreground"
                  )}
                >
                  {tab.label}
                </div>
                {idx < tabs.length - 1 && (
                  <div className="w-[1px] h-3 bg-white/5 mx-1"></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="w-[1px] h-3 bg-white/5 mx-0.5"></div>
          
          {/* Timeframe Quick Selector */}
          <div className="flex items-center h-8 bg-transparent border border-border/10 rounded-[var(--radius-sm)] p-[2px] ml-2">
            {timeframes.map((tf, idx) => (
              <React.Fragment key={tf.id}>
                <div
                  onClick={() => setSelectedTimeframe(tf.id)}
                  className={cn(
                    "text-[10px] h-full flex items-center px-3 rounded-[var(--radius-sm)] cursor-pointer transition-all font-bold uppercase tracking-widest whitespace-nowrap",
                    selectedTimeframe === tf.id
                      ? "bg-brand text-white shadow-elevation"
                      : "text-clinical-muted hover:text-foreground"
                  )}
                >
                  {tf.label}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <InsightsDatePicker date={dateRange} setDate={setDateRange} />
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleDownload}
            className="h-8 px-4 bg-white/[0.03] border border-border/10 rounded-[var(--radius-sm)] text-[11px] font-bold uppercase tracking-widest text-clinical-muted hover:text-foreground"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="w-full flex flex-col mb-10 mt-6 group/scrubber">
        <div className="relative w-full h-[70px] flex items-end" ref={trackRef}>
          <div className="absolute bottom-[4px] w-full border-b border-border/10"></div>
          {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((month, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative pointer-events-none">
              <div className="absolute bottom-[4px] left-0 w-[1px] h-[12px] bg-border/20"></div>
              <span className="absolute bottom-[18px] left-2 text-[9px] font-bold uppercase tracking-[0.2em] text-clinical-low">{month}</span>
              {month === 'Jan' && <span className="absolute bottom-[38px] left-2 text-[12px] font-bold text-white/20 tracking-widest">2026</span>}
            </div>
          ))}
          <div
            onPointerDown={handlePointerDown}
            style={{ left: `${scrubberState.left}%`, width: `${scrubberState.width}%` }}
            className={cn(
              "absolute bottom-[4px] h-[54px] bg-brand/[0.04] border-[1.5px] border-brand/40 rounded-[var(--radius-sm)] cursor-grab active:cursor-grabbing transition-all z-10 select-none",
              isDragging ? "bg-brand/[0.12] border-brand shadow-elevation scale-y-[1.04]" : "hover:bg-brand/[0.08] hover:border-brand/60"
            )}
          >
            <div className="absolute -top-7 left-0 right-0 flex justify-center opacity-0 group-hover/scrubber:opacity-100 transition-opacity pointer-events-none">
              <span className="text-[10px] font-bold text-brand bg-card px-2 py-1 rounded border border-brand/20 shadow-elevation whitespace-nowrap">
                {dateRange?.from && dateRange?.to ? `${format(dateRange.from, 'MMM dd, yyyy')} – ${format(dateRange.to, 'MMM dd, yyyy')}` : 'Select Range'}
              </span>
            </div>
            
            <div onPointerDown={(e) => { e.stopPropagation(); handleLeftDown(e); }} className="absolute top-0 left-0 bottom-0 w-[16px] flex items-center justify-center cursor-col-resize z-20 group/handle">
              <div className="w-[1.5px] h-[20px] bg-brand/40 group-hover/handle:bg-brand transition-colors rounded-full"></div>
            </div>
            <div onPointerDown={(e) => { e.stopPropagation(); handleRightDown(e); }} className="absolute top-0 right-0 bottom-0 w-[16px] flex items-center justify-center cursor-col-resize z-20 group/handle">
              <div className="w-[1.5px] h-[20px] bg-brand/40 group-hover/handle:bg-brand transition-colors rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
