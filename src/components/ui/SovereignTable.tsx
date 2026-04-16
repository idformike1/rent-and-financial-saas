'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  align?: 'left' | 'right';
}

interface SovereignTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  getRowClassName?: (item: T) => string;
  className?: string;
}

export function SovereignTable<T>({
  data,
  columns,
  onRowClick,
  getRowClassName,
  className,
}: SovereignTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto border border-zinc-800/50 rounded-[6px] bg-zinc-950/20", className)}>
      <table className="w-full border-collapse">
        <thead className="bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-10">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                className={cn(
                  "px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/50",
                  column.align === 'right' ? "text-right" : "text-left"
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "group border-b border-zinc-800/30 hover:bg-zinc-900/60 transition-colors duration-200 ease-in-out",
                onRowClick ? "cursor-pointer" : "",
                getRowClassName?.(item)
              )}
            >
              {columns.map((column, colIdx) => {
                const content = typeof column.accessor === 'function' 
                  ? column.accessor(item) 
                  : (item[column.accessor] as React.ReactNode);

                return (
                  <td
                    key={colIdx}
                    className={cn(
                      "px-4 py-3 text-[13px] text-zinc-400 group-hover:text-zinc-100 transition-colors duration-200",
                      column.align === 'right' ? "tabular-nums tracking-tight text-right" : "text-left"
                    )}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
