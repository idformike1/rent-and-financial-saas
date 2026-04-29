'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Card } from './Card'

/**
 * AXIOM SYSTEM: DATA TABLE
 * A highly capable, unified table system supporting both configuration-driven
 * and composition-based patterns with institutional typography.
 */

// --- TYPES ---

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  align?: 'left' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  getRowClassName?: (item: T) => string;
  className?: string;
}

// --- HIGH-LEVEL COMPONENT ---

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  getRowClassName,
  className,
}: DataTableProps<T>) {
  return (
    <TableContainer className={className}>
      <Table>
        <THead>
          <TR isHeader>
            {columns.map((column, idx) => (
              <TD
                key={idx}
                isHeader
                className={cn(
                  column.align === 'right' ? "text-right" : "text-left",
                  column.className
                )}
              >
                {column.header}
              </TD>
            ))}
          </TR>
        </THead>
        <TBody>
          {data.map((item, rowIdx) => (
            <TR
              key={rowIdx}
              onClick={() => onRowClick?.(item)}
              className={cn(
                onRowClick ? "cursor-pointer" : "",
                getRowClassName?.(item)
              )}
            >
              {columns.map((column, colIdx) => {
                const content = typeof column.accessor === 'function' 
                  ? column.accessor(item) 
                  : (item[column.accessor] as React.ReactNode);

                return (
                  <TD
                    key={colIdx}
                    className={cn(
                      column.align === 'right' ? "text-right tabular-nums" : "text-left",
                      column.className
                    )}
                  >
                    {content}
                  </TD>
                );
              })}
            </TR>
          ))}
        </TBody>
      </Table>
    </TableContainer>
  );
}

// --- LOW-LEVEL COMPONENTS (COMPOSITION) ---

export function TableContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("p-0 overflow-hidden bg-transparent border-white/[0.08]", className)} variant="outline">
      <div className="overflow-x-auto">
        {children}
      </div>
    </Card>
  )
}

export function Table({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <table className={cn("w-full border-collapse text-[13px] tracking-clinical", className)}>
      {children}
    </table>
  )
}

export function THead({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <thead className={cn("h-[40px] border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-sm sticky top-0 z-10", className)}>
      {children}
    </thead>
  )
}

export function TBody({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <tbody className={cn("divide-y divide-white/[0.04]", className)}>
      {children}
    </tbody>
  )
}

export function TR({ children, className, isHeader = false, onClick }: { children: React.ReactNode, className?: string, isHeader?: boolean, onClick?: () => void }) {
  return (
    <tr 
      onClick={onClick}
      className={cn(
        "group transition-all duration-150",
        !isHeader && "h-[50.5px] hover:bg-white/[0.04]",
        isHeader && "h-[40px]",
        className
      )}
    >
      {children}
    </tr>
  )
}

export function TD({ 
  children, 
  className, 
  isHeader = false,
  variant = 'default',
  ...props
}: { 
  children: React.ReactNode, 
  className?: string, 
  isHeader?: boolean,
  variant?: 'default' | 'positive' | 'negative' | 'date' | 'large'
} & React.TdHTMLAttributes<HTMLTableCellElement> & React.ThHTMLAttributes<HTMLTableCellElement>) {
  if (isHeader) {
    return (
      <th className={cn(
        "px-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-white/40",
        className
      )} {...props}>
        {children}
      </th>
    )
  }

  const variants = {
    default:  "text-foreground/80 font-normal",
    positive: "text-mercury-green font-data",
    negative: "text-foreground font-data",
    date:     "text-muted-foreground font-normal",
    large:    "text-foreground font-medium text-[15px]"
  }

  return (
    <td className={cn(
      "px-4 py-3 leading-[1.2] whitespace-nowrap group-hover:text-foreground transition-colors",
      variants[variant as keyof typeof variants],
      className
    )} {...props}>
      {children}
    </td>
  )
}

/**
 * Backward compatibility alias for composite tables.
 */
export function MercuryTable({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <TableContainer className={className}>
      <Table>
        {children}
      </Table>
    </TableContainer>
  )
}
