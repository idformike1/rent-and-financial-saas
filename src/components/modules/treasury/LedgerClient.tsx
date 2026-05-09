"use client";

import React, { useState, useMemo, useTransition, useOptimistic } from "react";
import { DataTable } from '@/src/components/system/DataTable';
import { SideSheet } from '@/src/components/system/SideSheet';
import { voidTransaction, clearTransaction } from "@/actions/finance.actions";
import { cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { toast } from "@/lib/toast";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPendingNav, startTransition] = useTransition();
  const currentType = searchParams.get('type') || 'ALL';

  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMutationPending, setIsMutationPending] = useState(false);

  // OPTIMISTIC UI ENGINE
  const [optimisticEntries, updateOptimisticEntries] = useOptimistic(
    initialData,
    (state, { id, isCleared, status }: { id: string, isCleared?: boolean, status?: string }) => {
      return state.map(e => {
        if (e.id === id) {
          return {
            ...e,
            isCleared: isCleared !== undefined ? isCleared : e.isCleared,
            status: status !== undefined ? status : e.status
          };
        }
        return e;
      });
    }
  );

  const setFilter = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'ALL') params.delete('type');
    else params.set('type', type);
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

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

  const idempotencyKey = useMemo(() => crypto.randomUUID(), [selectedEntry?.id]);

  const onVoid = async () => {
    if (!selectedEntry) return;
    if (confirm("This action is immutable. A corrective entry will be required.")) {
      setIsMutationPending(true);
      
      // 1. Fire Optimistic Update
      updateOptimisticEntries({ id: selectedEntry.id, status: 'VOIDED' });
      
      try {
        const res = await voidTransaction(selectedEntry.id, idempotencyKey);
        if (!res.success) {
          toast.error(res.message || "Void failed. Security protocols active.");
        } else {
          setIsSheetOpen(false);
        }
      } catch (e) {
        toast.error("Network synchronization failure.");
      } finally {
        setIsMutationPending(false);
      }
    }
  };

  const onToggleClear = async () => {
    if (!selectedEntry) return;
    setIsMutationPending(true);
    
    const nextClearedState = !selectedEntry.isCleared;
    
    // 1. Fire Optimistic Update
    updateOptimisticEntries({ id: selectedEntry.id, isCleared: nextClearedState });
    
    try {
      const res = await clearTransaction(selectedEntry.id, selectedEntry.isCleared);
      if (!res.success) {
        toast.error(res.message || "Clearance failed.");
      } else {
        setIsSheetOpen(false);
      }
    } catch (e) {
      toast.error("Persistence layer unreachable.");
    } finally {
      setIsMutationPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-muted/20 border border-border rounded-lg">
          {['ALL', 'INCOME', 'EXPENSE'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "px-6 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-[0.1em] transition-all",
                currentType === type 
                  ? "bg-foreground text-background shadow-lg" 
                  : "text-foreground/40 hover:text-foreground/60 hover:bg-muted/30"
              )}
            >
              {type}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 text-foreground/30">
          <Filter size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Surveillance Filter Active</span>
        </div>
      </div>

      <DataTable
        data={optimisticEntries}
        isLoading={isPendingNav}
        columns={columns}
        onRowClick={handleRowClick}
        getRowClassName={(item) => item.status === "VOIDED" ? "opacity-40" : ""}
      />

      {selectedEntry && (
        <SideSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          title="Transaction Intelligence Profile"
          size="md"
        >
          <div className="space-y-12">
            <section>
              <div className="bg-muted/20 border border-border p-8 rounded-[var(--radius-sm)] shadow-lg backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 mb-3">Total Throughput Positioning</div>
                <div className={cn(
                  "text-display font-weight-display tabular-nums tracking-clinical text-4xl",
                  selectedEntry.status === "VOIDED" ? "text-foreground/20 line-through" : "text-foreground"
                )}>
                  ${Number(selectedEntry.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex justify-between items-center py-4 border-b border-border">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.15em]">Temporal Node</span>
                <span className="text-[14px] font-medium text-foreground tracking-clinical">{new Date(selectedEntry.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-border">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.15em]">Registry Status</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-[var(--radius-sm)] border",
                  selectedEntry.status === "VOIDED" ? "bg-destructive/10 border-destructive/20 text-destructive/80" : "bg-mercury-green/10 border-mercury-green/20 text-mercury-green"
                )}>
                  {selectedEntry.status}
                </span>
              </div>
            </section>

            <section className="pt-8 flex flex-col gap-4">
              <button
                onClick={onToggleClear}
                disabled={isMutationPending || isPendingNav || selectedEntry.status === "VOIDED"}
                className="w-full h-12 bg-foreground text-background text-[11px] font-bold uppercase tracking-[0.15em] rounded-[var(--radius-sm)] hover:bg-foreground/90 transition-all disabled:opacity-30 border-none"
              >
                {selectedEntry.isCleared ? "Relinquish Clearance" : "Authorize Settlement"}
              </button>
              
              <button
                onClick={onVoid}
                disabled={isMutationPending || isPendingNav || selectedEntry.status === "VOIDED"}
                className="w-full h-12 bg-destructive/10 border border-destructive/20 text-destructive/80 text-[11px] font-bold uppercase tracking-[0.15em] rounded-[var(--radius-sm)] hover:bg-destructive/20 transition-all disabled:opacity-30"
              >
                Void Immutable Entry
              </button>
            </section>
          </div>
        </SideSheet>
      )}
    </div>
  );
}
