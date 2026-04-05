'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, ArrowRight } from 'lucide-react'
import { getMasterLedger } from '@/actions/reports.actions'
import { format } from 'date-fns'

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
          // Use search query as category name for drill-down for now
          const data = await getMasterLedger(categoryName);
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-card shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300 border-l-8 border-black">
        <div className="px-8 py-10 border-b-4 border-black flex items-center justify-between bg-zinc-50">
          <div>
            <h2 className="text-2xl font-black text-black uppercase italic tracking-tighter">Line-Item Trace: {categoryName}</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Deep Forensic Audit Log</p>
          </div>
          <button onClick={onClose} className="p-3 border-4 border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none">
            <X className="w-6 h-6 stroke-[3px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Synchronizing Ledger...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border-4 border-dashed border-zinc-100 rounded-3xl">
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">No linked transactions detected</span>
            </div>
          ) : (
            <div className="space-y-4">
               {transactions.map((t) => (
                  <div key={t.id} className="p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl bg-card hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-between group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black bg-zinc-100 px-2 py-0.5 rounded uppercase">{t.account?.category || 'ENTRY'}</span>
                        <p className="text-sm font-black italic tracking-tighter uppercase">{t.description}</p>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">{format(new Date(t.transactionDate), 'PPP')}</p>
                    </div>
                    <div className="text-right">
                       <p className={`text-lg font-black italic tracking-tighter ${t.account?.category === 'EXPENSE' ? 'text-red-600' : 'text-[var(--primary)]'}`}>
                         {t.account?.category === 'EXPENSE' ? '-' : '+'} ${Number(t.amount).toLocaleString()}
                       </p>
                       <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest group-hover:text-black transition-colors">Audit Ref: {t.id.slice(0,8)}</span>
                    </div>
                  </div>
               ))}
            </div>
          )}
        </div>
        
        <div className="p-8 border-t-4 border-black bg-zinc-50 flex justify-end">
           <button onClick={onClose} className="px-8 py-4 bg-black text-white text-xs font-black uppercase tracking-widest italic hover:bg-zinc-800 transition-colors">
             Close Audit View
           </button>
        </div>
      </div>
    </>
  );
}
