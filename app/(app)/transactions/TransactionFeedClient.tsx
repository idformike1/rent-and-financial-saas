'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  description: string
  amount: number | any
  transactionDate: Date | string
  account: { name: string }
  expenseCategory?: { name: string }
  payee?: string
}

interface Props {
  initialData: Transaction[]
}

export default function TransactionFeedClient({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState('Recent')
  const tabs = ['Recent', 'My transactions', 'Operating expenses']

  return (
    <div className="space-y-8">
      {/* ── 1. HEADER SECTOR ────────────────────────────────────────────── */}
      <div className="space-y-6">
        <h1 className="text-[28px] font-[400] tracking-tight text-white font-sans">
          Master Ledger Feed
        </h1>
        
        <div className="flex items-center gap-8 border-b border-white/[0.05]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-[15px] font-[400] transition-colors relative",
                activeTab === tab 
                  ? "text-white" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. DATA STRATUM ─────────────────────────────────────────────── */}
      <div className="space-y-0">
         {/* THEAD (SURFACE LEVEL) */}
         <div className="grid grid-cols-[1fr,150px,180px,150px] px-4 py-4 text-[11px] font-[400] text-white/20 uppercase tracking-[0.1em] border-b border-white/[0.05] mb-2 bg-[#0a0a0b] sticky top-0 z-10">
            <div>Date & Description</div>
            <div className="text-right">Amount</div>
            <div className="text-left pl-12">Account</div>
            <div className="text-right">Method</div>
         </div>

         <AnimatePresence mode="popLayout">
           {initialData.map((tx, idx) => {
             const isNegative = Number(tx.amount) < 0;
             const displayAmount = Math.abs(Number(tx.amount));
             const initials = (tx.payee || tx.description || 'U').charAt(0).toUpperCase();
             
             return (
               <motion.div
                 key={tx.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.03, duration: 0.3 }}
                 className="group grid grid-cols-[1fr,150px,180px,150px] items-center px-4 h-[72px] hover:bg-white/[0.02] transition-all cursor-pointer border-b border-white/[0.03]"
               >
                 {/* ENTITY BLOCK */}
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.05] flex items-center justify-center text-[15px] text-white/60 font-[400]">
                     {initials}
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[15px] text-[#DDE1E5] font-[400] tracking-tight truncate max-w-[300px]">
                       {tx.description || tx.payee}
                     </span>
                     <span className="text-[14px] text-[#C3C3CC] font-[400]">
                       {format(new Date(tx.transactionDate), 'MMM d')} • {tx.expenseCategory?.name || 'Treasury Inflow'}
                     </span>
                   </div>
                 </div>

                 {/* FISCAL BLOCK */}
                 <div className={cn(
                    "text-[16px] font-[400] text-right font-finance",
                    isNegative ? "text-[#F4F5F9]" : "text-[#6CC08F]"
                 )}>
                   {isNegative ? '−' : ''}${displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </div>

                 {/* ANALYTICAL DIMENSIONS */}
                 <div className="pl-12">
                    <span className="text-[14px] text-[#C3C3CC] font-[400]">
                      {tx.account.name}
                    </span>
                 </div>

                 <div className="text-right text-[14px] text-white/40 font-[400]">
                    Direct Transfer
                 </div>
               </motion.div>
             )
           })}
         </AnimatePresence>
      </div>

      {/* ── 3. OPERATIONAL FOOTER ───────────────────────────────────────── */}
      <div className="py-12 flex justify-center">
         <button className="px-6 py-2 rounded-full border border-white/[0.1] text-[14px] text-white/60 hover:text-white hover:bg-white/[0.05] transition-all font-[400]">
           Load More Activity
         </button>
      </div>
    </div>
  )
}
