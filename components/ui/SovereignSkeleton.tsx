'use client';

import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-sm)] bg-[#1A1A24] border border-[#1F2937]", className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-2">
      <Skeleton className="h-10 w-full bg-[#1F2937]/50" />
      <div className="space-y-1">
        {[...Array(rows)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="p-6 bg-[#12121A] border border-[#1F2937] rounded-[var(--radius-sm)] space-y-4">
      <Skeleton className="h-3 w-24 opacity-40" />
      <Skeleton className="h-8 w-32" />
      <div className="pt-4 border-t border-[#1F2937]">
        <Skeleton className="h-3 w-full opacity-20" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-8 bg-[#12121A] border border-[#1F2937] rounded-[var(--radius-sm)] space-y-8 h-full min-h-[300px]">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex-1 mt-8 relative">
        <Skeleton className="absolute inset-0 h-full w-full opacity-10 bg-gradient-to-t from-blue-500/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex justify-between gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-12" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PortfolioSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}

export function LedgerSkeleton() {
  return <TableSkeleton rows={6} />;
}
