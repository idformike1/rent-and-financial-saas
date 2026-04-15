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
    <div className="w-full bg-[#171721] border border-[#1F2937] rounded-md overflow-hidden shadow-[var(--shadow-mercury-float)]">
      <table className="w-full border-collapse text-[13px]">
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[30%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead>
          <tr className="bg-[#1A1A24] border-b border-[#1F2937]">
            <th className="text-left px-6 py-4 font-bold text-[#E5E7EB] uppercase tracking-wider">Unit Identifier</th>
            <th className="text-left px-6 py-4 font-bold text-[#E5E7EB] uppercase tracking-wider">Taxonomy</th>
            <th className="text-left px-6 py-4 font-bold text-[#E5E7EB] uppercase tracking-wider">Clinical State</th>
            <th className="text-right px-6 py-4 font-bold text-[#E5E7EB] uppercase tracking-wider tabular-nums">Market Value</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1F2937]">
          {units.map((unit) => {
            const isSelected = searchParams.get('unitId') === unit.id;
            
            // Re-calc clinical status since the data passed here is raw Prisma unit
            let status = '[ SURVEILLANCE ]';
            let statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            if (unit.maintenanceStatus === 'OPERATIONAL' && unit.leases?.length > 0) {
              status = '[ OPTIMIZED ]';
              statusColor = 'text-mercury-green bg-mercury-green/10 border-mercury-green/20';
            } else if (unit.maintenanceStatus === 'DECOMMISSIONED') {
              status = '[ CRITICAL ]';
              statusColor = 'text-destructive bg-destructive/10 border-destructive/20';
            }

            return (
              <tr 
                key={unit.id}
                onClick={() => handleRowClick(unit.id)}
                className={cn(
                  "group cursor-pointer transition-all duration-200",
                  isSelected ? "bg-[#1E1E2A]" : "bg-transparent hover:bg-white/5 hover:-translate-y-[1px] hover:shadow-sm hover:relative hover:z-10"
                )}
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-[#F9FAFB] tracking-tight">{unit.unitNumber}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[#9CA3AF] uppercase tracking-wider">{unit.category} / {unit.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn("px-2 py-1 border rounded-md text-[10px] font-bold tracking-widest", statusColor)}>
                    {status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-mono tracking-tight text-[#E5E7EB] tabular-nums">
                    {formatCurrency(unit.marketRent)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </td>
              </tr>
            );
          })}
          {units.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-[#9CA3AF] uppercase tracking-widest text-[11px]">
                No operational units detected in this domain.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
