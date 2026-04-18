'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';
import { ChevronRight } from 'lucide-react';

interface UnitGridProps {
  units: any[];
}

const formatCurrency = (val: any) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export default function UnitGrid({ units }: UnitGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRowClick = useCallback((unitId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('unitId', unitId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, searchParams, router]);

  return (
    <div className="w-full bg-muted/10 border border-border rounded-[var(--radius)] overflow-hidden backdrop-blur-sm shadow-xl">
      <table className="w-full border-collapse text-[13px]">
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[30%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            <th className="text-left px-6 py-4 font-bold text-foreground/40 uppercase tracking-[0.15em] text-[10px]">Identifier</th>
            <th className="text-left px-6 py-4 font-bold text-foreground/40 uppercase tracking-[0.15em] text-[10px]">Taxonomy</th>
            <th className="text-left px-6 py-4 font-bold text-foreground/40 uppercase tracking-[0.15em] text-[10px]">Registry Status</th>
            <th className="text-right px-6 py-4 font-bold text-foreground/40 uppercase tracking-[0.15em] text-[10px] tabular-nums">Market Value</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {units.map((unit) => {
            const isSelected = searchParams.get('unitId') === unit.id;
            
            let status = 'SURVEILLANCE';
            let statusColor = 'text-amber-500/80 bg-amber-500/5 border-amber-500/10';
            let dotColor = 'bg-amber-500';

            if (unit.maintenanceStatus === 'OPERATIONAL' && unit.leases?.length > 0) {
              status = 'OPTIMIZED';
              statusColor = 'text-mercury-green/80 bg-mercury-green/5 border-mercury-green/10';
              dotColor = 'bg-mercury-green';
            } else if (unit.maintenanceStatus === 'DECOMMISSIONED') {
              status = 'CRITICAL';
              statusColor = 'text-destructive/80 bg-destructive/5 border-destructive/10';
              dotColor = 'bg-destructive/60';
            }

            return (
              <tr 
                key={unit.id}
                onClick={() => handleRowClick(unit.id)}
                className={cn(
                  "group cursor-pointer transition-all duration-300",
                  isSelected ? "bg-muted/40" : "bg-transparent hover:bg-muted/20"
                )}
              >
                <td className="px-6 py-5">
                  <span className="font-mono text-foreground tracking-tight flex items-center gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
                    {unit.unitNumber}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/60 font-medium">{unit.category}</span>
                    <span className="text-foreground/10">•</span>
                    <span className="text-foreground/40 text-[10px] font-bold uppercase tracking-[0.1em]">{unit.type}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={cn("px-2.5 py-0.5 border rounded-[var(--radius-sm)] text-[9px] font-bold tracking-[0.15em] uppercase", statusColor)}>
                    {status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="font-finance tracking-tight text-foreground/80 tabular-nums">
                    {formatCurrency(unit.marketRent)}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <ChevronRight size={14} className="text-foreground/20 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </td>
              </tr>
            );
          })}
          {units.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-foreground/20 uppercase tracking-[0.15em] font-bold text-[10px]">
                No operational units detected in this domain.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
