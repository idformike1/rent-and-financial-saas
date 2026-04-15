import React from 'react';
import { cn } from "@/lib/utils";
import { AssetProperty } from "@/src/services/queries/assets.services";

interface AssetLedgerTableProps {
  properties: AssetProperty[];
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function AssetLedgerTable({ properties }: AssetLedgerTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        {/* Force strict column sizing for hierarchical alignment */}
        <colgroup>
          <col className="w-[120px]" /> {/* ID */}
          <col />                     {/* Location / Tenant */}
          <col className="w-[100px]" /> {/* Unit Count */}
          <col className="w-[160px]" /> {/* Status */}
          <col className="w-[150px]" /> {/* Collected Income */}
        </colgroup>
        
        <thead>
          <tr className="text-[#9CA3AF] text-left border-b border-[#1F2937]">
            <th className="py-3 px-4 font-bold uppercase tracking-wider">Asset / ID</th>
            <th className="py-3 px-4 font-bold uppercase tracking-wider">Location / Tenant</th>
            <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Units</th>
            <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Status Badge</th>
            <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Collected Income</th>
          </tr>
        </thead>

        <tbody>
          {properties.map((property) => (
            <React.Fragment key={property.id}>
              {/* PROPERTY GROUP HEADER */}
              <tr className="bg-[#1A1A24] text-[#E5E7EB] font-medium border-y border-[#374151]">
                <td className="py-3 px-4 font-mono">
                  {property.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="py-3 px-4 uppercase tracking-tight">
                  {property.name} — {property.address}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">
                  {property.totalUnits}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={cn(
                    "font-bold",
                    property.occupancyRate >= 90 ? "text-mercury-green" : "text-amber-500"
                  )}>
                    {property.occupancyRate.toFixed(1)}% OCCUPANCY
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">
                  $ {formatter.format(property.collectedIncome)}
                </td>
              </tr>

              {/* UNIT ROWS */}
              {property.units.map((unit) => (
                <tr key={unit.id} className="text-[#9CA3AF] border-b border-[#1F2937]/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 px-4 pl-8 font-mono opacity-60">
                    {unit.unitNumber}
                  </td>
                  <td className="py-2 px-4 italic opacity-80">
                    {unit.tenantName}
                  </td>
                  <td className="py-2 px-4 text-right">—</td>
                  <td className="py-2 px-4 text-center">
                    <span className={cn(
                      "font-mono font-bold tracking-tighter scale-90 inline-block",
                      unit.status.includes('OPTIMIZED') ? "text-mercury-green" : 
                      unit.status.includes('CRITICAL') ? "text-destructive" : "text-amber-500"
                    )}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right font-mono tabular-nums opacity-80">
                    $ {formatter.format(unit.collectedIncome)}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

