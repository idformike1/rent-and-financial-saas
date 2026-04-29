'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, ArrowRight } from 'lucide-react'
import { getMasterLedger } from '@/actions/analytics.actions'
import { format } from 'date-fns'
import { Button } from '@/src/components/finova/ui-finova'

interface DrillDownDrawerProps {
  categoryName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DrillDownDrawer({ categoryName, isOpen, onClose }: DrillDownDrawerProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && categoryName) {
      const fetchTransactions = async () => {
        setIsLoading(true);
        try {
          const data = await getMasterLedger({ category: categoryName });
          setTransactions(data);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTransactions();
    }
  }, [isOpen, categoryName]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0  z-[100] animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-card z-[101] flex flex-col animate-in slide-in-from-right duration-300 border-l border-border">
        <div className="px-8 py-8 border-b border-border flex items-center justify-between bg-card">
          <div>
            <h2 className="text-lg font-bold text-foreground uppercase">Line-Item Trace: {categoryName}</h2>
            <p className="text-[10px] font-bold text-clinical-muted uppercase mt-1">Deep Forensic Audit Log</p>
          </div>
          <Button type="button" variant="ghost" disabled={false} onClick={onClose} className="p-2 border border-border rounded-[var(--radius-sm)] hover:bg-muted transition-all text-clinical-muted hover:text-foreground bg-transparent">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-[10px] font-bold uppercase text-clinical-muted">Synchronizing Ledger...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-[var(--radius-sm)]">
               <span className="text-[10px] font-bold uppercase text-clinical-muted">No linked transactions detected</span>
            </div>
          ) : (
            <div className="space-y-3">
               {transactions.map((t) => (
                  <div key={t.id} className="p-5 border border-border rounded-[var(--radius-sm)] bg-card hover:bg-muted transition-all flex items-center justify-between group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold bg-muted px-2 py-0.5 rounded-[4px] uppercase text-clinical-muted">{t.account?.category || 'ENTRY'}</span>
                        <p className="text-sm font-bold tracking-clinical uppercase text-foreground">{t.description}</p>
                      </div>
                      <p className="text-[10px] font-bold text-clinical-muted uppercase">{format(new Date(t.transactionDate), 'PPP')}</p>
                    </div>
                    <div className="text-right">
                       <p className={`text-lg font-bold tracking-clinical font-finance ${t.account?.category === 'EXPENSE' ? 'text-destructive' : 'text-primary'}`}>
                         {t.account?.category === 'EXPENSE' ? '-' : '+'} ${Number(t.amount).toLocaleString()}
                       </p>
                       <span className="text-[8px] font-bold text-clinical-muted uppercase group-hover:text-foreground transition-colors">Audit Ref: {t.id.slice(0,8)}</span>
                    </div>
                  </div>
               ))}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-border bg-card flex justify-end">
           <Button type="button" variant="primary" disabled={false} onClick={onClose} className="px-6 py-3 h-10 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-[var(--radius-sm)] hover:bg-primary/90 transition-colors">
             Close Audit View
           </Button>
        </div>
      </div>
    </>
  );
}
