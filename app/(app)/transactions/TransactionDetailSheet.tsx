'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Home, Tag, CreditCard, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui-finova';

interface Transaction {
  id: string;
  description: string;
  amount: number | any;
  transactionDate: Date | string;
  account: { name: string };
  expenseCategory?: { name: string };
  payee?: string;
  paymentMode?: 'CASH' | 'BANK';
  referenceText?: string;
  property?: { name: string };
  tenant?: { name: string };
  receiptUrl?: string;
}

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionDetailSheet({ transaction, onClose }: TransactionDetailSheetProps) {
  if (!transaction) return null;

  const isNegative = Number(transaction.amount) < 0;
  const absAmount = Math.abs(Number(transaction.amount));

  return (
    <AnimatePresence>
      {transaction && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100]"
          />

          {/* Side-Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[480px] bg-[#161821] border-l border-white/10 shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header / Forensic Stamp */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <ShieldCheck size={16} className="text-white/40" />
                </div>
                <div>
                  <h2 className="text-[14px] font-medium text-white">Forensic Audit</h2>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">TX ID: {transaction.id.substring(0, 8)}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Stratum */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              
              {/* Primary Amount Block */}
              <div className="space-y-2">
                <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold">Transaction Value</p>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "text-[42px] font-medium tracking-tight",
                    isNegative ? "text-white" : "text-[#6CC08F]"
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
                  icon={<Calendar size={14} />} 
                  label="Payment Date" 
                  value={format(new Date(transaction.transactionDate), 'MMMM dd, yyyy')} 
                />
                <MetadataItem 
                  icon={<Tag size={14} />} 
                  label="Category" 
                  value={transaction.expenseCategory?.name || 'Uncategorized'} 
                />
                <MetadataItem 
                  icon={<CreditCard size={14} />} 
                  label="Source Account" 
                  value={transaction.account.name} 
                />
                <MetadataItem 
                  icon={<FileText size={14} />} 
                  label="Payment Method" 
                  value={transaction.paymentMode === 'BANK' ? 'Bank Transfer' : 'Cash'} 
                />
                <MetadataItem 
                  icon={<Home size={14} />} 
                  label="Property" 
                  value={transaction.property?.name || 'Global Assets'} 
                />
                <MetadataItem 
                  icon={<User size={14} />} 
                  label="Tenant / Payee" 
                  value={transaction.tenant?.name || transaction.payee || 'System Admin'} 
                />
              </div>

              {/* Reference Block */}
              {transaction.referenceText && (
                <div className="space-y-3 pt-4">
                  <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold">Reference Notes</p>
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-[14px] text-white/70 leading-relaxed">
                    {transaction.referenceText}
                  </div>
                </div>
              )}

              {/* Receipt Mockup Area */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold">Audit Evidence</p>
                  <button className="text-[10px] text-white/40 hover:text-white flex items-center gap-1.5 transition-colors">
                    <ExternalLink size={10} />
                    External View
                  </button>
                </div>
                {transaction.receiptUrl ? (
                   <div className="aspect-[3/4] rounded-xl bg-white/[0.03] border border-dashed border-white/10 flex items-center justify-center group cursor-pointer overflow-hidden">
                      <img src={transaction.receiptUrl} alt="Receipt" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
                   </div>
                ) : (
                  <div className="h-40 rounded-xl bg-white/[0.03] border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-white/[0.05] transition-all">
                    <FileText size={24} className="text-white/10 group-hover:text-white/20 transition-colors" />
                    <p className="text-[12px] text-white/20 font-medium tracking-wide">Digital Receipt Missing</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Stratum */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center gap-4">
               <Button className="flex-1 bg-white hover:bg-white/90 text-black h-11 text-[13px] font-medium rounded-lg">
                 Export Forensic Receipt
               </Button>
               <Button variant="ghost" className="px-5 border border-white/10 hover:bg-white/5 h-11 text-[13px] font-medium rounded-lg">
                 Void Activity
               </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MetadataItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
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
