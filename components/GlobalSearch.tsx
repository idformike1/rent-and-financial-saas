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
    { title: 'Occupant Registry',     type: 'DIRECT', href: '/tenants',  icon: User },
    { title: 'Governance Schema',     type: 'SYSTEM', href: '/settings/categories', icon: Settings }
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
      case 'TENANT':     return <User className="w-4 h-4" />
      case 'ASSET':      return <Building className="w-4 h-4" />
      case 'GOVERNANCE': return <Settings className="w-4 h-4" />
      case 'REPORT':     return <FileSpreadsheet className="w-4 h-4" />
      default:           return <Zap className="w-4 h-4" />
    }
  }

  // All result types now use Ember-tinted styling — no legacy emerald/blue
  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'TENANT':     return 'bg-[var(--primary-muted)] text-[var(--primary)] border-[var(--primary)]/20'
      case 'ASSET':      return 'bg-[var(--primary-muted)] text-[var(--primary)] border-[var(--primary)]/20'
      case 'GOVERNANCE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      default:           return 'bg-white/3 text-[var(--muted)] border-border'
    }
  }

  return (
    <div className="relative flex-1 max-w-xl mx-8" ref={dropdownRef}>
      {/* Search Input Bar */}
      <div className={cn(
        "flex items-center gap-4 h-11 px-5 rounded-xl glass-panel transition-all duration-500",
        isOpen
          ? "border-[var(--primary)]/50 ring-4 ring-[var(--primary)]/10"
          : "hover:border-border"
      )}>
        {isSearching
          ? <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
          : <Search className="w-4 h-4 text-[var(--muted)]" />
        }
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          placeholder="System-wide Deep Scan (Tenants, Assets, Reports)..."
          className="flex-1 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-foreground placeholder:text-[var(--muted)]/50 outline-none"
        />
        <div className="flex items-center gap-1 opacity-40">
          <span className="text-[8px] font-bold border border-border px-1.5 py-0.5 rounded">⌘</span>
          <span className="text-[8px] font-bold border border-border px-1.5 py-0.5 rounded">K</span>
        </div>
      </div>

      {/* Dropdown Results Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-14 left-0 right-0 max-h-[480px] overflow-hidden rounded-3xl glass-panel shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 overflow-y-auto flex-1 space-y-8">

              {/* Search Results Section */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.3em] pl-2 border-l-2 border-[var(--primary)] ml-1">
                  Quantum Suggestions
                </p>
                {results.length === 0 && !isSearching ? (
                  <p className="p-5 text-center text-[10px] font-black text-[var(--muted)] uppercase tracking-widest bg-card/[0.02] rounded-3xl border border-dashed border-white/5">
                    No signals detected for search parameters.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-1">
                    {results.map((r) => (
                      <Link
                        key={`${r.type}-${r.id}`}
                        href={r.href}
                        className="flex items-center justify-between p-4 rounded-3xl hover:bg-[var(--primary-muted)] transition-all group border border-transparent hover:border-[var(--primary)]/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105", getTypeStyle(r.type))}>
                            {getIcon(r.type)}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-foreground uppercase tracking-tight leading-none mb-1 group-hover:text-[var(--primary)] transition-colors">
                              {r.title}
                            </h4>
                            <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">
                              {r.description || r.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest", getTypeStyle(r.type))}>
                            {r.type}
                          </span>
                          <ArrowRight className="w-4 h-4 text-[var(--primary)]" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Sovereign Shortcuts Section */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.3em] pl-2 border-l-2 border-[var(--primary)]/40 ml-1">
                  Sovereign Shortcuts
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {staticNav.map((s) => (
                    <Link
                      key={s.title}
                      href={s.href}
                      className="flex items-center justify-between p-4 rounded-3xl hover:bg-[var(--primary-muted)] transition-all border border-transparent hover:border-[var(--primary)]/10 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white/3 flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors border border-white/5">
                          <s.icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-[11px] font-black text-[var(--muted)] group-hover:text-foreground uppercase tracking-[0.1em] transition-colors">
                          {s.title}
                        </h4>
                      </div>
                      <Target className="w-4 h-4 text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 flex justify-between items-center px-8">
              <span className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">
                Axiom 2026 Deep Scan
              </span>
              <span className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">
                <kbd className="bg-white/3 px-1.5 py-0.5 rounded border border-border not-italic mr-1">ESC</kbd>
                CLOSE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
