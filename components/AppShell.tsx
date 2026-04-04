'use client'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, Menu, ChevronDown,
  Users, LayoutDashboard, Database, Layers, Zap, Clock,
  ShieldCheck, Settings, Activity, Search, ArrowUpRight, LogOut, Orbit
} from 'lucide-react'
import GlobalSearch from './GlobalSearch'

// ─── FULL 3-DOMAIN NAVIGATION REGISTRY ───────────────────────────────────────
const navigationSections = [
  {
    label: 'Core Operations',
    items: [
      { name: 'Treasury',         href: '/dashboard',   icon: LayoutDashboard },
      { name: 'Properties',       href: '/properties',  icon: Database },
      { name: 'Tenants',          href: '/tenants',     icon: Users },
      { name: 'Onboarding',       href: '/onboarding',  icon: Search },
      { name: 'Expense Registry', href: '/expenses',    icon: Layers },
      { name: 'Asset Reserve',    href: '/treasury',    icon: Database },
    ]
  },
  {
    label: 'Intelligence Hub',
    items: [
      { name: 'Analytic Hub',  href: '/reports',                       icon: Activity },
      { name: 'Master Ledger', href: '/reports/master-ledger',         icon: Layers },
      { name: 'Waterfall Core',href: '/reports/ledger-waterfall',      icon: Zap },
      { name: 'Forex Engine',  href: '/reports/financial-connections', icon: Activity },
      { name: 'Aging Matrix',  href: '/receivables/aging',             icon: Clock },
    ]
  },
  {
    label: 'Governance Control',
    items: [
      { name: 'Taxonomy Logic', href: '/settings/categories', icon: Settings },
      { name: 'System Ontology',href: '/settings/ontology',   icon: Orbit },
      { name: 'Audit Protocol', href: '/settings/audit',      icon: ShieldCheck },
      { name: 'Data Ingestion', href: '/settings/ingestion',  icon: ArrowUpRight },
      { name: 'Team Command',   href: '/settings/team',       icon: Users },
    ]
  }
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // Default open: Core Operations only
  const [openSections, setOpenSections] = useState<string[]>(['Core Operations'])
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  const toggleSection = (label: string) => {
    setOpenSections(prev =>
      prev.includes(label)
        ? prev.filter(s => s !== label)
        : [...prev, label]
    )
  }

  if (!mounted) return null

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 flex flex-col
        finova-glass
        transform transition-transform duration-500 ease-in-out
        lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Brand mark */}
        <div className="shrink-0 px-8 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
              <Zap className="text-white fill-white w-5 h-5" />
            </div>
            <h2 className="text-xl font-black italic tracking-tighter dark:text-white">
              AXIOM <span className="text-brand">2026</span>
            </h2>
          </div>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
          {navigationSections.map((section) => (
            <div key={section.label} className="space-y-1">
              {/* Section toggle header */}
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {section.label}
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${openSections.includes(section.label) ? 'rotate-180' : ''}`} />
              </button>

              {/* Collapsible items */}
              <AnimatePresence initial={false}>
                {openSections.includes(section.label) && (
                  <motion.div
                    key={section.label}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden space-y-1"
                  >
                    {section.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`
                            flex items-center px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] rounded-2xl transition-all duration-200
                            ${isActive
                              ? 'bg-brand text-white shadow-md shadow-brand/25'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                            }
                          `}
                        >
                          <item.icon className="mr-3 h-4 w-4 shrink-0" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* ── PINNED FOOTER: Identity + Log Out ───────────────────────────── */}
        <div className="shrink-0 px-6 py-6 border-t border-slate-200/50 dark:border-white/5">
          {/* User identity card */}
          <div className="bg-slate-100/60 dark:bg-slate-800/40 rounded-2xl px-4 py-3 flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center font-black text-brand text-xs shrink-0">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 leading-none mb-1 truncate">
                Sovereign Auditor
              </p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-500">
                Admin
              </p>
            </div>
          </div>

          {/* Log out trigger */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2 py-3 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all duration-300"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN COLUMN ─────────────────────────────────────────────────────── */}
      {/* FIX: explicit dark:bg-slate-950 prevents the white canvas bleed */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

        {/* Header */}
        <header className="h-20 finova-glass flex items-center justify-between px-8 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-500"
          >
            <Menu size={20} />
          </button>

          <GlobalSearch />

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <motion.div
              animate={{ rotate: resolvedTheme === 'dark' ? 360 : 0 }}
              transition={{ duration: 0.4 }}
            >
              {resolvedTheme === 'dark'
                ? <Moon size={18} className="text-slate-200" />
                : <Sun size={18} className="text-amber-500" />
              }
            </motion.div>
          </button>
        </header>

        {/* Main canvas — FIX: dark:bg-slate-950 ensures full-viewport dark mode */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
          {children}
        </main>
      </div>
    </div>
  )
}
