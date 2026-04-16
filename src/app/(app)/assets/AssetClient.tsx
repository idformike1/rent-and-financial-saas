"use client";

import React, { useState } from "react";
import { SovereignTable } from "@/src/components/ui/SovereignTable";
import { SovereignSheet } from "@/src/components/ui/SovereignSheet";
import { cn } from "@/lib/utils";

interface Unit {
  id: string;
  unitNumber: string;
  marketRent: any; // Decimal
}

interface Property {
  id: string;
  name: string;
  address: string;
  units: Unit[];
}

interface AssetClientProps {
  initialData: Property[];
}

export default function AssetClient({ initialData }: AssetClientProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const columns: any[] = [
    { header: "Property Name", accessor: "name", align: "left" },
    { header: "Address", accessor: "address", align: "left" },
    { 
      header: "Total Units", 
      accessor: (prop: Property) => prop.units.length.toString(),
      align: "right" 
    },
  ];

  const handleRowClick = (property: Property) => {
    setSelectedProperty(property);
    setIsSheetOpen(true);
  };

  return (
    <>
      <SovereignTable
        data={initialData}
        columns={columns}
        onRowClick={handleRowClick}
      />

      {selectedProperty && (
        <SovereignSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          title={selectedProperty.name}
          size="lg"
        >
          <div className="space-y-12">
            {/* PROPERTY METADATA */}
            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">
                Location Intelligence
              </h3>
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[6px]">
                <div className="text-[10px] uppercase text-zinc-600 mb-1">Physical Address</div>
                <div className="text-[14px] text-zinc-100 font-medium">{selectedProperty.address}</div>
              </div>
            </section>

            {/* UNIT MATRIX */}
            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-6">
                Unit Matrix
              </h3>
              <div className="w-full border border-zinc-800/50 rounded-[6px] overflow-hidden bg-zinc-950/20">
                <table className="w-full text-left">
                  <thead className="bg-zinc-900/50 border-b border-zinc-800/50">
                    <tr>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Unit Num</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-right">Market Rent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {selectedProperty.units.map((unit) => (
                      <tr key={unit.id} className="group hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 text-[13px] text-zinc-100 font-mono">{unit.unitNumber}</td>
                        <td className="px-6 py-4 text-[13px] text-zinc-100 text-right tabular-nums">
                          ${Number(unit.marketRent).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    {selectedProperty.units.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-6 py-12 text-center text-zinc-600 text-[11px] uppercase tracking-widest">
                          No Units Configured
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </SovereignSheet>
      )}
    </>
  );
}
