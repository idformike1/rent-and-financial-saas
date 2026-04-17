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
    <div className="w-full bg-[#1E1E2A]/20 border border-white/5 rounded-[var(--radius)] overflow-hidden backdrop-blur-sm shadow-xl">
      <table className="w-full border-collapse text-[13px]">
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[30%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead>
          <tr className="bg-white/[0.02] border-b border-white/[0.04]">
            <th className="text-left px-6 py-4 font-bold text-white/40 uppercase tracking-[0.15em] text-[10px]">Identifier</th>
            <th className="text-left px-6 py-4 font-bold text-white/40 uppercase tracking-[0.15em] text-[10px]">Taxonomy</th>
            <th className="text-left px-6 py-4 font-bold text-white/40 uppercase tracking-[0.15em] text-[10px]">Registry Status</th>
            <th className="text-right px-6 py-4 font-bold text-white/40 uppercase tracking-[0.15em] text-[10px] tabular-nums">Market Value</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.02]">
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
              statusColor = 'text-rose-500/80 bg-rose-500/5 border-rose-500/10';
              dotColor = 'bg-rose-500';
            }

            return (
              <tr 
                key={unit.id}
                onClick={() => handleRowClick(unit.id)}
                className={cn(
                  "group cursor-pointer transition-all duration-300",
                  isSelected ? "bg-white/[0.04]" : "bg-transparent hover:bg-white/[0.02]"
                )}
              >
                <td className="px-6 py-5">
                  <span className="font-mono text-white tracking-tight flex items-center gap-2">
                    <div className={cn("w-1 h-1 rounded-full", dotColor)} />
                    {unit.unitNumber}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 font-medium">{unit.category}</span>
                    <span className="text-white/10">•</span>
                    <span className="text-white/40 text-[11px] uppercase tracking-wider">{unit.type}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={cn("px-2.5 py-0.5 border rounded-full text-[9px] font-bold tracking-widest uppercase", statusColor)}>
                    {status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="font-finance tracking-tight text-white/80 tabular-nums">
                    {formatCurrency(unit.marketRent)}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <ChevronRight size={14} className="text-white/20 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </td>
              </tr>
            );
          })}
          {units.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-white/20 uppercase tracking-widest text-[10px]">
                No operational units detected in this domain.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
