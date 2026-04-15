"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface InsightsDatePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
}

export default function InsightsDatePicker({ 
  date, 
  setDate, 
  className 
}: InsightsDatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handlePresetClick = (preset: string) => {
    const today = new Date()
    let from: Date | undefined
    let to: Date | undefined
    
    switch (preset) {
      case 'all':
        from = new Date(2024, 0, 1) // Ledger start
        to = today
        break
      case 'today':
        from = today
        to = today
        break
      case 'prev-month':
        from = startOfMonth(subMonths(today, 1))
        to = endOfMonth(subMonths(today, 1))
        break
      case '30-days':
        from = subDays(today, 30)
        to = today
        break
      case 'ytd':
        from = startOfYear(today)
        to = today
        break
    }
    
    if (from && to) {
      setDate({ from, to })
      setOpen(false)
    }
  }

  return (
    <div className={cn("w-fit", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
               "h-8 gap-2 text-sm font-normal px-2 text-white/60 hover:text-white transition-all",
               !date && "text-white/20"
            )}
          >
            <CalendarIcon size={14} className="opacity-70" />
            <span className="whitespace-nowrap">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                "Pick a date"
              )}
            </span>
            <ChevronDown size={12} className="opacity-30" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 flex flex-row bg-popover border-white/10 backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden" 
          align="start"
          sideOffset={8}
        >
          {/* Left Column: Preset Tabs */}
          <div className="w-[140px] border-r border-white/5 p-2 flex flex-col gap-1 bg-white/[0.005]">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold px-3 py-2 mt-1">Quick Pick</p>
            {[
              { id: 'all', label: 'All Activity' },
              { id: 'today', label: 'Today' },
              { id: '30-days', label: 'Last 30 Days' },
              { id: 'prev-month', label: 'Prev Month' },
              { id: 'ytd', label: 'Year to Date' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetClick(p.id)}
                className="text-left px-3 py-1.5 text-[12px] text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-all font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>

          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            className="bg-transparent text-white p-3"
            classNames={{
              nav_button: "h-7 w-7 bg-white/5 hover:bg-white/10 text-white rounded-md transition-all",
              caption_label: "text-sm font-semibold tracking-tight text-white",
              head_cell: "text-white/20 font-bold text-[11px] uppercase p-2 w-9",
              day: "h-9 w-9 text-sm font-medium hover:bg-white/5 rounded-md transition-all transition-colors",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
