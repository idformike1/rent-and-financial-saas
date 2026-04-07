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

/**
 * MERCURY TRANSACTION FEED (V.3.2 RECONSTRUCTION)
 * 1:1 Pixel Parity Patch.
 */
export default function TransactionFeedClient({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState('Recent')
  const tabs = ['Recent', 'My transactions', 'Operating expenses']

  // MERCURY GRID SPEC: 
  // Avatar(42) | Gap(16) | Desc(310) | Amount(130) | Account(192) | Method(185)
  const GRID_CLASS = "grid grid-cols-[48px_1fr_120px_160px_140px] gap-4 items-center px-6"

  return (
    <div className="space-y-8 bg-[#161821] -mx-8 -mt-8 p-8 min-h-screen">
      {/* ── 1. HEADER SECTOR ────────────────────────────────────────────── */}
      <div className="space-y-6">
        <h1 className="text-[28px] font-[400] tracking-tight text-[#DDE1E5] font-sans">
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
                  : "text-[#9D9DA8] hover:text-white/60"
              )}
            >
              <span className="tracking-tight">{tab}</span>
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
         <div className={cn(GRID_CLASS, "py-3 text-[11px] font-[400] text-[#9D9DA8] uppercase tracking-[0.08em] border-b border-white/[0.05] mb-2 bg-[#161821] sticky top-[-32px] z-10")}>
            <div></div>
            <div>Date & Description</div>
            <div className="text-right">Amount</div>
            <div className="text-left pl-12">Account</div>
            <div className="text-right">Method</div>
         </div>

         <AnimatePresence mode="popLayout">
           {initialData.map((tx, idx) => {
             const isNegative = Number(tx.amount) < 0;
             const displayAmount = Math.abs(Number(tx.amount));
             const initials = (tx.payee || tx.description || 'U').substring(0, 2).toUpperCase();
             
             return (
               <motion.div
                 key={tx.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.02, duration: 0.25 }}
                 className={cn(GRID_CLASS, "h-[72px] hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] group")}
               >
                 {/* AVATAR BLOCK */}
                 <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.03] flex items-center justify-center text-[13px] text-white/50 font-[400]">
                    {initials}
                 </div>

                 {/* DESCRIPTION BLOCK */}
                 <div className="flex flex-col min-w-0">
                   <span className="text-[15px] text-[#DDE1E5] font-[400] tracking-tight truncate">
                     {tx.description || tx.payee}
                   </span>
                   <span className="text-[14px] text-[#C3C3CC] font-[400] tracking-tight">
                     {format(new Date(tx.transactionDate), 'MMM d')} • {tx.expenseCategory?.name || 'Treasury Inflow'}
                   </span>
                 </div>

                 {/* FISCAL BLOCK */}
                 <div className={cn(
                    "text-[16px] font-[400] text-right font-finance",
                    isNegative ? "text-[#F4F5F9]" : "text-[#6CC08F]"
                 )}>
                   {isNegative ? '−' : ''}${displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </div>

                 {/* ACCOUNT BLOCK */}
                 <div className="pl-12">
                    <span className="text-[14px] text-[#C3C3CC] font-[400] tracking-tight truncate block">
                      {tx.account.name}
                    </span>
                 </div>

                 {/* METHOD BLOCK */}
                 <div className="text-right text-[14px] text-[#9D9DA8] font-[400] tracking-tight">
                    Direct Transfer
                 </div>
               </motion.div>
             )
           })}
         </AnimatePresence>
      </div>

      {/* ── 3. OPERATIONAL FOOTER ───────────────────────────────────────── */}
      <div className="py-12 flex justify-center">
         <button className="px-6 h-9 rounded-full border border-white/[0.1] text-[13px] text-[#9D9DA8] hover:text-white hover:bg-white/[0.05] transition-all font-[400] tracking-tight">
           Load More Activity
         </button>
      </div>
    </div>
  )
}
