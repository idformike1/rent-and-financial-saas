'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import {
  X, Filter, RotateCcw, LayoutGrid, LayoutList, Download,
  TrendingUp, BarChart3, ChevronDown, Search, ArrowUpRight,
  Database, Tag, Building2, Users, Wallet, Layers, DollarSign
} from 'lucide-react'

import { DateRange } from 'react-day-picker'
import InsightsDatePicker from '@/components/insights/InsightsDatePicker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui-finova'
import TransactionDetailSheet from '../../treasury/feed/TransactionDetailSheet'

interface Transaction {
  id: string
  description: string
  amount: number
  transactionDate: string
  account: { id: string, name: string, category: string }
  expenseCategory: { id: string, name: string } | null
  property: { id: string, name: string } | null
  tenant: { id: string, name: string } | null
  payee: string | null
  paymentMode: string
  referenceText: string | null
  status: string
}

interface Metadata {
  properties: { id: string, name: string }[]
  tenants: { id: string, name: string }[]
  accounts: { id: string, name: string, category: string }[]
  categories: { id: string, name: string }[]
}

interface Props {
  initialData: Transaction[]
  metadata: Metadata
}

const GRID_CLASS = "grid grid-cols-[100px_1fr_120px_150px_150px_150px_150px] gap-4 items-center px-4"

export default function LedgerExplorerClient({ initialData, metadata }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 1. URL State Sync
  const q = searchParams.get('q') || ''
  const cat = searchParams.get('cat') || 'ALL'
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const pid = searchParams.get('pid') || ''
  const tid = searchParams.get('tid') || ''
  const aid = searchParams.get('aid') || ''
  const cid = searchParams.get('cid') || ''
  const min = searchParams.get('min') || ''
  const max = searchParams.get('max') || ''
  const [txid, setTxid] = useState(searchParams.get('txid') || '')

  // Local State
  const [searchInput, setSearchInput] = useState(q)
  const [minInput, setMinInput] = useState(min)
  const [maxInput, setMaxInput] = useState(max)

  const dateRange = useMemo<DateRange | undefined>(() => ({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined
  }), [from, to])

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

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== q) {
        router.replace(pathname + '?' + createQueryString({ q: searchInput }), { scroll: false })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput, q, pathname, router, createQueryString])

  const updateParam = (key: string, value: string | null) => {
    router.replace(pathname + '?' + createQueryString({ [key]: value }), { scroll: false })
  }

  const handleReset = () => {
    router.replace(pathname, { scroll: false })
    setSearchInput('')
    setMinInput('')
    setMaxInput('')
  }

  const filteredData = useMemo(() => {
    return initialData.filter(tx => {
       // Search
       const matchesSearch = q ? (
          tx.description?.toLowerCase().includes(q.toLowerCase()) ||
          tx.payee?.toLowerCase().includes(q.toLowerCase()) ||
          tx.account.name?.toLowerCase().includes(q.toLowerCase()) ||
          tx.expenseCategory?.name?.toLowerCase().includes(q.toLowerCase())
       ) : true

       // Property & Tenant
       const matchesProperty = pid ? tx.property?.id === pid : true
       const matchesTenant = tid ? tx.tenant?.id === tid : true
       
       // Account & Category
       const matchesAccount = aid ? tx.account.id === aid : true
       const matchesCategory = cid ? tx.expenseCategory?.id === cid : true

       // Nature
       const matchesNature = cat === 'ALL' ? true :
                             cat === 'INCOME' ? tx.amount >= 0 :
                             cat === 'EXPENSE' ? tx.amount < 0 : true

       // Amount
       const absAmt = Math.abs(tx.amount)
       const matchesMin = min ? absAmt >= Number(min) : true
       const matchesMax = max ? absAmt <= Number(max) : true

       return matchesSearch && matchesProperty && matchesTenant && matchesAccount && matchesCategory && matchesNature && matchesMin && matchesMax
    })
  }, [initialData, q, pid, tid, aid, cid, cat, min, max])

  const selectedTransaction = useMemo(() => {
    return initialData.find(tx => tx.id === txid) || null
  }, [txid, initialData])

  // Summary Metrics
  const summary = useMemo(() => {
    let income = 0
    let expense = 0
    filteredData.forEach(tx => {
      if (tx.amount >= 0) income += tx.amount
      else expense += Math.abs(tx.amount)
    })
    return { income, expense, net: income - expense }
  }, [filteredData])

  const handleExport = () => {
    const params = new URLSearchParams()
    if (q) params.set('searchTerm', q)
    if (from) params.set('startDate', from)
    if (to) params.set('endDate', to)
    if (cat && cat !== 'ALL') params.set('category', cat)
    
    window.location.href = `/api/reports/csv?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 pt-6 space-y-8">
      {/* Header forensic context */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-display font-display tracking-tight text-white">Forensic Ledger</h1>
          <p className="text-[#5D71F9] text-sm uppercase tracking-[0.2em] font-medium">Mercury Alpha // Visualizer V.4.1</p>
        </div>
        <div className="flex items-center gap-4">
           <Button type="button" variant="ghost" onClick={handleReset} disabled={!q && !pid && !tid && !aid && !cid && !min && !max} className="text-white/40 hover:text-white uppercase tracking-widest text-[10px] font-bold h-10 px-4">
             Clear Context
           </Button>
           <Button 
            type="button" 
            onClick={handleExport}
            className="bg-white text-black hover:bg-white/90 uppercase tracking-widest text-[10px] font-bold h-10 px-6" 
            disabled={filteredData.length === 0}
          >
             Export Report
           </Button>
        </div>
      </div>

      {/* FILTER STACK */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center bg-card border rounded-[var(--radius)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* PROPERTY */}
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" disabled={false} className={cn("h-10 border border-white/5 bg-white/[0.01] uppercase tracking-widest text-[10px] font-bold px-4", pid && "text-primary border-primary/20 bg-primary/5")}>
                {pid ? metadata.properties.find(p => p.id === pid)?.name : "All Properties"}
                <span className="ml-2 opacity-20">▼</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-1" align="start">
               <Button type="button" variant="ghost" disabled={false} onClick={() => updateParam('pid', null)} className="w-full h-9 justify-start px-3 py-2 text-[10px] uppercase font-bold tracking-wider hover:bg-white/5 rounded-[var(--radius)] text-white/60">All Properties</Button>
               {metadata.properties.map(p => (
                 <Button type="button" disabled={false} key={p.id} variant="ghost" onClick={() => updateParam('pid', p.id)} className="w-full h-9 justify-start px-3 py-2 text-[10px] uppercase font-bold tracking-wider hover:bg-white/5 rounded-[var(--radius)]">{p.name}</Button>
               ))}
            </PopoverContent>
          </Popover>

          {/* TENANT */}
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" disabled={false} className={cn("h-10 border border-white/5 bg-white/[0.01] uppercase tracking-widest text-[10px] font-bold px-4", tid && "text-primary border-primary/20 bg-primary/5")}>
                {tid ? metadata.tenants.find(t => t.id === tid)?.name : "All Tenants"}
                <span className="ml-2 opacity-20">▼</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-1   border-white/10" align="start">
               <Button type="button" variant="ghost" disabled={false} onClick={() => updateParam('tid', null)} className="w-full h-9 justify-start px-3 py-2 text-sm hover:bg-white/5 rounded-[var(--radius)] text-white/60">All Tenants</Button>
               {metadata.tenants.map(t => (
                 <Button type="button" key={t.id} variant="ghost" disabled={false} onClick={() => updateParam('tid', t.id)} className="w-full h-9 justify-start px-3 py-2 text-sm hover:bg-white/5 rounded-[var(--radius)]">{t.name}</Button>
               ))}
            </PopoverContent>
          </Popover>

          {/* ACCOUNT */}
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" disabled={false} className={cn("h-10 border border-white/5 bg-white/[0.01] uppercase tracking-widest text-[10px] font-bold px-4", aid && "text-primary border-primary/20 bg-primary/5")}>
                {aid ? metadata.accounts.find(a => a.id === aid)?.name : "All Accounts"}
                <span className="ml-2 opacity-20">▼</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-1   border-white/10" align="start">
               <Button type="button" variant="ghost" disabled={false} onClick={() => updateParam('aid', null)} className="w-full h-9 justify-start px-3 py-2 text-[10px] uppercase font-bold tracking-wider hover:bg-white/5 rounded-[var(--radius)] text-white/60">All Accounts</Button>
               {metadata.accounts.map(a => (
                 <Button type="button" key={a.id} variant="ghost" disabled={false} onClick={() => updateParam('aid', a.id)} className="w-full h-9 justify-start px-3 py-2 text-[10px] uppercase font-bold tracking-wider hover:bg-white/5 rounded-[var(--radius)] flex items-center justify-between">
                    <span>{a.name}</span>
                    <span className="text-[8px] opacity-40 uppercase tracking-tighter">{a.category}</span>
                 </Button>
               ))}
            </PopoverContent>
          </Popover>

          {/* CATEGORY */}
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" disabled={false} className={cn("h-10 border border-white/5 bg-white/[0.01] uppercase tracking-widest text-[10px] font-bold px-4", cid && "text-primary border-primary/20 bg-primary/5")}>
                {cid ? metadata.categories.find(c => c.id === cid)?.name : "All Categories"}
                <span className="ml-2 opacity-20">▼</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-1   border-white/10" align="start">
               <Button type="button" variant="ghost" disabled={false} onClick={() => updateParam('cid', null)} className="w-full h-9 justify-start px-3 py-2 text-[10px] uppercase font-bold tracking-wider hover:bg-white/5 rounded-[var(--radius)] text-white/60">All Categories</Button>
               {metadata.categories.map(c => (
                 <Button type="button" key={c.id} variant="ghost" disabled={false} onClick={() => updateParam('cid', c.id)} className="w-full h-9 justify-start px-3 py-2 text-[10px] uppercase font-bold tracking-wider hover:bg-white/5 rounded-[var(--radius)]">{c.name}</Button>
               ))}
            </PopoverContent>
          </Popover>

          {/* NATURE (INCOME/EXPENSE) */}
          <div className="flex items-center h-10 bg-white/[0.03] border border-white/5 rounded-[var(--radius)] p-1">
             <Button 
                type="button"
                variant="ghost"
                disabled={false}
                onClick={() => updateParam('cat', 'ALL')}
                className={cn("px-3 h-full text-[11px] uppercase tracking-widest font-semibold rounded transition-all", cat === 'ALL' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60")}
             >All</Button>
             <Button 
                type="button"
                variant="ghost"
                disabled={false}
                onClick={() => updateParam('cat', 'INCOME')}
                className={cn("px-3 h-full text-[11px] uppercase tracking-widest font-semibold rounded transition-all", cat === 'INCOME' ? "bg-mercury-green/20 text-mercury-green" : "text-white/40 hover:text-white/60")}
             >Income</Button>
             <Button 
                type="button"
                variant="ghost"
                disabled={false}
                onClick={() => updateParam('cat', 'EXPENSE')}
                className={cn("px-3 h-full text-[11px] uppercase tracking-widest font-semibold rounded transition-all", cat === 'EXPENSE' ? "bg-rose-500/20 text-rose-500" : "text-white/40 hover:text-white/60")}
             >Expense</Button>
          </div>

          {/* DATE RANGE */}
          <div className="h-10 border border-white/5 bg-white/[0.01] rounded-[var(--radius)] overflow-hidden flex items-center px-1">
             <InsightsDatePicker 
                date={dateRange} 
                setDate={(range) => {
                  router.replace(pathname + '?' + createQueryString({
                    from: range?.from ? range.from.toISOString() : null,
                    to: range?.to ? range.to.toISOString() : null
                  }), { scroll: false })
                }}
             />
          </div>

        </div>

        {/* SEARCH & AMOUNT */}
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" disabled={false} className={cn("h-10 border border-white/5 bg-white/[0.01] uppercase tracking-widest text-[10px] font-bold px-4", (min || max) && "text-primary border-primary/20 bg-primary/5")}>
                Amount
                <span className="ml-2 opacity-20">▼</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4   border-white/10 space-y-4" align="end">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Scope Range</span>
                   <Button type="button" variant="ghost" disabled={false} onClick={() => { setMinInput(''); setMaxInput(''); updateParam('min', null); updateParam('max', null); }} className="h-auto p-0 text-[10px] text-primary hover:bg-transparent">Reset</Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase text-white/20 font-bold">Minimum</label>
                    <input 
                      type="number" 
                      value={minInput} 
                      onChange={(e) => setMinInput(e.target.value)}
                      onBlur={() => updateParam('min', minInput)}
                      className="w-full bg-white/5 border border-white/10 h-8 rounded px-2 text-sm outline-none focus:border-primary/50" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase text-white/20 font-bold">Maximum</label>
                    <input 
                      type="number" 
                      value={maxInput}
                      onChange={(e) => setMaxInput(e.target.value)}
                      onBlur={() => updateParam('max', maxInput)}
                      className="w-full bg-white/5 border border-white/10 h-8 rounded px-2 text-sm outline-none focus:border-primary/50" 
                    />
                  </div>
                </div>
            </PopoverContent>
          </Popover>

          <div className="relative group w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
               type="text"
               value={searchInput}
               onChange={(e) => setSearchInput(e.target.value)}
               placeholder="Deep scan entries..."
               className="w-full h-10 bg-white/[0.03] border border-white/5 rounded-[var(--radius)] pl-10 pr-4 text-sm outline-none focus:border-primary/20 focus:bg-white/[0.05] transition-all"
            />
            {searchInput && (
              <Button type="button" variant="ghost" disabled={false} onClick={() => { setSearchInput(''); updateParam('q', null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white h-auto p-0 bg-transparent hover:bg-transparent border-none">
                <span className="text-sm font-bold opacity-40">✕</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* METRIC RIBBON */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-card border rounded-[var(--radius)] p-6 space-y-2">
           <p className="text-muted-foreground text-[11px] uppercase tracking-widest font-semibold flex items-center gap-2">
             <ArrowUpRight size={12} className="text-mercury-green" />
             Aggregated Income
           </p>
           <p className="text-[32px] font-finance text-white">${summary.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border rounded-[var(--radius)] p-6 space-y-2">
           <p className="text-muted-foreground text-[11px] uppercase tracking-widest font-semibold flex items-center gap-2">
             <ArrowUpRight size={12} className="text-rose-500 rotate-90" />
             Aggregated Outflow
           </p>
           <p className="text-[32px] font-finance text-white">${summary.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border rounded-[var(--radius)] p-6 space-y-2">
           <p className="text-muted-foreground text-[11px] uppercase tracking-widest font-semibold">Net Forensic Balance</p>
           <p className={cn("text-[32px] font-finance", summary.net >= 0 ? "text-mercury-green" : "text-white")}>
             {summary.net < 0 ? '−' : ''}${Math.abs(summary.net).toLocaleString('en-US', { minimumFractionDigits: 2 })}
           </p>
        </div>
      </div>

      {/* ANALYTICAL GRID */}
      <div className="space-y-1">
        <div className={cn(GRID_CLASS, "h-10 text-[10px] uppercase font-bold tracking-widest text-white/30 border-b border-white/5 sticky top-0   z-10")}>
           <div>Date</div>
           <div>Description / Payee</div>
           <div className="text-right">Amount</div>
           <div>Asset / Property</div>
           <div>Client / Tenant</div>
           <div>Account</div>
           <div>Category</div>
        </div>
        
        <AnimatePresence mode="popLayout">
          {filteredData.map((tx) => {
            const isNeg = tx.amount < 0
            return (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setTxid(tx.id)}
                className={cn(
                  GRID_CLASS,
                  "group h-14 border-b border-white/[0.02] hover:bg-white/[0.02] transition-all cursor-pointer",
                  tx.status === 'VOIDED' && "opacity-40 grayscale"
                )}
              >
                <div className="text-xs text-muted-foreground font-mono">{format(new Date(tx.transactionDate), 'yyyy-MM-dd')}</div>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40 shrink-0 uppercase">
                     {(tx.description || tx.payee || 'U')[0]}
                   </div>
                   <div className="truncate">
                      <p className="text-sm font-medium text-white/90 truncate">{tx.description || tx.payee}</p>
                      {tx.referenceText && <p className="text-[10px] text-white/20 font-mono truncate">{tx.referenceText}</p>}
                   </div>
                </div>
                <div className={cn("text-base font-finance text-right", isNeg ? "text-white" : "text-mercury-green")}>
                  {isNeg ? '−' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-white/60 truncate">{tx.property?.name || '—'}</div>
                <div className="text-xs truncate">
                  {tx.tenant ? (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={false}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tenants/${tx.tenant!.id}`);
                      }}
                      className="text-primary hover:underline p-0 h-auto font-normal"
                    >
                      {tx.tenant.name}
                    </Button>
                  ) : '—'}
                </div>
                <div className="text-xs text-white/80">{tx.account.name}</div>
                <div className="text-xs text-white/40">{tx.expenseCategory?.name || 'System Inflow'}</div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredData.length === 0 && (
           <div className="h-64 flex flex-col items-center justify-center text-white/20 gap-4 border border-dashed border-white/5 rounded-[var(--radius)] mt-4">
              <Database size={32} />
              <p className="text-xs uppercase tracking-widest font-medium">No records matching clinical parameters</p>
           </div>
        )}
      </div>

      <div className="pt-12">
        <p className="text-[10px] text-white/10 uppercase tracking-[0.4em] text-center">End of Forensic Record — Mercury V.4.0</p>
      </div>

      <TransactionDetailSheet 
        transaction={selectedTransaction as any}
        onClose={() => setTxid('')}
      />
    </div>
  )
}
