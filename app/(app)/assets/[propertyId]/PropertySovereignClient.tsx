'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import UnitGrid from './UnitGrid';
import UnitSideSheet from './UnitSideSheet';
import { AssetProperty } from '@/src/services/queries/assets.services';
import { Building2, Users, Activity, TrendingUp, Wallet } from 'lucide-react';

interface PropertySovereignClientProps {
  propertyData: any; // We'll map this into the existing AssetProperty format for the ledger table
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function PropertySovereignClient({ propertyData }: PropertySovereignClientProps) {
  const [metricToggle, setMetricToggle] = useState<'PORTFOLIO_VALUE' | 'REALIZED_REVENUE'>('PORTFOLIO_VALUE');

  // Map the single property fetch into the format expected by our existing AssetLedgerTable
  const mappedProperty: AssetProperty = {
    id: propertyData.id,
    name: propertyData.name,
    address: propertyData.address,
    totalUnits: propertyData.telemetry.totalUnits,
    activeLeases: propertyData.telemetry.activeLeases,
    collectedIncome: propertyData.telemetry.collectedIncome,
    occupancyRate: propertyData.telemetry.yield,
    units: propertyData.units.map((u: any) => {
      const activeLease = u.leases[0];
      const unitTenantId = activeLease?.tenant?.id;
      const unitEntries = unitTenantId 
        ? propertyData.ledgerEntries.filter((e: any) => e.tenantId === unitTenantId)
        : [];
      
      const unitIncome = unitEntries.reduce((sum: number, entry: any) => sum + Math.abs(Number(entry.amount)), 0);
      
      let status = '[ SURVEILLANCE ]';
      if (u.maintenanceStatus === 'OPERATIONAL' && u.leases.length > 0) {
        status = '[ OPTIMIZED ]';
      } else if (u.maintenanceStatus === 'DECOMMISSIONED') {
        status = '[ CRITICAL ]';
      }

      return {
        id: u.id,
        unitNumber: u.unitNumber,
        type: u.type,
        tenantName: u.leases[0]?.tenant?.name || 'VACANT',
        status,
        collectedIncome: unitIncome
      }
    })
  };

  const primaryMetricValue = metricToggle === 'PORTFOLIO_VALUE' 
    ? propertyData.telemetry.portfolioValue 
    : propertyData.telemetry.collectedIncome;

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* ── HEADER STRATUM ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10 border-b border-[#1F2937] pb-6">
        <div className="space-y-2">
          <h1 className="text-[28px] leading-[36px] font-[400] text-white tracking-tight font-sans">
            Domain: {propertyData.name}
          </h1>
          <p className="text-[13px] font-bold text-white/40 uppercase tracking-[0.2em] font-sans">
            {propertyData.address}
          </p>
        </div>
        
        <div className="flex bg-card/40 border border-[#1F2937] p-1">
           <button 
             onClick={() => setMetricToggle('PORTFOLIO_VALUE')}
             className={cn(
               "px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition-all",
               metricToggle === 'PORTFOLIO_VALUE' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"
             )}
           >
             [ PORTFOLIO VALUE ]
           </button>
           <button 
             onClick={() => setMetricToggle('REALIZED_REVENUE')}
             className={cn(
               "px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition-all",
               metricToggle === 'REALIZED_REVENUE' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"
             )}
           >
             [ REALIZED REVENUE ]
           </button>
        </div>
      </div>

      {/* ── PROPERTY HUD ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="flex flex-col gap-2 p-6 bg-card/40 border border-[#1F2937] rounded-md shadow-[var(--shadow-mercury-float)] transition-all hover:bg-card/60">
          <div className="flex items-center gap-2 text-gray-500">
            <Building2 size={16} className="opacity-60" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Capacity</span>
          </div>
          <span className="font-mono text-[20px] text-[#F9FAFB] tabular-nums mt-1">
            {propertyData.telemetry.totalUnits.toString().padStart(3, '0')}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-6 bg-card/40 border border-[#1F2937] rounded-md shadow-[var(--shadow-mercury-float)] transition-all hover:bg-card/60">
          <div className="flex items-center gap-2 text-gray-500">
            <Users size={16} className="opacity-60" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Leases</span>
          </div>
          <span className="font-mono text-[20px] text-[#F9FAFB] tabular-nums mt-1">
            {propertyData.telemetry.activeLeases.toString().padStart(3, '0')}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-6 bg-card/40 border border-[#1F2937] rounded-md shadow-[var(--shadow-mercury-float)] transition-all hover:bg-card/60">
          <div className="flex items-center gap-2 text-gray-500">
            <Activity size={16} className="opacity-60" />
            <span className="text-[11px] font-medium uppercase tracking-wider">System Yield</span>
          </div>
          <span className="font-mono text-[20px] text-[#F9FAFB] tabular-nums mt-1">
            {propertyData.telemetry.yield.toFixed(1)}%
          </span>
        </div>

        <div className="flex flex-col gap-2 p-6 bg-card/40 border border-[#1F2937] rounded-md shadow-[var(--shadow-mercury-float)] transition-all hover:bg-card/60">
          <div className="flex items-center gap-2 text-gray-500">
            {metricToggle === 'PORTFOLIO_VALUE' ? (
              <Wallet size={16} className="opacity-60 text-emerald-400" />
            ) : (
              <TrendingUp size={16} className="opacity-60 text-brand" />
            )}
            <span className="text-[11px] font-medium uppercase tracking-wider">
               {metricToggle.replace('_', ' ')}
            </span>
          </div>
          <span className="font-mono text-[20px] text-[#F9FAFB] tabular-nums mt-1 transition-all">
            {formatter.format(primaryMetricValue)}
          </span>
        </div>
      </div>

      {/* ── ISOLATED UNIT GRID ────────────────────────────────────────────── */}
      <div className="mt-12">
         <UnitGrid units={propertyData.units} />
      </div>

      <UnitSideSheet propertyData={propertyData} />
    </div>
  );
}
