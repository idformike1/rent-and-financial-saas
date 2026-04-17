'use client'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GlobalSearch from './GlobalSearch'
import { cn } from '@/lib/utils'
import {
  Home,
  List,
  LayoutDashboard,
  Building2,
  Users,
  Zap,
  Tag,
  Wallet,
  Activity,
  BarChart3,
  TrendingDown,
  Globe,
  CalendarDays,
  Database,
  Search,
  Settings,
  ShieldCheck,
  FileSpreadsheet,
  Users2
} from 'lucide-react'

// ─── FULL 5-PILLAR DOMAIN NAVIGATION REGISTRY ──────────────────────────────
const navigationSections = [
  {
    label: 'Command',
    items: [
      { name: 'Home',              href: '/home',               icon: Home },
      { name: 'Transactions',      href: '/treasury/feed',      icon: List },
      { name: 'Dashboard',         href: '/reports',            icon: LayoutDashboard },
      { name: 'Properties',        href: '/assets',             icon: Building2 },
      { name: 'Tenants',           href: '/tenants',            icon: Users },
      { name: 'Onboarding',        href: '/onboarding',         icon: Zap },
      { name: 'Expense Registry',  href: '/treasury/payables',  icon: Tag },
      { name: 'Treasury',          href: '/treasury',           icon: Wallet },
    ]
  },
  {
    label: 'Intelligence hub',
    items: [
      { name: 'Insights',          href: '/reports/insights',   icon: Activity },
      { name: 'Analytic Hub',      href: '/reports',            icon: BarChart3 },
      { name: 'Waterfall Core',    href: '/reports/ledger-waterfall', icon: TrendingDown },
      { name: 'Forex Engine',      href: '/reports/forex',      icon: Globe },
      { name: 'Forensic Explorer',    href: '/governance/ledger',  icon: Database },
      { name: 'Aging Matrix',      href: '/treasury/receivables/aging', icon: CalendarDays },
    ]
  },
  {
    label: 'Governance control',
    items: [
      { name: 'Taxonomy Logic',    href: '/settings/categories', icon: Database },
      { name: 'System Ontology',   href: '/governance/system',  icon: Settings },
      { name: 'Audit Protocol',    href: '/settings/audit',     icon: ShieldCheck },
      { name: 'Data Ingestion',    href: '/settings/ingestion', icon: FileSpreadsheet },
      { name: 'Team Command',      href: '/settings/team',      icon: Users2 },
    ]
  }
]


export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'MANAGER'
  const userName = session?.user?.name || 'Sovereign Auditor'

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['Treasury', 'Command', 'Intelligence hub', 'Governance control'])
  const pathname = usePathname()

  const toggleSection = (label: string) => {
    setOpenSections(prev =>
      prev.includes(label)
        ? prev.filter(s => s !== label)
        : [...prev, label]
    )
  }

  const filteredSections = navigationSections.filter(section => {
    if (section.label === 'Governance control' && userRole === 'MANAGER') return false
    return true
  })

  // ── AUTH ISOLATION GUARD ─────────────────────────────────────────────
  // If the current path is /login, we bypass the shell to prevent 
  // UI overlap. We wrap in a w-full container to maintain centering
  // within the RootLayout's flex body.
  if (pathname === '/login') return <div className="w-full h-screen">{children}</div>;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans selection:bg-primary/10 text-foreground">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[232px] bg-sidebar border-r border-border flex flex-col transform transition-transform duration-300 lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Brand bar */}
        <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-[20px] h-[20px] bg-foreground rounded-full flex items-center justify-center">
               <span className="text-[10px] text-background font-bold">M</span>
            </div>
            <h2 className="text-[14px] font-medium tracking-tight text-foreground">
              Mercury
            </h2>
          </div>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto pt-4 px-2 space-y-4 scrollbar-hide">
          {filteredSections.map((section) => (
            <div key={section.label} className="space-y-0.5">
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors tracking-tight"
              >
                {section.label}
                <span className={cn("text-[10px] transition-transform duration-200", openSections.includes(section.label) ? 'rotate-180' : '')}>▼</span>
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
                          "flex items-center w-full px-3 h-[36px] text-[15px] font-[380] tracking-normal rounded-md transition-all duration-150 my-0.5 group",
                          isActive
                            ? "text-foreground bg-sidebar-accent border-l-2 border-primary rounded-l-none"
                            : "text-muted-foreground/40 hover:text-foreground hover:bg-sidebar-accent/50"
                        )}
                      >
                        <item.icon 
                          className={cn(
                            "w-[15px] h-[14px] mr-3 transition-opacity duration-150 shrink-0",
                            isActive ? "opacity-100 text-foreground" : "opacity-40 text-muted-foreground group-hover:opacity-100 group-hover:text-foreground"
                          )} 
                        />
                        <span className="truncate tracking-tight">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── USER PROFILE ─────────────────────────────────────────────────── */}
        <div className="mt-auto p-3 border-t border-border flex items-center gap-2 bg-card">
          <div className="w-7 h-7 rounded-[4px] bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-foreground truncate leading-none tracking-tight">
              {userName}
            </p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-[12px] font-bold">➲</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN COLUMN ─────────────────────────────────────────────────────── */}
      <div className="flex-1 ml-[232px] h-screen overflow-hidden flex flex-col bg-background">

        {/* ── TOP BAR / HEADER (CENTERED SEARCH SYNC) ────────────────────────── */}
        <header className="sticky top-0 z-40 w-full h-[56px] flex items-center bg-background border-b border-border shrink-0">
          <div className="w-full max-w-[1440px] mx-auto px-8 flex items-center">
            <div className="flex-1 flex items-center justify-center">
               <div className="w-full max-w-[512px] relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-muted-foreground/40 group-focus-within:text-foreground transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search for anything" 
                    className="w-full h-8 bg-card border border-border rounded-[6px] pl-9 pr-4 text-[13px] text-foreground placeholder-muted-foreground/30 focus:outline-none focus:border-primary/20 transition-all font-[360] tracking-tight"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-20 group-focus-within:opacity-40 transition-opacity">
                     <kbd className="text-[10px] font-sans">⌘</kbd>
                     <kbd className="text-[10px] font-sans">K</kbd>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
               <div className="w-8 h-8 rounded-[6px] bg-muted/10 border border-border flex items-center justify-center overflow-hidden">
                  <span className="text-[10px] font-bold text-foreground opacity-60">ADMIN</span>
               </div>
            </div>
          </div>
        </header>

        {/* ── MAIN CANVAS ───────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1440px] mx-auto px-8 pt-8 pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function Badge({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const variants = {
    default: "border-border text-muted-foreground bg-secondary",
    success: "border-mercury-green/20 text-mercury-green bg-mercury-green/10",
    warning: "border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/10",
    danger:  "border-destructive/20 text-destructive bg-destructive/10",
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
