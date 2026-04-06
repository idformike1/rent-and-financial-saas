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
    <div className="flex h-screen w-full bg-[#0B0D10] overflow-hidden font-sans selection:bg-white/10">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0B0D10] border-r border-[#23252A] flex flex-col transform transition-transform duration-300 lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Brand bar */}
        <div className="h-14 flex items-center px-6 border-b border-[#23252A] shrink-0">
          <div className="flex items-center gap-3">
            <Zap className="text-white w-4 h-4 fill-white" />
            <h2 className="text-sm font-bold tracking-tight text-white uppercase italic">
              Mercury <span className="text-[#8A919E] font-normal not-italic">OS</span>
            </h2>
          </div>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto pt-4 px-3 space-y-6 scrollbar-hide">
          {filteredSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-medium text-[#8A919E] uppercase tracking-wider hover:text-white transition-colors"
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
                          "flex items-center w-full px-3 py-1.5 text-sm font-medium rounded-[6px] transition-none my-0.5",
                          isActive
                            ? "text-white bg-[#14161A] border border-[#23252A]/50"
                            : "text-[#8A919E] hover:text-white hover:bg-[#14161A]/50"
                        )}
                      >
                        <item.icon className={cn("mr-3 h-4 w-4 shrink-0", isActive ? "text-white" : "text-[#8A919E]")} />
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
        <div className="mt-auto p-4 border-t border-[#23252A] flex items-center gap-3 bg-[#0B0D10]">
          <div className="w-8 h-8 rounded-[4px] bg-[#23252A] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate leading-none mb-1">
              {userName}
            </p>
            <p className="text-[10px] text-[#8A919E] truncate uppercase tracking-wider">
              {userRole}
            </p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 text-[#8A919E] hover:text-white transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* ── MAIN COLUMN ─────────────────────────────────────────────────────── */}
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col bg-[#0B0D10]">

        {/* ── TOP BAR / HEADER ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 w-full h-14 px-8 flex items-center justify-between bg-[#0B0D10] border-b border-[#23252A] shadow-none shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#8A919E] hover:text-white"
            >
              <Menu size={18} />
            </button>
            <div className="text-sm font-medium text-white uppercase tracking-tight">
              {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Workstation'}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <GlobalSearch />
            <div className="h-4 w-px bg-[#23252A]" />
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="text-[#8A919E] hover:text-white transition-none"
            >
              {resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
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
    default: "border-[#23252A] text-[#8A919E] bg-[#1A1D24]",
    success: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    warning: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    danger:  "border-rose-500/30 text-rose-400 bg-rose-500/10",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-[4px] border text-[11px] font-medium leading-none",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
