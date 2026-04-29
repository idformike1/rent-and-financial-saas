'use client';

import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { ChevronRight, Edit2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface UnitGridProps {
  units: any[];
}

const formatCurrency = (val: number | null | undefined) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '—';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(val));
};

export default function UnitGrid({ units = [] }: UnitGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRowClick = (unitId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('unitId', unitId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            <th className="text-left px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID</th>
            <th className="text-left px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</th>
            <th className="text-left px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
            <th className="text-right px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Market Rent</th>
            <th className="px-6 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {units.map((unit) => {
            const isSelected = searchParams.get('unitId') === unit.id;
            const isVacant = !unit.leases || unit.leases.length === 0;
            const isMaintenance = unit.maintenanceStatus === 'UNDER_MAINTENANCE' || unit.maintenanceStatus === 'DECOMMISSIONED';

            return (
              <tr 
                key={unit.id}
                onClick={() => handleRowClick(unit.id)}
                className={cn(
                  "group cursor-pointer transition-all duration-150",
                  isSelected ? "bg-accent" : "hover:bg-muted/50"
                )}
              >
                <td className="px-6 py-3">
                  <span className="font-mono text-sm font-bold text-foreground tracking-tight">
                    {unit.unitNumber.replace(/^Unit\s+/i, '')}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs font-medium text-muted-foreground">{unit.type}</span>
                </td>
                <td className="px-6 py-3">
                  {(isVacant || isMaintenance) && (
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold border",
                      isMaintenance ? "bg-amber-500/5 border-amber-500/10 text-amber-500" : "bg-rose-500/5 border-rose-500/10 text-rose-500"
                    )}>
                      {isMaintenance ? 'Maintenance' : 'Vacant'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 text-right">
                  <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                    {formatCurrency(unit.marketRent)}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                   <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all">
                      <Edit2 size={12} className="text-muted-foreground hover:text-brand" />
                   </div>
                </td>
              </tr>
            );
          })}
          {units.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center">
                 <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
                    <p className="text-sm font-bold text-muted-foreground">Start by provisioning your first unit</p>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">This property currently has zero recorded unit identifiers. Provision inventory to begin ledger surveillance.</p>
                 </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
