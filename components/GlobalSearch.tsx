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
    <div className="relative flex-1 max-w-xl mx-8" ref={dropdownRef}>
      {/* Search Input Bar */}
      <div className={cn(
        "flex items-center gap-4 h-11 px-5 rounded-[8px] bg-muted/50 border border-border transition-all duration-200",
        isOpen
          ? "bg-card border-primary ring-2 ring-primary/10"
          : "hover:border-muted-foreground/30"
      )}>
        {isSearching
          ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
          : <Search className="w-4 h-4 text-muted-foreground" />
        }
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          placeholder="Search Assets & Tenants..."
          className="flex-1 bg-transparent border-none text-[13px] font-bold text-foreground placeholder:text-muted-foreground outline-none uppercase tracking-tight"
        />
        <div className="flex items-center gap-1 opacity-40">
          <span className="text-[10px] font-bold border border-border px-1.5 py-0.5 rounded-[4px] text-foreground">⌘</span>
          <span className="text-[10px] font-bold border border-border px-1.5 py-0.5 rounded-[4px] text-foreground">K</span>
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
            className="absolute top-14 left-0 right-0 max-h-[520px] overflow-hidden rounded-[12px] bg-card border border-border z-50 flex flex-col"
          >
            <div className="p-4 overflow-y-auto flex-1 space-y-8 scrollbar-hide">

              {/* Search Results Section */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase pl-3 border-l-2 border-primary">
                  Quantum Suggestions
                </p>
                {results.length === 0 && !isSearching ? (
                  <p className="p-6 text-center text-[12px] font-bold text-muted-foreground bg-muted/50 rounded-[8px] border border-dashed border-border uppercase">
                    No signals detected for search parameters.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-1">
                    {results.map((r) => (
                      <Link
                        key={`${r.type}-${r.id}`}
                        href={r.href}
                        className="flex items-center justify-between p-3 rounded-[8px] hover:bg-foreground/[0.03] transition-none group border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-[8px] flex items-center justify-center border transition-none bg-muted text-muted-foreground border-border", getTypeStyle(r.type))}>
                            {getIcon(r.type)}
                          </div>
                          <div>
                            <h4 className="text-[13px] font-bold text-foreground tracking-tight leading-none mb-1 transition-none uppercase">
                              {r.title}
                            </h4>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase opacity-60">
                              {r.description || r.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-none">
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-[4px] border uppercase", getTypeStyle(r.type))}>
                            {r.type}
                          </span>
                          <ArrowRight className="w-4 h-4 text-primary" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Sovereign Shortcuts Section */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase pl-3 border-l-2 border-border">
                  Sovereign Shortcuts
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {staticNav.map((s) => (
                    <Link
                      key={s.title}
                      href={s.href}
                      className="flex items-center justify-between p-3 rounded-[8px] hover:bg-foreground/[0.03] transition-none border border-transparent hover:border-border group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[8px] bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-none border border-border">
                          <s.icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-[12px] font-bold text-muted-foreground group-hover:text-foreground uppercase transition-none">
                          {s.title}
                        </h4>
                      </div>
                      <Target className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-none" />
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
                  <kbd className="bg-card px-2 py-0.5 rounded-[4px] border border-border not-font-bold shadow-sm">ESC</kbd>
                  CLOSE
                </span>
                <span className="flex items-center gap-1.5 opacity-60">
                  <kbd className="bg-card px-2 py-0.5 rounded-[4px] border border-border not-font-bold shadow-sm">⏎</kbd>
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
