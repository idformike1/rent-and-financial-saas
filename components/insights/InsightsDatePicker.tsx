'use client';

import * as React from 'react';
import { 
  format, startOfYear, subMonths, startOfMonth, 
  endOfMonth, startOfQuarter, endOfQuarter, 
  eachMonthOfInterval, startOfToday 
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, LayoutGrid, Calendar as CalendarDays } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui-finova';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface InsightsDatePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export default function InsightsDatePicker({
  date,
  setDate,
}: InsightsDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: endOfMonth(new Date())
  });

  const quarters = [
    { label: 'Q1', start: new Date(new Date().getFullYear(), 0, 1), end: new Date(new Date().getFullYear(), 2, 31) },
    { label: 'Q2', start: new Date(new Date().getFullYear(), 3, 1), end: new Date(new Date().getFullYear(), 5, 30) },
    { label: 'Q3', start: new Date(new Date().getFullYear(), 6, 1), end: new Date(new Date().getFullYear(), 8, 30) },
    { label: 'Q4', start: new Date(new Date().getFullYear(), 9, 1), end: new Date(new Date().getFullYear(), 11, 31) },
  ];

  const applyRange = (from: Date, to: Date, instant = false) => {
    setDate({ from, to });
    if (instant) setOpen(false);
  };

  const handlePresetClick = (preset: string) => {
    const today = startOfToday();
    if (preset === 'all') {
      applyRange(new Date(2024, 0, 1), today, true);
    } else if (preset === 'ytd') {
      applyRange(startOfYear(today), today, true);
    } else if (preset === 'last-month') {
      const prevMonth = subMonths(today, 1);
      applyRange(startOfMonth(prevMonth), endOfMonth(prevMonth), true);
    }
  };

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-8 px-2 gap-2 text-sm font-normal text-white/60 hover:text-white transition-all shadow-none",
              !date && "text-white/20"
            )}
          >
            <CalendarIcon size={14} className="opacity-70" />
            <span className="whitespace-nowrap">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "MMM dd")} – {format(date.to, "MMM dd")}
                  </>
                ) : (
                  format(date.from, "MMM dd, y")
                )
              ) : (
                "Select Period"
              )}
            </span>
            <ChevronDown size={12} className="opacity-30" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 flex flex-col bg-[#161821]/95 border-white/10 backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden" 
          align="start"
          sideOffset={12}
        >
          {/* Top Header Area */}
          <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/[0.01]">
             <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-3">Fiscal Period Selector</p>
             <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mr-2">Workstation V.3.3</p>
          </div>

          <div className="flex flex-row">
            {/* Left Column: Presets */}
            <div className="w-[160px] border-r border-white/5 p-2 flex flex-col gap-1 bg-white/[0.005]">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold px-3 py-2">Quick Pick</p>
              {['all', 'ytd', 'last-month'].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePresetClick(p)}
                  className="text-left px-3 py-2 text-sm text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-all font-normal"
                >
                  {p === 'all' ? 'Full Ledger' : p === 'ytd' ? 'Year to Date' : 'Last Month'}
                </button>
              ))}
            </div>

            {/* Right Column: Months & Quarters */}
            <div className="p-4 min-w-[340px]">
              <div className="space-y-6 py-2">
                <div className="space-y-3">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">2026 Quarters</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quarters.map((q) => (
                      <Button 
                        key={q.label}
                        variant="ghost" 
                        onClick={() => applyRange(q.start, q.end, true)}
                        className={cn(
                          "h-10 justify-start px-4 text-sm font-normal border border-white/5 bg-white/[0.01] hover:bg-white/[0.05]",
                          date?.from && format(date.from, 'M') === format(q.start, 'M') && "bg-white/10 text-white"
                        )}
                      >
                        {q.label} ({format(q.start, 'MMM')} - {format(q.end, 'MMM')})
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">2026 Months</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, idx) => {
                      const monthDate = new Date(new Date().getFullYear(), idx, 1);
                      return (
                        <Button 
                          key={m}
                          variant="ghost" 
                          onClick={() => applyRange(startOfMonth(monthDate), endOfMonth(monthDate), true)}
                          className={cn(
                            "h-10 text-sm font-normal border border-white/5 bg-white/[0.01] hover:bg-white/[0.05]",
                            date?.from && isSameMonth(monthDate, date.from) && "bg-white/10 text-white"
                          )}
                        >
                          {m}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function isSameMonth(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}
