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
    <div className={cn("w-full overflow-hidden border border-white/5 rounded-[var(--radius)] bg-white/[0.01]", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-10 border-b border-white/10">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-4 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40",
                    column.align === 'right' ? "text-right" : "text-left"
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {data.map((item, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "group hover:bg-brand/[0.04] transition-all duration-300 ease-out",
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
                        "px-4 py-4 text-[13px] text-white/60 group-hover:text-white transition-all duration-300",
                        column.align === 'right' ? "tabular-nums tracking-tight text-right pr-4" : "text-left"
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
    </div>
  );
}
