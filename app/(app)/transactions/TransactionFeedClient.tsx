'use client'

import React, { useState, useMemo } from 'react'
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

const GRID_CLASS = "grid grid-cols-[32px_80px_minmax(250px,2fr)_120px_140px_140px_140px] gap-4 items-center px-6"

export default function TransactionFeedClient({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState('Recent')
  const tabs = ['Recent', 'My transactions', 'Operating expenses']

  // Fiscal calculations
  const summary = useMemo(() => {
    let moneyIn = 0
    let moneyOut = 0
    initialData.forEach(tx => {
      const amt = Number(tx.amount)
      if (amt >= 0) moneyIn += amt
      else moneyOut += Math.abs(amt)
    })
    return {
      moneyIn,
      moneyOut,
      netChange: moneyIn - moneyOut
    }
  }, [initialData])

  const formatAmountParts = (amount: number) => {
    const formatted = amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
    const parts = formatted.split('.')
    return {
      whole: parts[0],
      cents: parts[1]
    }
  }

  return (
    <div className="space-y-8 bg-[#161821] -mx-8 -mt-8 p-8 min-h-screen font-sans">
      {/* ── 1. HEADER SECTOR ────────────────────────────────────────────── */}
      <div className="space-y-6">
        <h1 className="text-[28px] font-[400] tracking-tight text-[#DDE1E5]">
          Master Ledger Feed
        </h1>

        {/* ── FISCAL SUMMARY ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-8 pb-4 border-b border-white/[0.05]">
          <div className="space-y-1">
            <p className="text-[12px] text-[#9D9DA8] font-[400] uppercase tracking-wider">Net change this month</p>
            <p className="text-[24px] text-white font-[400] tracking-tight">
              {summary.netChange < 0 ? '−' : ''}${Math.abs(summary.netChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] text-[#9D9DA8] font-[400] uppercase tracking-wider">Money in</p>
            <p className="text-[24px] text-[#6CC08F] font-[400] tracking-tight">
              +${summary.moneyIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] text-[#9D9DA8] font-[400] uppercase tracking-wider">Money out</p>
            <p className="text-[24px] text-white font-[400] tracking-tight">
              −${summary.moneyOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
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
         <div className={cn(GRID_CLASS, "py-2.5 text-[11px] font-[400] text-[#9D9DA8] uppercase tracking-[0.08em] border-b border-white/[0.05] mb-1 bg-[#161821] sticky top-[-32px] z-10")}>
            <div className="flex justify-center">
              <div className="w-4 h-4 border border-white/20 rounded-sm" />
            </div>
            <div>Date</div>
            <div>Entity & Description</div>
            <div className="text-right">Amount</div>
            <div className="text-left pl-4">Account</div>
            <div className="text-left">Method</div>
            <div className="text-left">Category</div>
         </div>

         <AnimatePresence mode="popLayout">
           {initialData.map((tx, idx) => {
             const amt = Number(tx.amount)
             const isNegative = amt < 0;
             const displayAmount = Math.abs(amt);
             const { whole, cents } = formatAmountParts(displayAmount);
             const initials = (tx.payee || tx.description || 'U').substring(0, 2).toUpperCase();
             
             return (
               <motion.div
                 key={tx.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.015, duration: 0.2 }}
                 className={cn(GRID_CLASS, "h-[56px] hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] group")}
               >
                 {/* CHECKBOX BLOCK */}
                 <div className="flex justify-center">
                    <div className="w-4 h-4 border border-white/20 rounded-sm group-hover:border-white/40 transition-colors" />
                 </div>

                 {/* DATE BLOCK */}
                 <div className="text-[14px] text-[#C3C3CC] font-[400] tracking-tight">
                    {format(new Date(tx.transactionDate), 'MMM d')}
                 </div>

                 {/* ENTITY BLOCK */}
                 <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.03] flex items-center justify-center text-[11px] text-white/50 font-[400] shrink-0">
                      {initials}
                    </div>
                    <span className="text-[14px] text-[#DDE1E5] font-[400] tracking-tight truncate">
                      {tx.description || tx.payee}
                    </span>
                 </div>

                 {/* FISCAL BLOCK */}
                 <div className={cn(
                    "text-[15px] font-[400] text-right font-finance whitespace-nowrap",
                    isNegative ? "text-[#F4F5F9]" : "text-[#6CC08F]"
                 )}>
                   {isNegative ? '−' : ''}${whole}<span className="text-[11px] align-top relative top-[1px] ml-0.5">{cents}</span>
                 </div>

                 {/* ACCOUNT BLOCK */}
                 <div className="pl-4">
                    <span className="text-[13px] text-[#C3C3CC] font-[400] tracking-tight truncate block">
                      {tx.account.name}
                    </span>
                 </div>

                 {/* METHOD BLOCK */}
                 <div className="text-[13px] text-[#9D9DA8] font-[400] tracking-tight">
                    Direct Transfer
                 </div>

                 {/* CATEGORY BLOCK */}
                 <div className="text-[13px] text-[#9D9DA8] font-[400] tracking-tight truncate">
                    {tx.expenseCategory?.name || 'Inflow'}
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
