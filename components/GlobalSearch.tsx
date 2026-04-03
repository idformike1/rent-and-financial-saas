'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, User, Building, Settings, FileSpreadsheet, ArrowRight, Zap, Target } from 'lucide-react'
import { deepScanSystem } from '@/actions/search.actions'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const staticNav = [
    { title: 'Unified Wealth Ledger', type: 'REPORT', href: '/expenses', icon: FileSpreadsheet },
    { title: 'Occupant Registry', type: 'DIRECT', href: '/tenants', icon: User },
    { title: 'Governance Schema', type: 'SYSTEM', href: '/settings/categories', icon: Settings }
  ]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    setQuery('')
  }, [pathname])

  const handleSearch = async (val: string) => {
    setQuery(val)
    if (val.length < 3) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setIsOpen(true)
    const res = await deepScanSystem(val)
    if (res.success) {
      setResults(res.data || [])
    }
    setIsSearching(false)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'TENANT': return <User className="w-4 h-4" />
      case 'ASSET': return <Building className="w-4 h-4" />
      case 'GOVERNANCE': return <Settings className="w-4 h-4" />
      case 'REPORT': return <FileSpreadsheet className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'TENANT': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'ASSET': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
      case 'GOVERNANCE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  return (
    <div className="relative flex-1 max-w-xl mx-8" ref={dropdownRef}>
      <div className={cn(
        "flex items-center gap-4 h-11 px-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border transition-all duration-500",
        isOpen ? "border-brand ring-4 ring-brand/10 shadow-premium" : "border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
      )}>
        {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-brand" /> : <Search className="w-4 h-4 text-slate-400 group-hover:text-brand" />}
        <input 
          type="text" 
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          placeholder="System-wide Deep Scan (Tenants, Assets, Reports)..." 
          className="flex-1 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white placeholder:text-slate-400/50 outline-none" 
        />
        <div className="flex items-center gap-1 opacity-50">
           <span className="text-[8px] font-bold border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded italic">⌘</span>
           <span className="text-[8px] font-bold border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded italic">K</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-14 left-0 right-0 max-h-[480px] overflow-hidden rounded-[2rem] bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl border border-slate-200 dark:border-white/5 shadow-2xl z-50 flex flex-col"
          >
             <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                {/* Suggestions Section */}
                <div className="space-y-4">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 border-l-2 border-brand ml-1">Quantum Suggestions</p>
                   {results.length === 0 && !isSearching ? (
                     <p className="p-6 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">No signals detected for search parameters.</p>
                   ) : (
                      <div className="grid grid-cols-1 gap-1">
                        {results.map((r) => (
                           <Link 
                            key={`${r.type}-${r.id}`} 
                            href={r.href}
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-white/5"
                           >
                              <div className="flex items-center gap-4">
                                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6", getTypeStyle(r.type))}>
                                    {getIcon(r.type)}
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase italic tracking-tighter leading-none mb-1.5 group-hover:translate-x-1 transition-transform">{r.title}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{r.description || r.type}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className={cn("text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest", getTypeStyle(r.type))}>{r.type}</span>
                                <ArrowRight className="w-4 h-4 text-brand" />
                              </div>
                           </Link>
                        ))}
                      </div>
                   )}
                </div>

                {/* Hot Navigation Section */}
                <div className="space-y-4">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 border-l-2 border-indigo-500 ml-1">Sovereign Shortcuts</p>
                   <div className="grid grid-cols-1 gap-1">
                      {staticNav.map((s) => (
                         <Link 
                           key={s.title} 
                           href={s.href}
                           className="flex items-center justify-between p-4 rounded-2xl hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/10 group"
                          >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                 <s.icon className="w-4 h-4" />
                              </div>
                              <h4 className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.1em]">{s.title}</h4>
                           </div>
                           <Target className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
                         </Link>
                      ))}
                   </div>
                </div>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex justify-between items-center px-10">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Axiom 2026 Deep Scan</span>
                <div className="flex items-center gap-4">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest"><kbd className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-800 not-italic mr-1">ESC</kbd> CLOSE</span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
