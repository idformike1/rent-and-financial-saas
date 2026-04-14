'use client';

import * as React from 'react';
import { 
  format, startOfYear, subMonths, startOfMonth, 
  endOfMonth, startOfQuarter, endOfQuarter, 
  eachMonthOfInterval, startOfToday, subDays 
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
    } else if (preset === 'today') {
      applyRange(today, today, true);
    } else if (preset === '7-days') {
      applyRange(subDays(today, 6), today, true);
    } else if (preset === '30-days') {
      applyRange(subDays(today, 29), today, true);
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
              "h-8 px-2.5 gap-2 text-sm font-normal text-white/60 hover:text-white transition-all shadow-none",
              !date && "text-white/20"
            )}
          >
            <CalendarIcon size={14} className="opacity-70" />
            <span className="whitespace-nowrap">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                "Select Period"
              )}
            </span>
            <ChevronDown size={12} className="opacity-30" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 flex flex-col bg-[#161821] border-white/10 backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden" 
          align="start"
          sideOffset={12}
        >
          {/* Top Header Area */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/[0.01]">
             <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Fiscal Period Selector</p>
             <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Workstation V.3.3</p>
          </div>

          <div className="flex flex-row">
            {/* Left Column: Presets */}
            <div className="w-[140px] border-r border-white/5 p-2 flex flex-col gap-1 bg-white/[0.005] shrink-0">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold px-3 py-2">Quick Pick</p>
              {['all', 'today', '7-days', '30-days', 'ytd', 'last-month'].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePresetClick(p)}
                  className="text-left px-3 py-2 text-[12px] text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-all font-normal"
                >
                  {p === 'all' ? 'Full Ledger' : 
                   p === 'today' ? 'Today' : 
                   p === '7-days' ? 'Last 7 Days' : 
                   p === '30-days' ? 'Last 30 Days' : 
                   p === 'ytd' ? 'Year to Date' : 
                   'Last Month'}
                </button>
              ))}
            </div>

            {/* Right Column: Calendar (Custom Range) */}
            <div className="p-3 bg-white/[0.002] flex items-center justify-center">
               <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(newRange) => {
                  if (newRange?.from && newRange?.to) {
                    applyRange(newRange.from, newRange.to, true);
                  } else if (newRange?.from) {
                    setDate(newRange);
                  } else {
                    setDate(undefined);
                  }
                }}
                numberOfMonths={2}
                className="bg-transparent text-white"
                classNames={{
                  nav_button: "h-7 w-7 bg-white/5 hover:bg-white/10 text-white rounded-md transition-all",
                  caption_label: "text-sm font-semibold tracking-tight text-white",
                  head_cell: "text-white/20 font-bold text-[11px] uppercase p-2 w-9",
                  day: "h-9 w-9 text-sm font-medium hover:bg-white/5 rounded-md transition-all transition-colors",
                }}
              />
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
