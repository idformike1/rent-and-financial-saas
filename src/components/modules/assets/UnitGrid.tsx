'use client';

import React, { useMemo, useTransition } from 'react';
import { cn } from "@/lib/utils";
import { ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface UnitGridProps {
  units: any[];
  propertyId: string;
}

const formatCurrency = (val: number | null | undefined) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '—';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(val));
};

export default function UnitGrid({ units = [], propertyId }: UnitGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  return (
    <div className={cn("w-full overflow-x-auto transition-opacity duration-300", isPending && "opacity-50")}>
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40">ID</th>
            <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40">Type / Status</th>
            <th className="text-right px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40">Market Rent</th>
            <th className="text-right px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {units.map((unit) => {
            const isVacant = !unit.leases || unit.leases.length === 0;
            const isMaintenance = unit.maintenanceStatus === 'UNDER_MAINTENANCE' || unit.maintenanceStatus === 'DECOMMISSIONED';
            const isOccupied = !isVacant && !isMaintenance;
            const unitPath = `/assets/${propertyId}/unit/${unit.id}`;

            return (
              <tr 
                key={unit.id}
                onClick={() => router.push(unitPath)}
                className="group cursor-pointer transition-all duration-150 hover:bg-muted/30 border-b border-border/10 last:border-0"
              >
                {/* ID */}
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-bold text-foreground tracking-tight">
                    {unit.unitNumber.replace(/^Unit\s+/i, '')}
                  </span>
                </td>

                {/* Type / Status */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest min-w-[80px]">
                      {unit.type}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1.5",
                      isMaintenance ? "bg-amber-500/5 border-amber-500/10 text-amber-500" : 
                      isVacant ? "bg-rose-500/5 border-rose-500/10 text-rose-500" :
                      "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full", 
                        isMaintenance ? "bg-amber-500" : isVacant ? "bg-rose-500" : "bg-emerald-500"
                      )} />
                      {isMaintenance ? 'Maintenance' : isVacant ? 'Vacant' : 'Occupied'}
                    </span>
                  </div>
                </td>

                {/* Market Rent */}
                <td className="px-6 py-4 text-right">
                  <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                    {formatCurrency(unit.marketRent)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => { e.stopPropagation(); /* edit logic */ }}
                      className="p-1.5 hover:bg-muted rounded-md transition-colors"
                    >
                      <Edit2 size={12} className="text-muted-foreground hover:text-brand" />
                    </button>
                    <button 
                      disabled={unit.leases?.length > 0}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (confirm("Confirm unit decommissioning?")) {
                          // Trigger unit archive action
                        }
                      }}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        unit.leases?.length > 0 
                          ? "opacity-30 cursor-not-allowed grayscale" 
                          : "hover:bg-muted cursor-pointer"
                      )}
                      title={unit.leases?.length > 0 ? "Cannot delete occupied unit" : "Delete unit"}
                    >
                      <Trash2 size={12} className={cn(
                        unit.leases?.length > 0 ? "text-muted-foreground" : "text-muted-foreground hover:text-destructive"
                      )} />
                    </button>
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
