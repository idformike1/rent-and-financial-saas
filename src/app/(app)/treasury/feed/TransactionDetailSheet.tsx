'use client';

import React, { useTransition, useMemo } from 'react';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui-finova';
import {
  Sheet,
  SheetOverlay,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { voidTransaction } from '@/actions/finance.actions';
import { Transaction } from './types'


interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  onClose: () => void;
  role?: string;
}

export default function TransactionDetailSheet({ transaction, onClose, role }: TransactionDetailSheetProps) {
  const [isPending, startTransition] = useTransition();
  const isNegative = transaction ? Number(transaction.amount) < 0 : false;
  const absAmount = transaction ? Math.abs(Number(transaction.amount)) : 0;
  const isVoided = transaction?.status === 'VOIDED';

  // Stable Idempotency Key generated once per selection event
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [transaction?.id]);

  const handleVoid = () => {
    if (!transaction) return;
    
    const confirmed = window.confirm(
      "NUCLEAR WARNING: You are about to decommission this fiscal record. This will flag the entry as VOIDED in the permanent ledger and record a non-repudiable audit signature. This action cannot be undone. Proceed?"
    );

    if (confirmed) {
      startTransition(async () => {
        const result = await voidTransaction(transaction.id, idempotencyKey);
        if (result.success) {
          import('@/lib/toast').then(({ toast }) => {
            toast.success("Registry node decommissioned successfully.");
          });
        } else {
          alert(result.message || "Failed to decommission transaction.");
        }
      });
    }
  };

  const handleExport = () => {
    if (!transaction) return;
    window.location.href = `/api/reports/csv?id=${transaction.id}`;
  };

  const handleExternalView = () => {
    import('@/lib/toast').then(({ toast }) => {
      toast.info("Registry Sync: Source document sequestered in secure archive.");
    });
  };

  return (
    <Sheet open={!!transaction} onOpenChange={(open) => !open && onClose()}>
      <SheetOverlay open={!!transaction} />
      <SheetContent open={!!transaction} className="w-[480px] sm:max-w-[480px] border-l border-white/10 flex flex-col overflow-hidden">
        {transaction && (
          <>
            {/* Header / Forensic Stamp */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-white/5 flex items-center justify-center">
                  <span className={cn("text-mercury-heading font-bold", isVoided ? "text-destructive" : "text-white/44")}>[S]</span>
                </div>
                <div>
                  <SheetTitle className="text-mercury-heading text-white">
                    {isVoided ? "Voided Forensic Record" : "Forensic Audit"}
                  </SheetTitle>
                  <SheetDescription className="text-mercury-label-caps text-clinical-muted">
                    TX ID: {transaction.id.substring(0, 8)}
                  </SheetDescription>
                </div>
              </div>
            </div>

            {/* Content Stratum */}
            <div className={cn(
              "flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar transition-all duration-700",
              isVoided && "opacity-50 grayscale"
            )}>
              
              {/* Primary Amount Block */}
              <div className="space-y-2">
                <p className="text-mercury-label-caps text-clinical-muted">Transaction Value</p>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "text-mercury-headline tracking-clinical",
                    isVoided ? "text-white/40" : isNegative ? "text-white" : "text-mercury-green"
                  )}>
                    {isNegative ? '−' : ''}${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-clinical-muted text-mercury-label-caps">USD</span>
                </div>
                <p className="text-mercury-body text-foreground/80 leading-narrative font-normal">
                  {transaction.description || "No description provided"}
                </p>
              </div>

              {/* Forensic Grid */}
              <div className="grid grid-cols-2 gap-y-8 gap-x-12 border-t border-white/5 pt-10">
                <MetadataItem 
                  icon="🗓️" 
                  label="Payment Date" 
                  value={format(new Date(transaction.transactionDate), 'MMMM dd, yyyy')} 
                />
                <MetadataItem 
                  icon="[C]" 
                  label="Category" 
                  value={transaction.expenseCategory?.name || 'Uncategorized'} 
                />
                <MetadataItem 
                  icon="[V]" 
                  label="Source Account" 
                  value={transaction.account.name} 
                />
                <MetadataItem 
                  icon="[M]" 
                  label="Payment Method" 
                  value={transaction.paymentMode === 'BANK' ? 'Bank Transfer' : 'Cash'} 
                />
                <MetadataItem 
                  icon="[A]" 
                  label="Property" 
                  value={transaction.property?.name || 'Global Assets'} 
                />
                <MetadataItem 
                  icon="[U]" 
                  label="Tenant / Payee" 
                  value={transaction.tenant?.name || transaction.payee || 'System Admin'} 
                />
              </div>

              {/* Reference Block */}
              {transaction.referenceText && (
                <div className="space-y-3 pt-4">
                  <p className="text-mercury-label-caps text-clinical-muted">Reference Notes</p>
                  <div className="p-4 rounded-[var(--radius-sm)] bg-white/[0.02] border border-white/5 text-mercury-body text-foreground/80 leading-narrative">
                    {transaction.referenceText}
                  </div>
                </div>
              )}

              {/* Receipt Area */}
              {!isVoided && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-mercury-label-caps text-clinical-muted">Audit Evidence</p>
                    <Button type="button" variant="ghost" onClick={handleExternalView} className="text-mercury-label-caps h-auto p-0 text-clinical-muted hover:text-white flex items-center gap-1.5 transition-colors bg-transparent border-none">
                      ➲ External View
                    </Button>
                  </div>
                  {transaction.receiptUrl ? (
                     <div className="aspect-[3/4] rounded-[var(--radius-sm)] bg-white/[0.03] border border-dashed border-white/10 flex items-center justify-center group cursor-pointer overflow-hidden">
                        <img src={transaction.receiptUrl} alt="Receipt" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
                     </div>
                  ) : (
                    <div className="h-40 rounded-[var(--radius-sm)] bg-white/[0.03] border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-white/[0.05] transition-all">
                     <span className="text-white/10 text-xl font-bold">[_]</span>
                      <p className="text-mercury-body text-clinical-muted">Digital Receipt Missing</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Stratum */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-center min-h-[92px]">
               {isVoided ? (
                 <div className="flex flex-col items-center gap-1 animate-pulse">
                   <p className="text-mercury-label-caps text-clinical-muted">DECOMMISSIONED</p>
                   <p className="text-mercury-label-caps opacity-40">Immutable Record</p>
                 </div>
               ) : (
                 <div className="w-full flex items-center gap-4">
                    <Button type="button" onClick={handleExport} className="flex-1 bg-white hover:bg-white/90 text-black h-11 text-[13px] font-medium rounded-[var(--radius-sm)]">
                      Export Forensic Receipt
                    </Button>
                    {role !== 'VIEWER' && (
                      <Button 
                       type="button"
                       variant="ghost" 
                       onClick={handleVoid}
                       disabled={isPending}
                       className="px-5 border border-white/10 hover:bg-white/5 h-11 text-[13px] font-medium rounded-[var(--radius-sm)] text-white/40 hover:text-destructive transition-colors"
                      >
                        {isPending ? "Voiding..." : "Void Activity"}
                      </Button>
                    )}
                  </div>
               )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MetadataItem({ icon, label, value }: { icon: string, label: string, value: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-mercury-label-caps text-clinical-muted">
        {icon}
        {label}
      </div>
      <p className="text-mercury-heading text-foreground font-normal leading-tight">{value}</p>
    </div>
  );
}
