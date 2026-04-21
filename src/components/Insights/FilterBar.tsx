'use client';

import React from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui-finova';
import InsightsDatePicker from '@/components/insights/InsightsDatePicker';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FilterBarProps {
  activeTab: 'overview' | 'money-in' | 'money-out';
  setActiveTab: (tab: any) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
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

  return (
    <div className="w-full">
      <div className="flex justify-between items-center w-full mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center h-8 bg-transparent border border-border rounded-[var(--radius-sm)] p-[2px] ">
            {tabs.map((tab, idx) => (
              <React.Fragment key={tab.id}>
                <div
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "text-mercury-body h-full flex items-center px-4 rounded-[var(--radius-sm)] cursor-pointer transition-all font-normal whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-muted text-white "
                      : "text-clinical-muted hover:text-foreground"
                  )}
                >
                  {tab.label}
                </div>
                {idx === 1 && (
                  <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="w-[1px] h-3 bg-white/10 mx-0.5"></div>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleDownload}
            className="h-8 w-8 flex items-center justify-center p-0 rounded-[var(--radius-sm)] text-clinical-muted bg-transparent border-none"
          >
            [↓]
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <InsightsDatePicker date={dateRange} setDate={setDateRange} />
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleCompare}
            className="h-8 px-4 bg-white/[0.03] border border-border rounded-[var(--radius-sm)] text-mercury-body font-normal text-foreground"
          >
            [+] Compare to
            <span className="text-[10px] ml-1 opacity-70">▼</span>
          </Button>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="w-full flex flex-col mb-6 mt-4">
        <div className="relative w-full h-[60px] flex items-end" ref={trackRef}>
          <div className="absolute bottom-[4px] w-full border-b border-white/10"></div>
          {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((month, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative pointer-events-none">
              <div className="absolute bottom-[4px] left-[16.6%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-[33.3%] w-[1px] h-[4px] bg-white opacity-20.0"></div>
              <div className="absolute bottom-[4px] left-[50.0%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-[66.6%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-[83.3%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-0 w-[1.2px] h-[12px] bg-white"></div>
              <span className="absolute bottom-[16px] left-0 text-mercury-label-caps text-clinical-muted">{month}</span>
              {month === 'Jan' && <span className="absolute bottom-[36px] left-0 text-[16px] font-normal text-white/40 tracking-clinical">2026</span>}
            </div>
          ))}
          <div
            onPointerDown={handlePointerDown}
            style={{ left: `${scrubberState.left}%`, width: `${scrubberState.width}%` }}
            className={cn(
              "absolute bottom-[4px] h-[48px] bg-blue-500/[0.08] border-[1.5px] border-blue-500/[0.6] rounded-[var(--radius-sm)] cursor-grab active:cursor-grabbing transition-all z-10 select-none",
              isDragging ? "bg-blue-500/[0.15] border-blue-500 shadow-[0_0_25px_rgba(96,165,250,0.45)] scale-y-[1.02]" : "hover:bg-blue-500/[0.12] hover:border-blue-500/[0.8] hover:shadow-[0_0_20px_rgba(96,165,250,0.35)]"
            )}
          >
            <span className="absolute top-2 left-2 text-white text-mercury-heading font-normal whitespace-nowrap pointer-events-none">
              {dateRange?.from && dateRange?.to ? `${format(dateRange.from, 'LLL dd')} – ${format(dateRange.to, 'LLL dd')}` : 'Select Range'}
            </span>
            <div onPointerDown={(e) => { e.stopPropagation(); handleLeftDown(e); }} className="absolute top-0 left-0 bottom-0 w-[20px] flex items-center justify-start cursor-col-resize z-20 group">
              <div className="w-[2px] h-[16px] bg-primary opacity-[0.08] group-hover:opacity-100 transition-opacity ml-1 rounded-[var(--radius-sm)]"></div>
            </div>
            <div onPointerDown={(e) => { e.stopPropagation(); handleRightDown(e); }} className="absolute top-0 right-0 bottom-0 w-[20px] flex items-center justify-end cursor-col-resize z-20 group">
              <div className="w-[2px] h-[16px] bg-primary opacity-[0.08] group-hover:opacity-100 transition-opacity mr-1 rounded-[var(--radius-sm)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
