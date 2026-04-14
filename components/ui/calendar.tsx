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
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
          '[&:has([aria-selected])]:bg-sky-500/10',
          '[&:has([aria-selected].day-range-start)]:rounded-l-full',
          '[&:has([aria-selected].day-range-end)]:rounded-r-full',
          'first:[&:has([aria-selected])]:rounded-l-full',
          'last:[&:has([aria-selected])]:rounded-r-full'
        ),
        day: cn(
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-white/5 rounded-md transition-all'
        ),
        day_range_start: 'day-range-start !bg-sky-500 !text-black !rounded-full !opacity-100 z-30 relative',
        day_range_end: 'day-range-end !bg-sky-500 !text-black !rounded-full !opacity-100 z-30 relative',
        day_selected: '!bg-sky-500 !text-black hover:!bg-sky-500 hover:!text-black focus:!bg-sky-500 focus:!text-black !opacity-100 !rounded-full',
        day_today: 'bg-white/10 text-white',
        day_outside: 'text-[#8A8B94]/30 opacity-50',
        day_disabled: 'text-[#8A8B94]/30 opacity-50',
        day_range_middle: '!bg-transparent !text-sky-400 !rounded-none',
        day_hidden: 'invisible',
        ...classNames,
      }}
      modifiers={{
        weekend: { dayOfWeek: [0, 6] }
      }}
      modifiersClassNames={{
        weekend: "!text-sky-400 font-semibold"
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 text-white/40 hover:text-white transition-colors" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 text-white/40 hover:text-white transition-colors" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
