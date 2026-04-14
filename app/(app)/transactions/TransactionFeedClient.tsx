'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import {
  X, Filter, RotateCcw, LayoutGrid, LayoutList, Download,
  TrendingUp, BarChart3, ChevronDown, Search, ArrowUpRight,
  Check
} from 'lucide-react'

import TransactionFilterBar from './TransactionFilterBar'
import { DateRange } from 'react-day-picker'
import { startOfMonth, endOfMonth, isSameDay } from 'date-fns'

import TransactionDetailSheet from './TransactionDetailSheet'
import BulkActionsBar from './BulkActionsBar'
import { pdf } from '@react-pdf/renderer'
import { ReportPDF } from '@/components/ReportPDF'

interface Transaction {
  id: string
  description: string
  amount: number | any
  transactionDate: Date | string
  account: { name: string }
  expenseCategory?: { name: string }
  payee?: string
  paymentMode?: 'CASH' | 'BANK'
  referenceText?: string
  property?: { name: string }
  tenant?: { name: string }
  receiptUrl?: string
}

interface Props {
  initialData: Transaction[]
  properties: { id: string, name: string }[]
  tenants: { id: string, name: string }[]
}

const TABS = ['Recent', 'Operating expenses', 'My transactions']
const GRID_CLASS = "grid grid-cols-[100px_1fr_120px_180px_120px_150px] gap-4 items-center px-4"

export default function TransactionFeedClient({ initialData, properties, tenants }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 1. URL-Synchronized State
  const q = searchParams.get('q') || ''
  const cat = searchParams.get('cat') || 'ALL'
  const start = searchParams.get('start') || ''
  const end = searchParams.get('end') || ''
  const tab = searchParams.get('tab') || 'Recent'
  const pid = searchParams.get('pid') || ''
  const tid = searchParams.get('tid') || ''
  const min = searchParams.get('min') || ''
  const max = searchParams.get('max') || ''
  const txid = searchParams.get('txid') || ''

  // Local UI state
  const [searchInput, setSearchInput] = useState(q)
  const [activeTab, setActiveTab] = useState(tab)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Forensic Drill-down State
  const selectedTransaction = useMemo(() => {
    return initialData.find(tx => tx.id === txid) || null
  }, [txid, initialData])

  // Date range state
  const dateRange = useMemo<DateRange | undefined>(() => ({
    from: start ? new Date(start) : undefined,
    to: end ? new Date(end) : undefined
  }), [start, end])

  const tabs = ['Recent', 'My transactions', 'Operating expenses']

  // 2. Navigation Helper
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
    if (activeTab !== tab) {
      router.replace(pathname + '?' + createQueryString({ tab: activeTab }), { scroll: false })
    }
  }, [activeTab, tab, pathname, router, createQueryString])

  const setDateRange = (range: DateRange | undefined) => {
    router.replace(pathname + '?' + createQueryString({
      start: range?.from ? range.from.toISOString() : null,
      end: range?.to ? range.to.toISOString() : null
    }), { scroll: false })
  }

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedIds(newSelected)
  }

  const openTransaction = (id: string) => {
    router.replace(pathname + '?' + createQueryString({ txid: id }), { scroll: false })
  }

  const closeTransaction = () => {
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

      const matchesTab = tab === 'Recent' ? true :
        tab === 'Operating expenses' ? Number(tx.amount) < 0 :
          tab === 'My transactions' ? true :
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

  const trendPoints = useMemo(() => {
    if (filteredData.length === 0) return ""
    const sorted = [...filteredData].sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime())
    const minDate = new Date(sorted[0].transactionDate).getTime()
    const maxDate = new Date(sorted[sorted.length - 1].transactionDate).getTime()
    const dr = maxDate - minDate || 1
    const amounts = sorted.map(tx => Number(tx.amount))
    const minAmt = Math.min(...amounts, 0)
    const maxAmt = Math.max(...amounts, 1)
    const ar = maxAmt - minAmt || 1

    return sorted.map((tx, i) => {
      const x = ((new Date(tx.transactionDate).getTime() - minDate) / dr) * 100
      const y = 60 - ((Number(tx.amount) - minAmt) / ar) * 50
      return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`
    }).join(' ')
  }, [filteredData])

  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredData.forEach(tx => {
      const name = tx.expenseCategory?.name || 'Inflow'
      counts[name] = (counts[name] || 0) + Math.abs(Number(tx.amount))
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, value]) => ({ name, value }))
  }, [filteredData])

  return (
    <div className="min-h-screen font-sans selection:bg-white/10 space-y-[10px] -mt-8 pt-8 relative px-1">
      {/* Frozen Command Shell */}
      <div className="sticky top-0 z-50 bg-[#161821] pt-8 pb-[10px] space-y-[10px]">
        <h1 className="text-[24px] font-normal text-[#F4F5F9] tracking-tight font-arcadia">
          Transactions
        </h1>
        <TransactionFilterBar
          q={searchInput}
          onSearchChange={setSearchInput}
          activeTab={activeTab}
          onTabChange={setActiveTab}
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
          minAmount={min}
          maxAmount={max}
          onAmountChange={(minV, maxV) => router.replace(pathname + '?' + createQueryString({ min: minV, max: maxV }), { scroll: false })}
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
            <p className="text-[12px] text-[#9D9DA8] font-[400] uppercase tracking-widest">Net change</p>
            <p className="text-[24px] text-white font-[400]">
              {summary.netChange < 0 ? '−' : ''}${Math.abs(summary.netChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex items-center gap-10 pt-2">
            <div className="space-y-1">
              <p className="text-[11px] text-[#9D9DA8] font-[400] uppercase tracking-wider">In</p>
              <p className="text-[16px] text-[#6CC08F] font-[400] tracking-tight">+${summary.moneyIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-[#9D9DA8] font-[400] uppercase tracking-wider">Out</p>
              <p className="text-[16px] text-white/40 font-[400] tracking-tight">−${summary.moneyOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="py-6 border-r border-white/[0.05] flex flex-col justify-between px-8">
          <p className="text-[12px] text-[#9D9DA8] uppercase tracking-widest">Velocity</p>
          <div className="flex-1 w-full flex items-center justify-center relative mt-4 h-16">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} d={trendPoints} stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>

        <div className="py-6 flex flex-col justify-between px-8">
          <p className="text-[12px] text-[#9D9DA8] uppercase tracking-widest">Breakdown</p>
          <div className="space-y-3 pt-4">
            {topCategories.map(c => (
              <div key={c.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase text-[#9D9DA8]">
                  <span>{c.name}</span>
                  <span>{((c.value / (summary.moneyOut || 1)) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${(c.value / summary.moneyOut) * 100}%` }} className="h-full bg-white/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Data Strata */}
      <div className="space-y-0 relative">
        <div className={cn(GRID_CLASS, "h-9 text-[11px] text-[#9D9DA8] uppercase tracking-[0.1em] border-b border-white/[0.05] sticky top-[140px] z-40 bg-[#161821]")}>
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
                  "h-[48px] border-b border-white/[0.025] group cursor-pointer transition-all"
                )}
              >
                <div className="text-[14px] text-[#C3C3CC]">{format(new Date(tx.transactionDate), 'MMM d')}</div>
                <div className="flex items-center gap-4 truncate">
                   <div className="w-7 h-7 rounded-full bg-white/[0.05] flex items-center justify-center text-[10px] text-white/40 shrink-0">
                     {(tx.payee || tx.description || 'U').substring(0, 1).toUpperCase()}
                   </div>
                   <span className="text-[15px] text-[#DDDDE5] truncate">{tx.description || tx.payee}</span>
                </div>
                <div className={cn("text-[15px] text-right font-finance", isNeg ? "text-white" : "text-[#6CC08F]")}>
                  {isNeg ? '−' : ''}${whole}<span className="text-[11px] opacity-40 ml-0.5">{cents}</span>
                </div>
                <div className="pl-6 text-[14px] text-[#F4F5F9] truncate">{tx.account.name}</div>
                <div className="text-[14px] text-[#F4F5F9]">{tx.paymentMode === 'BANK' ? 'Transfer' : 'Cash'}</div>
                <div className="text-[14px] text-[#9D9DA8] truncate">{tx.expenseCategory?.name || 'Inflow'}</div>
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
        <button className="h-9 px-8 rounded-full border border-white/10 text-[12px] text-[#9D9DA8] hover:text-white transition-all">Load Forensic History</button>
      </div>
    </div>
  )
}
