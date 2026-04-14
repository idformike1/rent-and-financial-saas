'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { 
  X, Filter, RotateCcw, LayoutGrid, LayoutList, Download,
  TrendingUp, BarChart3, ChevronDown, Search
} from 'lucide-react'

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

const GRID_CLASS = "grid grid-cols-[32px_80px_minmax(250px,2fr)_120px_200px_180px_180px] gap-6 items-center"

export default function TransactionFeedClient({ initialData }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 1. URL-Synchronized State
  const q = searchParams.get('q') || ''
  const cat = searchParams.get('cat') || 'ALL'
  const start = searchParams.get('start') || ''
  const end = searchParams.get('end') || ''

  // Local UI state for fluid typing (immediate feedback)
  const [searchInput, setSearchInput] = useState(q)
  const [activeTab, setActiveTab] = useState('Recent')
  const [isExportOpen, setIsExportOpen] = useState(false)

  const tabs = ['Recent', 'My transactions', 'Operating expenses']

  // 2. Navigation Helper (Deep Linking)
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'ALL') {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
      })
      return newParams.toString()
    },
    [searchParams]
  )

  // 3. Debounced Search Synchronization
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== q) {
        router.push(pathname + '?' + createQueryString({ q: searchInput }), { scroll: false })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, q, pathname, router, createQueryString])

  const filteredData = useMemo(() => {
    return initialData.filter(tx => {
      const matchesSearch = 
        tx.description?.toLowerCase().includes(q.toLowerCase()) ||
        tx.account?.name?.toLowerCase().includes(q.toLowerCase()) ||
        tx.payee?.toLowerCase().includes(q.toLowerCase());
      
      const date = new Date(tx.transactionDate);
      const matchesStart = start ? date >= new Date(start) : true;
      const matchesEnd = end ? date <= new Date(end) : true;
      
      const matchesCategory = cat === 'ALL' ? true : 
                            cat === 'INCOME' ? Number(tx.amount) >= 0 :
                            cat === 'EXPENSE' ? Number(tx.amount) < 0 :
                            true;

      return matchesSearch && matchesStart && matchesEnd && matchesCategory;
    });
  }, [initialData, q, start, end, cat]);

  // Fiscal calculations
  const summary = useMemo(() => {
    let moneyIn = 0
    let moneyOut = 0
    filteredData.forEach(tx => {
      const amt = Number(tx.amount)
      if (amt >= 0) moneyIn += amt
      else moneyOut += Math.abs(amt)
    })
    return {
      moneyIn,
      moneyOut,
      netChange: moneyIn - moneyOut
    }
  }, [filteredData])

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
    <div className="space-y-0 bg-[#161821] min-h-screen font-sans selection:bg-white/10">
      
      {/* ── 1. PRIMARY SECTOR: NAVIGATION & TITLE ────────────────────────── */}
      <div className="pt-2 pb-6 space-y-8 sticky top-0 z-40 bg-[#161821]/80 backdrop-blur-md border-b border-white/[0.05]">
        <div className="flex items-center justify-between px-0">
            <h1 className="text-[28px] font-[400] text-[#DDE1E5]">
               Master Ledger Feed
            </h1>
            <div className="flex items-center gap-3">
               <div className="relative group w-64 mr-4">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9D9DA8] group-focus-within:text-white transition-colors" />
                  <input 
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search ledger..."
                    className="w-full h-8 bg-white/[0.03] border border-white/[0.08] rounded-full pl-9 pr-4 text-[13px] text-white placeholder-[#9D9DA8]/40 focus:outline-none focus:border-white/20 transition-all font-[380] tracking-tight"
                  />
               </div>
               <button className="px-3 py-1.5 rounded-full border border-white/[0.08] text-[12px] text-[#9D9DA8] flex items-center gap-2 hover:bg-white/[0.03] transition-all">
                  <LayoutGrid size={13} /> Grid
               </button>
            </div>
        </div>
        
        <div className="flex items-center gap-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-5 text-[15px] font-[400] transition-colors relative",
                activeTab === tab 
                  ? "text-white" 
                  : "text-[#9D9DA8] hover:text-white/60"
              )}
            >
              <span>{tab}</span>
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

      {/* ── 2. ANALYTICAL VISUALIZER BLOCK ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-0 border-b border-white/[0.05] sticky top-[120px] z-30 bg-[#161821]/80 backdrop-blur-md">
         {/* Net Summary Column */}
         <div className="py-10 border-r border-white/[0.05] space-y-6">
            <div className="space-y-1">
               <p className="text-[12px] text-[#9D9DA8] font-[400] uppercase tracking-widest">Net change this month</p>
               <p className="text-[24px] text-white font-[400]">
                  {summary.netChange < 0 ? '−' : ''}${Math.abs(summary.netChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
               </p>
            </div>
            <div className="flex items-center gap-10 pt-2">
               <div className="space-y-1">
                  <p className="text-[11px] text-[#9D9DA8] font-[400] uppercase tracking-wider">Money in</p>
                  <p className="text-[16px] text-[#6CC08F] font-[400]">
                     +${summary.moneyIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
               </div>
               <div className="space-y-1">
                  <p className="text-[11px] text-[#9D9DA8] font-[400] uppercase tracking-wider">Money out</p>
                  <p className="text-[16px] text-[#DDE1E5] font-[400]">
                     −${summary.moneyOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
               </div>
            </div>
         </div>

         {/* Trend Line Visualizer (Placeholder) */}
         <div className="py-10 border-r border-white/[0.05] flex flex-col justify-between">
            <div className="flex items-center justify-between">
               <p className="text-[12px] text-[#9D9DA8] font-[400] uppercase tracking-widest">Cashflow Velocity</p>
               <TrendingUp size={14} className="text-[#6CC08F]" />
            </div>
            <div className="flex-1 w-full flex items-center justify-center opacity-20">
               <svg className="w-full h-16" preserveAspectRatio="none">
                  <path d="M0 40 Q 50 10, 100 30 T 200 10 T 300 40 T 400 20" stroke="white" strokeWidth="1.5" fill="none" />
               </svg>
            </div>
         </div>

         {/* Category Bar Visualizer (Placeholder) */}
         <div className="py-10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
               <p className="text-[12px] text-[#9D9DA8] font-[400] uppercase tracking-widest">To/From Breakdown</p>
               <BarChart3 size={14} className="text-[#9D9DA8]" />
            </div>
            <div className="space-y-3 pt-4">
               {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-1.5 opacity-20">
                     <div className="h-1 bg-white/40 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-white w-[60%]" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* ── 3. FILTER TOOLBAR ────────────────────────────────────────────── */}
      <div className="py-5 flex items-center justify-between bg-[#161821]/80 backdrop-blur-md border-b border-white/[0.05] sticky top-[324px] z-20">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2d2e39] border border-white/[0.08] rounded-full text-[13px] text-white">
                Active View <X 
                  size={12} 
                  className="text-[#9D9DA8] cursor-pointer hover:text-white" 
                  onClick={() => router.push(pathname)}
                />
             </div>
             <button className="flex items-center gap-2 px-4 py-1.5 border border-white/[0.08] rounded-full text-[13px] text-[#C3C3CC] hover:bg-white/[0.03]">
                <Filter size={13} /> Filters <span className="opacity-40 ml-1">({q || cat !== 'ALL' ? 1 : 0})</span>
             </button>
          </div>
          <div className="flex items-center gap-6">
             <button 
               onClick={() => {
                 setSearchInput('');
                 router.push(pathname);
               }}
               className="text-[12px] text-[#9D9DA8] flex items-center gap-2 hover:text-white transition-all"
             >
                <RotateCcw size={12} /> Reset
             </button>
             <div className="h-4 w-[1px] bg-white/[0.05]" />
             
             {/* Category Toggle */}
             <select 
               value={cat}
               onChange={(e) => router.push(pathname + '?' + createQueryString({ cat: e.target.value }))}
               className="bg-transparent text-[12px] text-[#C3C3CC] border-none outline-none cursor-pointer hover:text-white transition-colors"
             >
                <option value="ALL">All Flows</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expenses</option>
             </select>

             <div className="h-4 w-[1px] bg-white/[0.05]" />
             <div className="flex items-center gap-2">
                <LayoutList size={14} className="text-white" />
                <LayoutGrid size={14} className="text-[#9D9DA8] opacity-40 cursor-not-allowed" />
             </div>
             
             <div className="relative">
                <button 
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className="flex items-center gap-2 text-[12px] text-[#C3C3CC] hover:text-white px-3 py-1.5 border border-white/[0.08] rounded-md transition-all bg-white/[0.02]"
                >
                   <Download size={13} /> Export
                   <ChevronDown size={12} className={cn("transition-transform", isExportOpen ? "rotate-180" : "")} />
                </button>

                <AnimatePresence>
                  {isExportOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-40 bg-[#1e1e2a] border border-white/[0.08] rounded-lg shadow-xl z-[100] overflow-hidden"
                    >
                      {['CSV', 'PDF', 'Word'].map((format) => (
                        <button
                          key={format}
                          onClick={() => {
                            const params = new URLSearchParams({ q, start, end, cat });
                            window.open(`/api/reports/${format.toLowerCase()}?${params.toString()}`, '_blank');
                            setIsExportOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[12px] text-[#9D9DA8] hover:text-white hover:bg-white/[0.03] transition-colors"
                        >
                          Export to {format}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
      </div>

      {/* ── 4. DATA STRATUM (HYPER-DENSITY) ──────────────────────────────── */}
      <div className="space-y-0 relative">
         {/* THEAD (SURFACE LEVEL) */}
         <div className={cn(GRID_CLASS, "py-3 text-[11px] font-[400] text-[#9D9DA8] uppercase tracking-[0.08em] border-b border-white/[0.05] bg-[#161821]/80 backdrop-blur-md sticky top-[385px] z-50")}>
            <div className="flex justify-center">
              <div className="w-3.5 h-3.5 border border-white/20 rounded-[3px]" />
            </div>
            <div>Date</div>
            <div>Entity & Description</div>
            <div className="text-right">Amount</div>
            <div className="text-left pl-6">Account</div>
            <div className="text-left">Method</div>
            <div className="text-left">Category</div>
         </div>

         <AnimatePresence mode="popLayout">
           {filteredData.map((tx, idx) => {
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
                 transition={{ delay: idx * 0.012, duration: 0.18 }}
                 className={cn(GRID_CLASS, "h-[48px] hover:bg-white/[0.03] transition-colors border-b border-white/[0.025] group cursor-pointer active:bg-white/[0.05] relative z-0")}
               >
                 {/* CHECKBOX BLOCK */}
                 <div className="flex justify-center">
                    <div className="w-3.5 h-3.5 border border-white/10 rounded-[3px] group-hover:border-white/30 transition-colors" />
                 </div>

                 {/* DATE BLOCK */}
                 <div className="text-[14px] leading-[20px] text-[#C3C3CC] font-[400]">
                    {format(new Date(tx.transactionDate), 'MMM d')}
                 </div>

                 {/* ENTITY BLOCK */}
                 <div className="flex items-center gap-4 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.03] flex items-center justify-center text-[10px] text-white/50 font-[400] shrink-0">
                      {initials}
                    </div>
                    <span className="text-[15px] leading-[24px] text-[#DDDDE5] font-[400] truncate">
                       {tx.description || tx.payee}
                     </span>
                 </div>

                 {/* FISCAL BLOCK */}
                 <div className={cn(
                    "text-[15px] font-[400] text-right font-finance whitespace-nowrap",
                    isNegative ? "text-[#F4F5F9]" : "text-[#6CC08F]"
                 )}>
                   {isNegative ? '−' : ''}${whole}<span className="text-[11px] opacity-60 ml-0.5">{cents}</span>
                 </div>

                 {/* ACCOUNT BLOCK */}
                 <div className="pl-6">
                    <span className="text-[14px] leading-[20px] text-[#F4F5F9] font-[400] truncate block">
                      {tx.account.name}
                    </span>
                 </div>

                 {/* METHOD BLOCK */}
                 <div className="text-[14px] leading-[20px] text-[#F4F5F9] font-[400]">
                    Direct Transfer
                 </div>

                 {/* CATEGORY BLOCK */}
                 <div className="text-[14px] leading-[20px] text-[#9D9DA8] font-[400] truncate">
                    {tx.expenseCategory?.name || 'Inflow'}
                 </div>
               </motion.div>
             )
           })}
         </AnimatePresence>
      </div>

      {/* ── 5. OPERATIONAL FOOTER ───────────────────────────────────────── */}
      <div className="py-12 flex items-center justify-between border-t border-white/[0.05]">
         <p className="text-[12px] text-[#9D9DA8] font-[400]">
            Displaying {filteredData.length} records in this view
         </p>
         <button className="px-6 h-9 rounded-full border border-white/[0.1] text-[13px] text-[#9D9DA8] hover:text-white hover:bg-white/[0.05] transition-all font-[400]">
           Load More Activity
         </button>
      </div>
    </div>
  )
}
