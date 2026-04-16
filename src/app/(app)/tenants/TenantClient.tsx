"use client";

import React, { useState } from "react";
import { SovereignTable } from "@/src/components/ui/SovereignTable";
import { SovereignSheet } from "@/src/components/ui/SovereignSheet";
import { Button } from "@/components/ui-finova";

interface Tenant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  leases: {
    unitId: string;
    rentAmount: any; // Decimal
    status: string;
  }[];
}

interface TenantClientProps {
  initialData: Tenant[];
}

export default function TenantClient({ initialData }: TenantClientProps) {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const columns: any[] = [
    { header: "Occupant Name", accessor: "name", align: "left" },
    { header: "Contact", accessor: "email", align: "left" },
    { 
      header: "Unit ID", 
      accessor: (tenant: Tenant) => tenant.leases[0]?.unitId || "UNASSIGNED",
      align: "left" 
    },
    { 
      header: "Status", 
      accessor: (tenant: Tenant) => tenant.leases[0]?.status || "INACTIVE",
      align: "left" 
    },
  ];

  const handleRowClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsSheetOpen(true);
  };

  return (
    <>
      <SovereignTable
        data={initialData}
        columns={columns}
        onRowClick={handleRowClick}
      />

      {selectedTenant && (
        <SovereignSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          title={`Occupant: ${selectedTenant.name}`}
          size="lg"
        >
          <div className="space-y-12">
            {/* CONTACT MATRIX */}
            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-6">
                Contact Matrix
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-[6px]">
                  <div className="text-[10px] uppercase text-zinc-600 mb-1">Email Endpoint</div>
                  <div className="text-[13px] text-zinc-100">{selectedTenant.email || "N/A"}</div>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-[6px]">
                  <div className="text-[10px] uppercase text-zinc-600 mb-1">Phone Line</div>
                  <div className="text-[13px] text-zinc-100">{selectedTenant.phone || "N/A"}</div>
                </div>
              </div>
            </section>

            {/* ACTIVE LEASE */}
            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-6">
                Active Lease
              </h3>
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[6px] flex justify-between items-center">
                <div>
                  <div className="text-[10px] uppercase text-zinc-600 mb-1">Monthly Throughput</div>
                  <div className="text-2xl font-semibold text-zinc-100 tabular-nums tracking-tight">
                    ${Number(selectedTenant.leases[0]?.rentAmount || 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-zinc-600 mb-1">Status</div>
                  <div className="text-[11px] font-bold text-mercury-green uppercase tracking-wider">
                    {selectedTenant.leases[0]?.status || "NO_ACTIVE_LEASE"}
                  </div>
                </div>
              </div>
            </section>

            {/* ACTION DECK */}
            <section className="pt-8 border-t border-zinc-800/50 flex gap-4">
              <Button type="button" variant="secondary" disabled={false} className="flex-1 h-10 bg-zinc-800/50 text-zinc-100 text-[11px] uppercase tracking-wider font-bold rounded-[6px] hover:bg-zinc-700/50 transition-colors border-none">
                Edit Profile
              </Button>
              <Button type="button" variant="ghost" disabled={false} className="flex-1 h-10 bg-red-950/20 border border-red-900/30 text-red-500 text-[11px] uppercase tracking-wider font-bold rounded-[6px] hover:bg-red-900/30 transition-colors">
                Terminate Lease
              </Button>
            </section>
          </div>
        </SovereignSheet>
      )}
    </>
  );
}
