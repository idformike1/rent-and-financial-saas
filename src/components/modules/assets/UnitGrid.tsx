'use client';

import React, { useMemo, useTransition } from 'react';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { ChevronRight, Edit2, Trash2, Building2, Plus, Search, LayoutTemplate } from 'lucide-react';
import { Button, Badge } from '@/src/components/finova/ui-finova';

interface UnitGridProps {
  units: any[];
  propertyId: string;
  onAddUnit: () => void;
  disabled?: boolean;
}

const formatCurrency = (val: number | null | undefined) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '—';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(val));
};

export default function UnitGrid({ units = [], propertyId, onAddUnit, disabled }: UnitGridProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Deduplicate units
  const uniqueUnits = useMemo(() => {
    const seen = new Set();
    return units.filter(u => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
  }, [units]);

  const filteredUnits = useMemo(() => {
    return uniqueUnits.filter(u => 
      u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueUnits, searchQuery]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-inner">
            <Building2 className="w-5 h-5 text-brand/80" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground tracking-tight">Units Registry</h2>
            <p className="text-[11px] text-white/20 font-medium">{filteredUnits.length} Managed Nodes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/10 group-focus-within:text-brand/40 transition-colors" />
            <input 
              type="text" 
              placeholder="Search units..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl pl-10 pr-4 h-9 text-[12px] text-foreground/80 placeholder:text-white/10 outline-none transition-all focus:border-brand/20 focus:bg-white/[0.04]"
            />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={disabled}
            onClick={onAddUnit}
            className="h-9 px-4 rounded-xl text-[11px] font-bold text-brand bg-brand/5 hover:bg-brand/10 border border-brand/10 transition-all"
          >
            <Plus className="w-3.5 h-3.5 mr-2" /> Add Unit
          </Button>
        </div>
      </div>

      {/* Slab Registry Table */}
      <div className="flex-grow overflow-x-auto custom-scrollbar">
        <table className="w-full border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="text-left px-6 py-2 text-[11px] font-medium text-white/20 tracking-wide whitespace-nowrap">Unit / Identifier</th>
              <th className="text-left px-6 py-2 text-[11px] font-medium text-white/20 tracking-wide whitespace-nowrap">Operational Status</th>
              <th className="text-left px-6 py-2 text-[11px] font-medium text-white/20 tracking-wide whitespace-nowrap">Current Occupant</th>
              <th className="text-right px-6 py-2 text-[11px] font-medium text-white/20 tracking-wide whitespace-nowrap pr-8">Ledger Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredUnits.map((unit) => {
              const isDecommissioned = unit.maintenanceStatus === 'DECOMMISSIONED';
              const isMaintenance = unit.maintenanceStatus === 'UNDER_REPAIR' || unit.maintenanceStatus === 'UNDER_MAINTENANCE';
              const activeLease = unit.leases?.[0];
              const occupantName = activeLease?.tenant?.name || 'Vacant';
              const isVacant = !activeLease;
              const balance = Number(unit.balance || 0);
              const marketRent = Number(unit.marketRent || activeLease?.rentAmount || 0);
              const unitPath = `/assets/${propertyId}/unit/${unit.id}`;

              return (
                <tr 
                  key={unit.id}
                  onClick={() => router.push(unitPath)}
                  className={cn(
                    "group relative transition-all duration-200 cursor-pointer",
                    isDecommissioned ? "opacity-40 grayscale-[0.5]" : ""
                  )}
                >
                  {/* Unit Column */}
                  <td className="px-6 py-4 bg-transparent group-hover:bg-white/[0.02] border-y border-l border-transparent group-hover:border-white/10 rounded-l-xl transition-all first:border-l">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-semibold text-white tracking-tight group-hover:text-white transition-colors">
                        {unit.unitNumber.replace(/^Unit\s+/i, '')}
                      </span>
                      <span className="text-[11px] text-white/20 font-medium whitespace-nowrap">
                        {formatCurrency(marketRent)} / month
                      </span>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-6 py-4 bg-transparent group-hover:bg-white/[0.02] border-y border-transparent group-hover:border-white/10 transition-all">
                    <div className="flex items-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-2",
                        isDecommissioned ? "bg-rose-500/5 border-rose-500/10 text-rose-500/60" :
                        isMaintenance ? "bg-amber-500/5 border-amber-500/10 text-amber-500/60" : 
                        isVacant ? "bg-rose-500/5 border-rose-500/10 text-rose-500/60" :
                        "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/60"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]", 
                          isDecommissioned ? "bg-rose-500" :
                          isMaintenance ? "bg-amber-500" : isVacant ? "bg-rose-500" : "bg-emerald-500"
                        )} />
                        {isDecommissioned ? 'DECOMMISSIONED' : isMaintenance ? 'MAINTENANCE' : isVacant ? 'VACANT' : 'OCCUPIED'}
                      </span>
                    </div>
                  </td>

                  {/* Occupant Column */}
                  <td className="px-6 py-4 bg-transparent group-hover:bg-white/[0.02] border-y border-transparent group-hover:border-white/10 transition-all">
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-[13px] font-semibold tracking-tight",
                        isVacant ? "text-white/10" : "text-white"
                      )}>
                        {occupantName}
                      </span>
                      <span className="text-[11px] text-white/20 font-medium whitespace-nowrap">
                        {isVacant ? 'Open Inventory' : 'Primary Occupant'}
                      </span>
                    </div>
                  </td>

                  {/* Balance Column */}
                  <td className="px-6 py-4 bg-transparent group-hover:bg-white/[0.02] border-y border-r border-transparent group-hover:border-white/10 rounded-r-xl text-right pr-8 transition-all">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "text-[16px] font-bold tabular-nums tracking-tight",
                        balance > 0 ? "text-rose-500" : balance < 0 ? "text-emerald-500" : "text-white/40"
                      )}>
                        {balance === 0 ? '—' : formatCurrency(balance)}
                      </span>
                      <span className="text-[10px] text-white/10 font-medium uppercase tracking-wider">
                        {balance > 0 ? 'Arrears' : balance < 0 ? 'Credit' : 'Settled'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}





