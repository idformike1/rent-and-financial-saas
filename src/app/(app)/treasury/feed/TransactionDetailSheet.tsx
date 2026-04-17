'use client';

import React, { useTransition } from 'react';

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
}

export default function TransactionDetailSheet({ transaction, onClose }: TransactionDetailSheetProps) {
  const [isPending, startTransition] = useTransition();
  const isNegative = transaction ? Number(transaction.amount) < 0 : false;
  const absAmount = transaction ? Math.abs(Number(transaction.amount)) : 0;
  const isVoided = transaction?.status === 'VOIDED';

  const handleVoid = () => {
    if (!transaction) return;
    
    const confirmed = window.confirm(
      "NUCLEAR WARNING: You are about to decommission this fiscal record. This will flag the entry as VOIDED in the permanent ledger and record a non-repudiable audit signature. This action cannot be undone. Proceed?"
    );

    if (confirmed) {
      startTransition(async () => {
        const result = await voidTransaction(transaction.id);
        if (result.success) {
          // Re-sync occurs via revalidatePath, 
          // but we can close or let the user see the new state
        } else {
          alert(result.message || "Failed to decommission transaction.");
        }
      });
    }
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
                <div className="w-8 h-8 rounded-[var(--radius)] bg-white/5 flex items-center justify-center">
                  <span className={cn("text-[16px] font-bold", isVoided ? "text-destructive" : "text-white/44")}>[S]</span>
                </div>
                <div>
                  <SheetTitle className="text-[14px] font-medium text-white">
                    {isVoided ? "Voided Forensic Record" : "Forensic Audit"}
                  </SheetTitle>
                  <SheetDescription className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
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
                <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold">Transaction Value</p>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "text-[42px] font-medium tracking-tight font-finance",
                    isVoided ? "text-white/40" : isNegative ? "text-white" : "text-mercury-green"
                  )}>
                    {isNegative ? '−' : ''}${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-white/20 text-[16px] font-normal uppercase">USD</span>
                </div>
                <p className="text-[15px] text-white/60 leading-relaxed font-normal">
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
                  <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold">Reference Notes</p>
                  <div className="p-4 rounded-[var(--radius)] bg-white/[0.02] border border-white/5 text-[14px] text-white/70 leading-relaxed">
                    {transaction.referenceText}
                  </div>
                </div>
              )}

              {/* Receipt Area */}
              {!isVoided && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold">Audit Evidence</p>
                    <Button type="button" variant="ghost" disabled={false} className="text-[10px] h-auto p-0 text-white/40 hover:text-white flex items-center gap-1.5 transition-colors bg-transparent border-none">
                      ➲ External View
                    </Button>
                  </div>
                  {transaction.receiptUrl ? (
                     <div className="aspect-[3/4] rounded-[var(--radius)] bg-white/[0.03] border border-dashed border-white/10 flex items-center justify-center group cursor-pointer overflow-hidden">
                        <img src={transaction.receiptUrl} alt="Receipt" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
                     </div>
                  ) : (
                    <div className="h-40 rounded-[var(--radius)] bg-white/[0.03] border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-white/[0.05] transition-all">
                     <span className="text-white/10 text-xl font-bold">[_]</span>
                      <p className="text-[12px] text-white/20 font-medium tracking-wide">Digital Receipt Missing</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Stratum */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-center min-h-[92px]">
               {isVoided ? (
                 <div className="flex flex-col items-center gap-1 animate-pulse">
                   <p className="text-[11px] text-white/20 uppercase tracking-[0.3em] font-bold">DECOMMISSIONED</p>
                   <p className="text-[10px] text-white/10 uppercase tracking-tighter">Immutable Record</p>
                 </div>
               ) : (
                 <div className="w-full flex items-center gap-4">
                   <Button type="button" disabled={false} className="flex-1 bg-white hover:bg-white/90 text-black h-11 text-[13px] font-medium rounded-[var(--radius)]">
                     Export Forensic Receipt
                   </Button>
                   <Button 
                    type="button"
                    variant="ghost" 
                    onClick={handleVoid}
                    disabled={isPending}
                    className="px-5 border border-white/10 hover:bg-white/5 h-11 text-[13px] font-medium rounded-[var(--radius)] text-white/40 hover:text-destructive transition-colors"
                   >
                     {isPending ? "Voiding..." : "Void Activity"}
                   </Button>
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
      <div className="flex items-center gap-2 text-white/30 uppercase tracking-widest text-[10px] font-bold">
        {icon}
        {label}
      </div>
      <p className="text-[14px] text-white/80 font-normal leading-tight">{value}</p>
    </div>
  );
}
