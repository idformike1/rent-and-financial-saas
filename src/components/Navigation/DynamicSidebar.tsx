'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Building2, 
  Users, 
  Wallet, 
  Zap, 
  ShieldCheck, 
  Database, 
  BarChart3, 
  Settings, 
  History,
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  Activity
} from 'lucide-react'

const PROPERTY_NAV = [
  {
    label: 'COMMAND',
    items: [
      { name: 'Dashboard', href: '/home', icon: Home },
      { name: 'Assets', href: '/assets', icon: Building2 },
      { name: 'Registry', href: '/tenants', icon: Users },
    ]
  },
  {
    label: 'TREASURY',
    items: [
      { name: 'Cash Flow', href: '/treasury', icon: Wallet },
      { name: 'Command Center', href: '/treasury/command-center', icon: Zap },
    ]
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { name: 'Governance', href: '/governance/ledger', icon: Database },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
    ]
  },
  {
    label: 'SYSTEM',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Audit Panopticon', href: '/admin/audit', icon: History },
    ]
  }
]

const WEALTH_NAV = [
  {
    label: 'WEALTH HUB',
    items: [
      { name: 'Wealth Cockpit', href: '/home', icon: Home },
      { name: 'Insights', href: '/reports/insights', icon: LayoutDashboard },
      { name: 'Accounts Matrix', href: '/wealth/accounts', icon: Wallet },
      { name: 'Cash Flow Insights', href: '/wealth/cashflow', icon: TrendingUp },
      { name: 'Allowances & Transfers', href: '/wealth/transfers', icon: ArrowLeftRight },
    ]
  },
  {
    label: 'SYSTEM',
    items: [
      { name: 'Master Ledger', href: '/treasury', icon: Database },
      { name: 'Ledger Explorer', href: '/governance/ledger', icon: History },
      { name: 'Internal Audit', href: '/settings/audit', icon: ShieldCheck },
      { name: 'System Registry', href: '/settings/registry', icon: Settings },
    ]
  }
]

export default function DynamicSidebar({ 
  onMobileClose,
  activeModule
}: {
  onMobileClose?: () => void;
  activeModule?: 'RENT' | 'WEALTH';
}) {
  const pathname = usePathname()
  const navGroups = activeModule === 'WEALTH' ? WEALTH_NAV : PROPERTY_NAV
  const activeColor = activeModule === 'WEALTH' ? 'text-amber-500' : 'text-emerald-500'
  const activeBg = activeModule === 'WEALTH' ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* ── MODE INDICATOR BADGE ────────────────────────────────────────── */}
      <div className="px-4 py-3">
        <div className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300",
          activeModule === 'WEALTH' 
            ? "border-amber-500/30 text-amber-500 bg-amber-500/5 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)]" 
            : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]"
        )}>
          <span className={cn(
              "w-1.5 h-1.5 rounded-full mr-2",
              activeModule === 'WEALTH' ? "bg-amber-500" : "bg-emerald-500"
          )} />
          {activeModule === 'WEALTH' ? 'Wealth Portfolio' : 'Property Management'}
        </div>
      </div>

      {/* ── DYNAMIC NAVIGATION CONTENT ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-6 pt-2 scrollbar-none">
        {navGroups.map((section) => (
          <div key={section.label} className="space-y-1">
            <h3 className="px-3 text-[10px] font-black text-neutral-500 tracking-[0.2em] uppercase">
              {section.label}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center w-full px-3 h-[40px] text-[13px] font-medium rounded-lg transition-all duration-200 group",
                      isActive
                        ? "text-white bg-white/5 shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        "w-[16px] h-[16px] mr-3 transition-all duration-200",
                        isActive 
                            ? cn("opacity-100 scale-110", activeColor)
                            : "opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5"
                      )} 
                    />
                    <span className={cn(
                        "truncate transition-colors",
                        isActive ? "font-semibold" : "font-normal"
                    )}>
                        {item.name}
                    </span>
                    
                    {isActive && (
                        <div className={cn("ml-auto w-1 h-4 rounded-full animate-in fade-in zoom-in duration-300", activeBg)} />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
