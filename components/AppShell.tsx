'use client'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  const [openSections, setOpenSections] = useState<string[]>(['Core Operations', 'Intelligence Hub', 'Governance Control'])
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  const toggleSection = (label: string) => {
    setOpenSections(prev =>
      prev.includes(label)
        ? prev.filter(s => s !== label)
        : [...prev, label]
    )
  }

  const filteredSections = navigationSections.filter(section => {
    if (section.label === 'Governance Control' && userRole === 'MANAGER') return false
    return true
  })

  if (!mounted) return null

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans selection:bg-primary/10 text-foreground">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border flex flex-col transform transition-transform duration-300 lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Brand bar */}
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0 bg-card dark:bg-background">
          <div className="flex items-center gap-3">
            <Zap className="text-primary w-4 h-4 fill-primary" />
            <h2 className="text-sm font-bold tracking-tight text-foreground uppercase">
              Mercury <span className="text-muted-foreground font-normal">OS</span>
            </h2>
          </div>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto pt-4 px-3 space-y-6 scrollbar-hide">
          {filteredSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] hover:text-foreground transition-colors"
              >
                {section.label}
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", openSections.includes(section.label) ? 'rotate-180' : '')} />
              </button>

              {openSections.includes(section.label) && (
                <div className="space-y-0.5 mt-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center w-full px-3 py-1.5 text-[13px] font-semibold rounded-[8px] transition-none my-0.5",
                          isActive
                            ? "text-foreground bg-foreground/[0.08] border border-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
                        )}
                      >
                        <item.icon className={cn("mr-3 h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── USER PROFILE ─────────────────────────────────────────────────── */}
        <div className="mt-auto p-4 border-t border-border flex items-center gap-3 bg-card">
          <div className="w-8 h-8 rounded-[6px] bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-foreground truncate leading-none mb-1">
              {userName}
            </p>
            <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-bold">
              {userRole}
            </p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── MAIN COLUMN ─────────────────────────────────────────────────────── */}
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col bg-background">

        {/* ── TOP BAR / HEADER ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 w-full h-16 px-8 flex items-center justify-between bg-card dark:bg-background border-b border-border shadow-none shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <Menu size={18} />
            </button>
            <div className="text-[14px] font-bold text-foreground uppercase tracking-tight">
              {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Workstation'}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <GlobalSearch />
            <div className="h-4 w-px bg-border" />
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-foreground transition-none p-2 rounded-[8px] hover:bg-foreground/[0.05]"
            >
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* ── MAIN CANVAS ───────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function Badge({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const variants = {
    default: "border-border text-muted-foreground bg-muted",
    success: "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    warning: "border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/10",
    danger:  "border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-500/10",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-[4px] border text-[11px] font-bold leading-none uppercase tracking-tight",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
