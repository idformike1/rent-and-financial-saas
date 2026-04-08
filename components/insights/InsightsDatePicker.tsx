'use client';

import * as React from 'react';
import { format, startOfYear, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
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
  const presets = [
    { label: 'All time', value: 'all' },
    { label: 'Year to date', value: 'ytd' },
    { label: 'Last month', value: 'last-month' },
    { label: 'Custom', value: 'custom' },
  ];

  const handlePresetClick = (preset: string) => {
    const today = new Date();
    if (preset === 'all') {
      setDate({ from: new Date(2024, 0, 1), to: today });
    } else if (preset === 'ytd') {
      setDate({ from: startOfYear(today), to: today });
    } else if (preset === 'last-month') {
      const prevMonth = subMonths(today, 1);
      setDate({ from: startOfMonth(prevMonth), to: endOfMonth(prevMonth) });
    }
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            id="date"
            className={cn(
              "px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2 font-medium shadow-sm",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-0 h-3.5 w-3.5" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
            <span className="text-[10px] ml-1">▼</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex flex-row bg-[#161821] border-[#2D2E39]" align="end">
          {/* Left Column: Presets */}
          <div className="w-[160px] border-r border-[#2D2E39] p-2 flex flex-col gap-1">
            <p className="text-[11px] text-[#8A8B94] uppercase tracking-widest p-2 mb-1">Range</p>
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePresetClick(p.value)}
                className="text-left px-3 py-2 text-[13px] text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-md transition-all font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Right Column: Calendar */}
          <div className="p-2">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
