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
          <div className="flex flex-col">
            <h2 className="text-[13px] font-bold text-white tracking-tight leading-none mb-1.5 uppercase">REGISTRY</h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] leading-none">
              {filteredUnits.length} NODES
            </p>
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

      {/* Slab Registry (Adaptive Stack) */}
      <div className="flex-grow space-y-2 overflow-y-auto custom-scrollbar pt-2 pr-1">
        {/* Header (Hidden on Mobile) */}
        <div className="hidden md:grid md:grid-cols-[1fr_auto_1.2fr_0.8fr] gap-4 px-6 mb-2">
          <span className="text-[11px] font-medium text-white/20 tracking-tight">Unit</span>
          <span className="text-[11px] font-medium text-white/20 tracking-tight">Status</span>
          <span className="text-[11px] font-medium text-white/20 tracking-tight">Occupant</span>
          <span className="text-[11px] font-medium text-white/20 tracking-tight text-right">Balance</span>
        </div>

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
            <div 
              key={unit.id}
              onClick={() => router.push(unitPath)}
              className={cn(
                "group relative transition-all duration-300 ease-out cursor-pointer p-4 md:px-6 md:py-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.08] hover:border-white/25 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/50",
                isDecommissioned ? "opacity-40 grayscale-[0.5]" : ""
              )}
            >
              <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1.2fr_0.8fr] gap-4 md:items-center">
                
                {/* 1. Unit & Market Rent */}
                <div className="flex justify-between items-start md:flex-col md:items-start">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-white tracking-tight group-hover:text-white transition-colors leading-none">
                      {unit.unitNumber.replace(/^Unit\s+/i, '')}
                    </span>
                    <span className="text-[11px] text-white/20 font-medium mt-1">
                      {formatCurrency(marketRent)} / mo
                    </span>
                  </div>
                  {/* Status Badge (Visible on Mobile here, moves to its own column on Desktop) */}
                  <div className="md:hidden">
                    <StatusBadge isDecommissioned={isDecommissioned} isMaintenance={isMaintenance} isVacant={isVacant} />
                  </div>
                </div>

                {/* 2. Status Column (Desktop Only) */}
                <div className="hidden md:flex">
                  <StatusBadge isDecommissioned={isDecommissioned} isMaintenance={isMaintenance} isVacant={isVacant} />
                </div>

                {/* 3. Occupant Info */}
                <div className="flex justify-between items-end md:flex-col md:items-start pt-2 md:pt-0 border-t border-white/5 md:border-none">
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-[13px] font-semibold tracking-tight leading-none",
                      isVacant ? "text-white/10" : "text-white"
                    )}>
                      {occupantName}
                    </span>
                    <span className="text-[10px] text-white/20 font-medium mt-1 uppercase tracking-wider">
                      {isVacant ? 'Open Inventory' : 'Primary Occupant'}
                    </span>
                  </div>
                  {/* Balance (Visible on Mobile here) */}
                  <div className="md:hidden text-right">
                    <BalanceDisplay balance={balance} />
                  </div>
                </div>

                {/* 4. Balance Column (Desktop Only) */}
                <div className="hidden md:flex justify-end">
                  <BalanceDisplay balance={balance} />
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Sub-components for clean adaptive rendering
function StatusBadge({ isDecommissioned, isMaintenance, isVacant }: any) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-[9px] font-bold border flex items-center gap-1.5",
      isDecommissioned ? "bg-rose-500/5 border-rose-500/10 text-rose-500/60" :
      isMaintenance ? "bg-amber-500/5 border-amber-500/10 text-amber-500/60" : 
      isVacant ? "bg-rose-500/5 border-rose-500/10 text-rose-500/60" :
      "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/60"
    )}>
      <div className={cn("w-1 h-1 rounded-full", 
        isDecommissioned ? "bg-rose-500" :
        isMaintenance ? "bg-amber-500" : isVacant ? "bg-rose-500" : "bg-emerald-500"
      )} />
      {isDecommissioned ? 'DCM' : isMaintenance ? 'MNT' : isVacant ? 'VAC' : 'OCC'}
    </span>
  );
}

function BalanceDisplay({ balance }: { balance: number }) {
  return (
    <div className="flex flex-col items-end">
      <span className={cn(
        "text-[15px] font-bold tabular-nums tracking-tight leading-none",
        balance > 0 ? "text-rose-500" : balance < 0 ? "text-emerald-500" : "text-white/30"
      )}>
        {balance === 0 ? '—' : (balance > 0 ? `+$${balance}` : `-$${Math.abs(balance)}`)}
      </span>
      <span className="text-[9px] text-white/10 font-bold uppercase tracking-[0.1em] mt-1">
        {balance > 0 ? 'Arrears' : balance < 0 ? 'Credit' : 'Settled'}
      </span>
    </div>
  );
}





