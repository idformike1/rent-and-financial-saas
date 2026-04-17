"use client";

import React, { useState } from "react";
import { SovereignTable } from "@/src/components/ui/SovereignTable";
import { SovereignSheet } from "@/src/components/ui/SovereignSheet";
import { voidTransaction, clearTransaction } from "@/src/app/actions/treasury";
import { cn } from "@/lib/utils";

interface LedgerEntry {
  id: string;
  date: Date;
  description: string;
  amount: any; // Decimal
  status: string;
  isCleared: boolean;
  expenseCategory?: {
    name: string;
  } | null;
}

interface LedgerClientProps {
  initialData: LedgerEntry[];
}

export default function LedgerClient({ initialData }: LedgerClientProps) {
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const columns: any[] = [
    { 
      header: "Date", 
      accessor: (entry: LedgerEntry) => new Date(entry.date).toLocaleDateString(),
      align: "left" 
    },
    { header: "Description", accessor: "description", align: "left" },
    { 
      header: "Category", 
      accessor: (entry: LedgerEntry) => entry.expenseCategory?.name || "UNCATEGORIZED",
      align: "left" 
    },
    { 
      header: "Amount", 
      accessor: (entry: LedgerEntry) => `$${Number(entry.amount).toFixed(2)}`,
      align: "right" 
    },
    { header: "Status", accessor: "status", align: "left" },
    { 
      header: "Cleared", 
      accessor: (entry: LedgerEntry) => entry.isCleared ? "YES" : "NO",
      align: "left" 
    },
  ];

  const handleRowClick = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setIsSheetOpen(true);
  };

  const onVoid = async () => {
    if (!selectedEntry) return;
    if (confirm("This action is immutable. A corrective entry will be required.")) {
      setIsPending(true);
      await voidTransaction(selectedEntry.id);
      setIsSheetOpen(false);
      setIsPending(false);
    }
  };

  const onToggleClear = async () => {
    if (!selectedEntry) return;
    setIsPending(true);
    await clearTransaction(selectedEntry.id, selectedEntry.isCleared);
    setIsPending(false);
    setIsSheetOpen(false); // Close to force refresh state or keep open for UX? User didn't specify.
  };

  return (
    <>
      <SovereignTable
        data={initialData}
        columns={columns}
        onRowClick={handleRowClick}
        getRowClassName={(item) => item.status === "VOIDED" ? "opacity-40" : ""}
      />

      {selectedEntry && (
        <SovereignSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          title="Transaction Detail"
          size="md"
        >
          <div className="space-y-12">
            <section>
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[var(--radius)]">
                <div className="text-[10px] uppercase text-zinc-600 mb-1">Total Throughput</div>
                <div className={cn(
                  "text-3xl font-semibold tabular-nums tracking-tight",
                  selectedEntry.status === "VOIDED" ? "text-zinc-600 line-through" : "text-zinc-100"
                )}>
                  ${Number(selectedEntry.amount).toFixed(2)}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-center py-4 border-b border-zinc-800/30">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Date</span>
                <span className="text-[13px] text-zinc-100">{new Date(selectedEntry.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-zinc-800/30">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Status</span>
                <span className={cn(
                  "text-[11px] font-bold uppercase tracking-widest",
                  selectedEntry.status === "VOIDED" ? "text-red-500" : "text-mercury-green"
                )}>
                  {selectedEntry.status}
                </span>
              </div>
            </section>

            <section className="pt-8 flex flex-col gap-4">
              <button
                onClick={onToggleClear}
                disabled={isPending || selectedEntry.status === "VOIDED"}
                className="w-full h-10 bg-zinc-100 text-zinc-950 text-[11px] uppercase tracking-wider font-bold rounded-[var(--radius)] hover:bg-zinc-300 transition-colors disabled:opacity-30"
              >
                {selectedEntry.isCleared ? "Unclear Transaction" : "Mark as Cleared"}
              </button>
              
              <button
                onClick={onVoid}
                disabled={isPending || selectedEntry.status === "VOIDED"}
                className="w-full h-10 bg-red-950/20 border border-red-900/30 text-red-500 text-[11px] uppercase tracking-wider font-bold rounded-[var(--radius)] hover:bg-red-900/30 transition-colors disabled:opacity-30"
              >
                Void Transaction
              </button>
            </section>
          </div>
        </SovereignSheet>
      )}
    </>
  );
}
