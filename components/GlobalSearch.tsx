'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, User, Building, Settings, FileSpreadsheet, ArrowRight, Zap, Target } from 'lucide-react'
import { deepScanSystem } from '@/actions/system.actions'
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
    { title: 'Unified Wealth Ledger', type: 'REPORT', href: '/treasury/payables', icon: FileSpreadsheet },
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
  // Mercury: Result types now use variable-based styling
  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'TENANT':     return 'bg-primary/10 text-primary border-primary/20'
      case 'ASSET':      return 'bg-primary/10 text-primary border-primary/20'
      case 'GOVERNANCE': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      default:           return 'bg-muted border-border text-muted-foreground'
    }
  }

  return (
    <div className="relative flex-1 max-w-[640px] mx-8" ref={dropdownRef}>
      {/* Search Input Bar */}
      <div className={cn(
        "flex items-center gap-4 h-[38px] px-4 rounded-[var(--radius)] bg-muted border border-border transition-all duration-200",
        isOpen
          ? "bg-background border-foreground/20 ring-4 ring-ring/5"
          : "hover:border-border"
      )}>
        {isSearching
          ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          : <Search className="w-4 h-4 text-muted-foreground/50" />
        }
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          placeholder="Search..."
          className="flex-1 bg-transparent border-none text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 outline-none"
        />
        <div className="flex items-center gap-1 opacity-20">
          <span className="text-[10px] font-medium border border-border px-1.5 py-0.5 rounded-[4px] text-foreground">⌘</span>
          <span className="text-[10px] font-medium border border-border px-1.5 py-0.5 rounded-[4px] text-foreground">K</span>
        </div>
      </div>

      {/* Dropdown Results Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="absolute top-14 left-0 right-0 max-h-[520px] overflow-hidden rounded-[var(--radius)] bg-card border border-border z-50 flex flex-col"
          >
            <div className="p-4 overflow-y-auto flex-1 space-y-8 scrollbar-hide">

              {/* Search Results Section */}
              <div className="space-y-3">
                <p className="text-[11px] font-medium text-muted-foreground pl-3 border-l border-foreground/20">
                  Search results
                </p>
                {results.length === 0 && !isSearching ? (
                  <p className="p-12 text-center text-[13px] font-medium text-muted-foreground/50">
                    Search for transactions, accounts, or properties
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-0.5">
                    {results.map((r) => (
                      <Link
                        key={`${r.type}-${r.id}`}
                        href={r.href}
                        className="flex items-center justify-between px-3 py-2 rounded-[var(--radius)] hover:bg-muted transition-none group border border-transparent"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-[var(--radius)] flex items-center justify-center border transition-none bg-muted text-muted-foreground border-border", getTypeStyle(r.type))}>
                            {getIcon(r.type)}
                          </div>
                          <div>
                            <h4 className="text-[13px] font-medium text-foreground tracking-tight leading-none mb-1 transition-none">
                              {r.title}
                            </h4>
                            <p className="text-[11px] font-medium text-muted-foreground opacity-60">
                              {r.description || r.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-none">
                          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-[var(--radius)] border", getTypeStyle(r.type))}>
                            {r.type}
                          </span>
                          <ArrowRight className="w-4 h-4 text-foreground/40" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested Actions Section */}
              <div className="space-y-3">
                <p className="text-[11px] font-medium text-muted-foreground pl-3 border-l border-border">
                  Suggested actions
                </p>
                <div className="grid grid-cols-1 gap-0.5">
                  {staticNav.map((s) => (
                    <Link
                      key={s.title}
                      href={s.href}
                      className="flex items-center justify-between px-3 py-2 rounded-[var(--radius)] hover:bg-muted transition-none border border-transparent group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[var(--radius)] bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-none border border-border">
                          <s.icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-none">
                          {s.title}
                        </h4>
                      </div>
                      <ArrowRight className="w-4 h-4 text-foreground/40 opacity-0 group-hover:opacity-100 transition-none" />
                    </Link>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-between items-center px-6 bg-muted/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase ">
                Mercury Deep Scan
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-4">
                <span className="flex items-center gap-1.5 opacity-60">
                  <kbd className="bg-card px-2 py-0.5 rounded-[4px] border border-border not-font-bold ">ESC</kbd>
                  CLOSE
                </span>
                <span className="flex items-center gap-1.5 opacity-60">
                  <kbd className="bg-card px-2 py-0.5 rounded-[4px] border border-border not-font-bold ">⏎</kbd>
                  NAVIGATE
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
