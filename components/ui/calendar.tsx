'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-8 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center mb-4',
        caption_label: 'text-sm font-medium text-white',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity text-white'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-[#8A8B94] rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[#5C61E6]/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
        ),
        day: cn(
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-white/10 rounded-md transition-colors'
        ),
        day_range_start: 'day-range-start bg-[#5C61E6] text-white rounded-l-md',
        day_range_end: 'day-range-end bg-[#5C61E6] text-white rounded-r-md',
        day_selected: 'bg-[#5C61E6] text-white hover:bg-[#5C61E6] hover:text-white focus:bg-[#5C61E6] focus:text-white',
        day_today: 'bg-white/5 text-white',
        day_outside: 'text-[#8A8B94]/30 opacity-50',
        day_disabled: 'text-[#8A8B94]/30 opacity-50',
        day_range_middle: 'aria-selected:bg-[#5C61E6]/20 aria-selected:text-white',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
