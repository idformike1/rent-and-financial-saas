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

// ─── MERCURY SVG REGISTRY ──────────────────────────────────────────────────
const Icons = {
  Home: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className={cn("w-[18px] h-[18px] fill-current", className)}>
      <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 35.3-28.7 64-64 64H64.1c-35.3 0-64-28.7-64-64L0 287.6H32c-17 0-32-14.1-32-32.1c0-9 3-17 10-24L265.9 10.3c10-11 25-11 35 0L565.8 231.5c7 7 10 15 10 24z"/>
    </svg>
  ),
  Transactions: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={cn("w-[18px] h-[18px] fill-current", className)}>
      <path d="M64 144a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM64 464a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM48 304a48 48 0 1 0 96 0 48 48 0 1 0 -96 0z"/>
    </svg>
  ),
  Payments: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={cn("w-[18px] h-[18px] fill-current", className)}>
      <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L415.7 112c3.4-3.7 3.2-9.4-.4-12.8s-9.1-3.3-12.8 .4L101.4 345c-9.5 8.7-23.7 10.9-35.5 5.5l-48-22c-10.4-4.8-17-15.3-16.7-26.8s7.9-21.4 18.9-24.8l448-138.7c10.6-3.3 22.1-1.3 30 5.4z"/>
    </svg>
  ),
  Accounts: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={cn("w-[18px] h-[18px] fill-current", className)}>
      <path d="M243.4 2.6c9.8-3.5 20.6-3.5 30.4 0l208 74.3C496.7 82.3 512 96.1 512 112s-15.3 29.7-30.2 35.1l-208 74.3c-9.8 3.5-20.6 3.5-30.4 0L35 147.1C20.1 141.8 4.8 127.9 4.8 112S20.1 82.3 35 76.9l208.4-74.3zM256 464c-17.7 0-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32s-14.3-32-32-32zM32 192l0 224c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32l0-224L32 192zM64 416l0-160 32 0 0 160-32 0zm96 0l0-160 32 0 0 160-32 0zm96 0l0-160 32 0 0 160-32 0zm96 0l0-160 32 0 0 160-32 0zm96 0l0-160 32 0 0 160-32 0z"/>
    </svg>
  )
}

// ─── FULL 3-DOMAIN NAVIGATION REGISTRY ───────────────────────────────────────
const navigationSections = [
  {
    label: 'Core Operations',
    items: [
      { name: 'Dashboard',        href: '/dashboard',   icon: Icons.Home },
      { name: 'Properties',       href: '/properties',  icon: Icons.Accounts },
      { name: 'Tenants',          href: '/tenants',     icon: Icons.Accounts },
      { name: 'Onboarding',       href: '/onboarding',  icon: Icons.Transactions },
      { name: 'Expense Registry', href: '/expenses',    icon: Icons.Transactions },
      { name: 'Treasury',         href: '/treasury',    icon: Icons.Payments },
    ]
  },
  {
    label: 'Intelligence Hub',
    items: [
      { name: 'Analytic Hub',  href: '/reports',                       icon: Icons.Home },
      { name: 'Master Ledger', href: '/reports/master-ledger',         icon: Icons.Transactions },
      { name: 'Waterfall Core',href: '/reports/ledger-waterfall',      icon: Icons.Payments },
      { name: 'Forex Engine',  href: '/reports/financial-connections', icon: Icons.Accounts },
      { name: 'Aging Matrix',  href: '/receivables/aging',             icon: Icons.Transactions },
    ]
  },
  {
    label: 'Governance Control',
    items: [
      { name: 'Taxonomy Logic', href: '/settings/categories', icon: Icons.Accounts },
      { name: 'System Ontology',href: '/settings/ontology',   icon: Icons.Home },
      { name: 'Audit Protocol', href: '/settings/audit',      icon: Icons.Accounts },
      { name: 'Data Ingestion', href: '/settings/ingestion',  icon: Icons.Payments },
      { name: 'Team Command',   href: '/settings/team',       icon: Icons.Accounts },
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
        "fixed inset-y-0 left-0 z-50 w-[184px] bg-background border-r border-border flex flex-col transform transition-transform duration-300 lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Brand bar */}
        <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="text-primary w-4 h-4 fill-primary" />
            <h2 className="text-[13px] font-bold tracking-tight text-foreground">
              Mercury <span className="text-muted-foreground font-normal text-[11px]">OS</span>
            </h2>
          </div>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto pt-4 px-2 space-y-4 scrollbar-hide">
          {filteredSections.map((section) => (
            <div key={section.label} className="space-y-0.5">
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                {section.label}
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", openSections.includes(section.label) ? 'rotate-180' : '')} />
              </button>

              {openSections.includes(section.label) && (
                <div className="space-y-0.5 mt-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center w-full px-2 h-[31px] text-[13px] font-medium rounded-[6px] transition-none my-0.5 group",
                          isActive
                            ? "text-foreground bg-[#1C1F26] border border-border/50 shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-[#1C1F26]/30"
                        )}
                      >
                        <item.icon 
                          className={cn(
                            "w-[18px] h-[18px] transition-colors mr-3 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )} 
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── USER PROFILE ─────────────────────────────────────────────────── */}
        <div className="mt-auto p-3 border-t border-border flex items-center gap-2 bg-card/30">
          <div className="w-7 h-7 rounded-[4px] bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-foreground truncate leading-none">
              {userName}
            </p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* ── MAIN COLUMN ─────────────────────────────────────────────────────── */}
      <div className="flex-1 ml-[184px] h-screen overflow-hidden flex flex-col bg-background">

        {/* ── TOP BAR / HEADER ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 w-full h-14 px-6 flex items-center justify-between bg-background border-b border-border shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <Menu size={18} />
            </button>
            <div className="text-[13px] font-bold text-foreground tracking-tight">
              {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Workstation'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <GlobalSearch />
            <div className="h-4 w-px bg-border" />
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-foreground transition-none p-2 rounded-full hover:bg-foreground/[0.05]"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* ── MAIN CANVAS ───────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
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
