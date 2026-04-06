'use client'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, Menu, ChevronDown,
  Users, LayoutDashboard, Database, Layers, Zap, Clock,
  ShieldCheck, Settings, Activity, Search, ArrowUpRight, LogOut, Orbit
} from 'lucide-react'
import GlobalSearch from './GlobalSearch'
import { cn } from '@/lib/utils'

// ─── FULL 3-DOMAIN NAVIGATION REGISTRY ───────────────────────────────────────
const navigationSections = [
  {
    label: 'Core Operations',
    items: [
      { name: 'Dashboard',        href: '/dashboard',   icon: LayoutDashboard },
      { name: 'Properties',       href: '/properties',  icon: Database },
      { name: 'Tenants',          href: '/tenants',     icon: Users },
      { name: 'Onboarding',       href: '/onboarding',  icon: Search },
      { name: 'Expense Registry', href: '/expenses',    icon: Layers },
      { name: 'Treasury',         href: '/treasury',    icon: Database },
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
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'MANAGER'
  const userName = session?.user?.name || 'Sovereign Auditor'

  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  // RESTRCTIVE FILTERING: Exclude Governance for Managers
  const filteredSections = navigationSections.filter(section => {
    if (section.label === 'Governance Control' && userRole === 'MANAGER') {
      return false
    }
    return true
  })

  if (!mounted) return null

  return (
    <div className="flex h-screen bg-[var(--background)] transition-colors duration-500 overflow-hidden font-sans">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className={cn(`
        fixed inset-y-0 left-0 z-50 w-72 flex flex-col
        glass-panel m-6 rounded-[2.5rem]
        transform transition-all duration-500 ease-in-out
        lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `, isMobileMenuOpen ? "m-0 inset-0 w-full rounded-xl" : "")}>

        {/* Brand mark */}
        <div className="shrink-0 px-10 pt-10 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-3xl bg-brand flex items-center justify-center glow-orange">
              <Zap className="text-foreground fill-white w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tighter text-[var(--foreground)]">
              AXIOM <span className="text-[var(--primary)]">2026</span>
            </h2>
          </div>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-8 pb-4 space-y-4">
          {filteredSections.map((section) => (
            <div key={section.label} className="space-y-2">
              {/* Section toggle header */}
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                {section.label}
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", openSections.includes(section.label) ? 'rotate-180' : '')} />
              </button>

              {/* Collapsible items */}
              <AnimatePresence initial={false}>
                {openSections.includes(section.label) && (
                  <motion.div
                    key={section.label}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden space-y-2 pt-2"
                  >
                    {section.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(`
                            flex items-center px-6 py-4 text-[11px] font-bold uppercase tracking-[0.15em] rounded-full transition-all duration-300
                            ${isActive
                              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/30 glow-primary'
                              : 'text-[var(--muted)] hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]'
                            }
                          `)}
                        >
                          <item.icon className={cn("mr-4 h-4 w-4 shrink-0", isActive ? "text-[var(--primary-foreground)]" : "text-[var(--primary)]")} />
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
        <div className="shrink-0 px-8 py-8 border-t border-white/5">
          {/* User identity card */}
          <div className="bg-white/3 rounded-[1.5rem] px-5 py-4 flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center font-black text-brand text-xs shrink-0 border border-brand/20">
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase text-[var(--foreground)] leading-none mb-1.5 truncate">
                {userName}
              </p>
              <Badge variant={userRole === 'MANAGER' ? 'warning' : 'success'} className="px-2 py-0.5 text-[7px]">
                {userRole}
              </Badge>
            </div>
          </div>

          {/* Log out trigger */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-3 py-4 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-full transition-all duration-300 border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={14} />
            Sign Out System
          </button>
        </div>
      </aside>

      {/* ── MAIN COLUMN ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--background)] transition-colors duration-500">

        {/* Header */}
        <header className="h-24 glass-panel border-none mx-6 mt-6 rounded-[2.5rem] flex items-center justify-between px-10 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-3 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <Menu size={22} />
          </button>

          <GlobalSearch />

          {/* Theme toggle - Hidden in V3 forced dark mode but logic preserved */}
          <div className="flex items-center gap-4">
             <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-4 rounded-full bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all hover:scale-105 active:scale-95"
            >
              {resolvedTheme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        {/* Main canvas */}
        <main className="flex-1 overflow-y-auto p-12 bg-[var(--background)] transition-colors duration-500">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function Badge({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand' }) {
  const variants = {
    default: "bg-white/3 text-slate-400 border border-border",
    success: "bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--primary)]/20 font-bold",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold",
    danger:  "bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold",
    brand:   "bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--primary)]/20 font-bold",
  };

  return (
    <span className={cn("px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest inline-flex items-center gap-1.5", variants[variant], className)}>
      {children}
    </span>
  )
}

