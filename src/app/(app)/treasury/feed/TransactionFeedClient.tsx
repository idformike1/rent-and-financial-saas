'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import {
  X, Filter, RotateCcw, LayoutGrid, LayoutList, Download,
  TrendingUp, BarChart3, ChevronDown, Search, ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui-finova'

import TransactionFilterBar from './TransactionFilterBar'
import { DateRange } from 'react-day-picker'
import { startOfMonth, endOfMonth, isSameDay } from 'date-fns'

import TransactionDetailSheet from './TransactionDetailSheet'
import { pdf } from '@react-pdf/renderer'
import { ReportPDF } from '@/components/ReportPDF'
import { Transaction } from './types'


interface Props {
  initialData: Transaction[]
  properties: { id: string, name: string }[]
  tenants: { id: string, name: string }[]
}

const TABS = ['All Activity', 'Revenue Hub', 'Expense Registry', 'Treasury Control']
const GRID_CLASS = "grid grid-cols-[100px_1fr_120px_180px_120px_150px] gap-4 items-center px-4"

export default function TransactionFeedClient({ initialData, properties, tenants }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 1. URL-Synchronized State
  const q = searchParams.get('q') || ''
  const cat = searchParams.get('cat') || 'ALL'
  const start = searchParams.get('from') || ''
  const end = searchParams.get('to') || ''
  const tab = searchParams.get('tab') || 'All Activity'
  const pid = searchParams.get('pid') || ''
  const tid = searchParams.get('tid') || ''
  const min = searchParams.get('min') || ''
  const max = searchParams.get('max') || ''
  const [txid, setTxid] = useState(searchParams.get('txid') || '')

  // Local UI state
  const [searchInput, setSearchInput] = useState(q)
  const [minInput, setMinInput] = useState(min)
  const [maxInput, setMaxInput] = useState(max)

  // Forensic Drill-down State
  const selectedTransaction = useMemo(() => {
    return initialData.find(tx => tx.id === txid) || null
  }, [txid, initialData])

  // Date range state
  const dateRange = useMemo<DateRange | undefined>(() => ({
    from: start ? new Date(start) : undefined,
    to: end ? new Date(end) : undefined
  }), [start, end])


  // 2. Navigation Helpers
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

  const onTabChange = (newTab: string) => {
    const updates: Record<string, string | null> = { tab: newTab }
    
    // Domain Synchronization (Preset Logic)
    if (newTab === 'Revenue Hub') updates.cat = 'INCOME'
    if (newTab === 'Expense Registry') updates.cat = 'EXPENSE'
    if (newTab === 'All Activity') updates.cat = 'ALL'

    router.replace(pathname + '?' + createQueryString(updates), { scroll: false })
  }

  // 3. Debounced Search & URL Sync
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== q) {
        router.replace(pathname + '?' + createQueryString({ q: searchInput }), { scroll: false })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, q, pathname, router, createQueryString])

  useEffect(() => {
    setMinInput(min)
    setMaxInput(max)
    setSearchInput(q)
    setTxid(searchParams.get('txid') || '')
  }, [min, max, q, searchParams])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (minInput !== min || maxInput !== max) {
        router.replace(pathname + '?' + createQueryString({ min: minInput, max: maxInput }), { scroll: false })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [minInput, maxInput, min, max, pathname, router, createQueryString])

  const setDateRange = (range: DateRange | undefined) => {
    router.replace(pathname + '?' + createQueryString({
      from: range?.from ? range.from.toISOString() : null,
      to: range?.to ? range.to.toISOString() : null
    }), { scroll: false })
  }


  const openTransaction = (id: string) => {
    setTxid(id)
    router.replace(pathname + '?' + createQueryString({ txid: id }), { scroll: false })
  }

  const closeTransaction = () => {
    setTxid('')
    router.replace(pathname + '?' + createQueryString({ txid: null }), { scroll: false })
  }

  const handleExport = async (formatType: 'csv' | 'pdf' | 'excel') => {
    if (filteredData.length === 0) return

    if (formatType === 'csv') {
      const headers = ["Date", "Description", "Amount", "Account", "Method", "Category"].join(",")
      const rows = filteredData.map(tx => {
        return [
          format(new Date(tx.transactionDate), 'yyyy-MM-dd'),
          `"${(tx.description || tx.payee || '').replace(/"/g, '""')}"`,
          Number(tx.amount),
          `"${tx.account.name}"`,
          tx.paymentMode === 'BANK' ? 'Transfer' : 'Cash',
          `"${tx.expenseCategory?.name || 'Inflow'}"`
        ].join(",")
      }).join("\n")

      const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `axiom_ledger_${format(new Date(), 'yyyyMMdd')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (formatType === 'pdf') {
      try {
        const pdfData = {
          reportDate: format(new Date(), 'MMM dd, yyyy'),
          netRealizableRevenue: summary.netChange,
          totalCollectedIncome: summary.moneyIn,
          totalOperationalExpense: Math.abs(summary.moneyOut)
        }
        
        const pdfEntries = filteredData.map(tx => ({
          id: tx.id,
          date: new Date(tx.transactionDate),
          transactionId: tx.id.substring(0, 12).toUpperCase(),
          account: tx.account,
          amount: tx.amount
        }))

        const doc = <ReportPDF data={pdfData} entries={pdfEntries} />
        const blob = await pdf(doc).toBlob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `axiom_ledger_${format(new Date(), 'yyyyMMdd')}.pdf`
        link.click()
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error("PDF_EXPORT_FAILURE:", err)
        alert("PDF Materialization failure. Check logs.")
      }
    } else if (formatType === 'excel') {
      const headers = ["Date", "Description", "Amount", "Account", "Method", "Category"]
      const rows = filteredData.map(tx => [
        format(new Date(tx.transactionDate), 'yyyy-MM-dd'),
        tx.description || tx.payee || '',
        Number(tx.amount),
        tx.account.name,
        tx.paymentMode === 'BANK' ? 'Transfer' : 'Cash',
        tx.expenseCategory?.name || 'Inflow'
      ])

      // XML/HTML Template for native Excel compatibility with clinical styling
      let excelContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
      excelContent += '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Forensic Ledger</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta charset="utf-8"></head>'
      excelContent += '<body><table border="1">'
      excelContent += '<tr style="background-color: #14161A; color: #FFFFFF; font-weight: bold;">' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>'
      rows.forEach(row => {
        excelContent += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>'
      })
      excelContent += '</table></body></html>'

      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `axiom_ledger_${format(new Date(), 'yyyyMMdd')}.xls`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

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

      const amt = Math.abs(Number(tx.amount));
      const matchesMin = min ? amt >= Number(min) : true;
      const matchesMax = max ? amt <= Number(max) : true;

      const matchesTab = 
        tab === 'All Activity' ? true :
        tab === 'Revenue Hub' ? (tx.account as any)?.category === 'INCOME' :
        tab === 'Expense Registry' ? (tx.account as any)?.category === 'EXPENSE' :
        tab === 'Treasury Control' ? (tx.paymentMode === 'BANK' || (tx.account as any)?.category === 'ASSET') :
        true;

      // Property & Tenant Filtering (Workstation Isolation)
      const matchesProperty = pid ? (tx as any).propertyId === pid : true;
      const matchesTenant = tid ? (tx as any).tenantId === tid : true;

      return matchesSearch && matchesStart && matchesEnd && matchesCategory && matchesMin && matchesMax && matchesTab && matchesProperty && matchesTenant;
    });
  }, [initialData, q, start, end, cat, min, max, tab, pid, tid]);

  // Fiscal calculations
  const summary = useMemo(() => {
    let moneyIn = 0
    let moneyOut = 0
    filteredData.forEach(tx => {
      const amt = Number(tx.amount)
      if (amt >= 0) moneyIn += amt
      else moneyOut += Math.abs(amt)
    })
    return { moneyIn, moneyOut, netChange: moneyIn - moneyOut }
  }, [filteredData])

  const formatAmountParts = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    const parts = formatted.split('.')
    return { whole: parts[0], cents: parts[1] }
  }

  const topEntities = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredData.forEach(tx => {
      const name = tx.payee || tx.tenant?.name || 'Unknown Entity'
      counts[name] = (counts[name] || 0) + Math.abs(Number(tx.amount))
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, volume]) => ({ name, volume }))
  }, [filteredData])

  const { accountActivity, totalActivityVolume } = useMemo(() => {
    const counts: Record<string, number> = {}
    let total = 0
    filteredData.forEach(tx => {
      const name = tx.account.name
      const vol = Math.abs(Number(tx.amount))
      counts[name] = (counts[name] || 0) + vol
      total += vol
    })
    const activity = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, volume]) => ({ name, volume }))
    return { accountActivity: activity, totalActivityVolume: total }
  }, [filteredData])

  return (
    <div className="min-h-screen font-sans selection:bg-white/10 space-y-[10px] relative">
      {/* Frozen Command Shell */}
      <div className="sticky top-0 z-50 bg-background -mx-8 px-8 pt-0 pb-[10px] space-y-[10px]">
        <h1 className="text-display font-display text-foreground tracking-tight">
          Transactions
        </h1>
        <TransactionFilterBar
          q={searchInput}
          onSearchChange={setSearchInput}
          activeTab={tab}
          onTabChange={onTabChange}
          tabs={TABS} 
          properties={properties}
          tenants={tenants}
          activePropertyId={pid}
          activeTenantId={tid}
          onPropertyChange={(id) => router.replace(pathname + '?' + createQueryString({ pid: id }), { scroll: false })}
          onTenantChange={(id) => router.replace(pathname + '?' + createQueryString({ tid: id }), { scroll: false })}
          cat={cat}
          onCategoryChange={(val) => router.replace(pathname + '?' + createQueryString({ cat: val }), { scroll: false })}
          dateRange={dateRange}
          onDateChange={(range) => {
            if (!range?.from || !range?.to) return
            router.replace(pathname + '?' + createQueryString({
              from: format(range.from, 'yyyy-MM-dd'),
              to: format(range.to, 'yyyy-MM-dd')
            }), { scroll: false })
          }}
          minAmount={minInput}
          maxAmount={maxInput}
          onAmountChange={(minV, maxV) => {
            setMinInput(minV)
            setMaxInput(maxV)
          }}
          onReset={() => {
            setSearchInput('')
            const cleaned = new URLSearchParams()
            const take = searchParams.get('take')
            if (take) cleaned.set('take', take)
            router.replace(pathname + '?' + cleaned.toString(), { scroll: false })
          }}
          onExport={handleExport}
        />
      </div>

      <div className="grid grid-cols-3 gap-0 border-y border-white/[0.05]">
        <div className="py-6 border-r border-white/[0.05] space-y-2 flex flex-col justify-center px-8">
          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground font-[400] uppercase tracking-widest">Net change</p>
            <p className="text-[24px] text-white font-[400]">
              {summary.netChange < 0 ? '−' : ''}${Math.abs(summary.netChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex items-center gap-10 pt-2">
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground font-[400] uppercase tracking-wider">In</p>
              <p className="text-[16px] text-mercury-green font-[400] tracking-tight">+${summary.moneyIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground font-[400] uppercase tracking-wider">Out</p>
              <p className="text-[16px] text-white/40 font-[400] tracking-tight">−${summary.moneyOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="py-6 border-r border-white/[0.05] flex flex-col justify-between px-8">
          <p className="text-[12px] text-muted-foreground uppercase tracking-widest font-medium">Top Counterparties</p>
          <div className="flex-1 mt-4 space-y-0">
            {topEntities.map((entity, i) => (
              <div key={entity.name} className={cn(
                "grid grid-cols-[1fr_auto] items-center py-2 h-8",
                i !== topEntities.length - 1 && "border-b border-white/5"
              )}>
                <span className="text-foreground text-sm font-medium truncate pr-4">{entity.name}</span>
                <span className="text-muted-foreground font-mono text-xs">${entity.volume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
            ))}
            {topEntities.length === 0 && (
              <div className="h-full flex items-center text-[11px] text-white/20 uppercase tracking-widest">No Activity Recorded</div>
            )}
          </div>
        </div>

        <div className="py-6 flex flex-col justify-between px-8">
          <p className="text-[12px] text-muted-foreground uppercase tracking-widest font-medium">Account Exposure</p>
          <div className="space-y-4 mt-4 h-full flex flex-col justify-center">
            {accountActivity.slice(0, 3).map(account => (
              <div key={account.name} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-foreground/70 font-medium truncate pr-2 uppercase tracking-wide">{account.name}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    ${account.volume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-1.5 rounded-[var(--radius)] w-full bg-muted overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(account.volume / (totalActivityVolume || 1)) * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            ))}
            {accountActivity.length === 0 && (
              <div className="flex-1 flex items-center text-[11px] text-white/20 uppercase tracking-widest">Awaiting Ledger Input</div>
            )}
          </div>
        </div>
      </div>


      {/* Data Strata */}
      <div className="space-y-0 relative">
        <div className={cn(GRID_CLASS, "h-9 text-[11px] text-muted-foreground uppercase tracking-[0.1em] border-b border-white/[0.05] sticky top-[108px] z-40 bg-background")}>
          <div>Date</div>
          <div>Entity & Description</div>
          <div className="text-right">Amount</div>
          <div className="text-left">Account</div>
          <div className="text-left">Method</div>
          <div className="text-left">Category</div>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredData.map((tx, idx) => {
            const isNeg = Number(tx.amount) < 0;
            const { whole, cents } = formatAmountParts(Number(tx.amount));

            return (
              <motion.div
                key={tx.id}
                onClick={() => openTransaction(tx.id)}
                className={cn(
                  GRID_CLASS, 
                  "min-h-[48px] py-3 border-b border-white/[0.025] group cursor-pointer transition-all duration-500 hover:bg-white/[0.02]",
                  tx.status === 'VOIDED' && "opacity-40 grayscale"
                )}
              >
                <div className="text-[14px] text-muted-foreground">{format(new Date(tx.transactionDate), 'MMM d')}</div>
                <div className="flex items-center gap-4">
                   <div className="w-7 h-7 rounded-[var(--radius)] bg-white/[0.05] flex items-center justify-center text-[10px] text-white/40 shrink-0">
                     {(tx.payee || tx.description || 'U').substring(0, 1).toUpperCase()}
                   </div>
                   <span className="text-[15px] text-foreground/80 leading-relaxed">{tx.description || tx.payee}</span>
                </div>
                <div className={cn("text-[15px] text-right font-finance", isNeg ? "text-white" : "text-mercury-green")}>
                  {isNeg ? '−' : ''}${whole}<span className="text-[11px] opacity-40 ml-0.5">{cents}</span>
                </div>
                <div className="text-[14px] text-foreground">{tx.account.name}</div>
                <div className="text-[14px] text-foreground">{tx.paymentMode === 'BANK' ? 'Transfer' : 'Cash'}</div>
                <div className="text-[14px] text-muted-foreground flex items-center gap-2">
                  {tx.expenseCategory?.name || 'Inflow'}
                  {tx.status === 'VOIDED' && (
                    <span className="text-[10px] font-mono border border-white/20 px-1 rounded-sm text-white/40 uppercase tracking-tighter">
                      VOID
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <TransactionDetailSheet 
        transaction={selectedTransaction} 
        onClose={closeTransaction} 
      />


      <div className="py-12 border-t border-white/[0.05] flex justify-between items-center px-4">
        <p className="text-[12px] text-white/20 uppercase tracking-widest font-medium">Volumetric Report: {filteredData.length} entries</p>
        <Button type="button" variant="ghost" disabled={false} className="h-9 px-8 rounded-[var(--radius)] border border-white/10 text-[12px] text-muted-foreground hover:text-white transition-all bg-transparent">Load Forensic History</Button>
      </div>
    </div>
  )
}
