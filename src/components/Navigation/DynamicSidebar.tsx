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
      { name: 'Tenants', href: '/tenants', icon: Users },
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
      { name: 'Settings', href: '/settings/parameters', icon: Settings },
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
  activeModule,
  isCollapsed = false
}: {
  onMobileClose?: () => void;
  activeModule?: 'RENT' | 'WEALTH';
  isCollapsed?: boolean;
}) {

  const pathname = usePathname()
  const navGroups = activeModule === 'WEALTH' ? WEALTH_NAV : PROPERTY_NAV
  const activeColor = activeModule === 'WEALTH' ? 'text-amber-500' : 'text-emerald-500'
  const activeBg = activeModule === 'WEALTH' ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* ── MODE INDICATOR BADGE ────────────────────────────────────────── */}
      <div className={cn(
        "py-3 flex items-center transition-all duration-300",
        isCollapsed ? "justify-center px-0" : "px-4"
      )}>
        <div className={cn(
          "inline-flex items-center transition-all duration-300",
          isCollapsed 
            ? "justify-center" 
            : "px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-[0.15em] uppercase shadow-sm",
          activeModule === 'WEALTH' 
            ? "border-amber-500/30 text-amber-500 bg-amber-500/5" 
            : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
        )}>
          <span className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              isCollapsed ? "mr-0" : "mr-2",
              activeModule === 'WEALTH' ? "bg-amber-500" : "bg-emerald-500"
          )} />
          <span className={cn(
            "transition-all duration-300 truncate",
            isCollapsed ? "hidden" : "block"
          )}>
            {activeModule === 'WEALTH' ? 'Capital Hub' : 'Asset Engine'}
          </span>
        </div>
      </div>



      {/* ── DYNAMIC NAVIGATION CONTENT ───────────────────────────────────── */}
      <nav className={cn(
        "flex-1 pt-2 scrollbar-none transition-all duration-300",
        isCollapsed ? "overflow-y-visible px-0 space-y-4" : "overflow-y-auto px-2 space-y-6"
      )}>
        {navGroups.map((section) => (
          <div key={section.label} className="space-y-1">
            <h3 className={cn(
              "px-3 text-[10px] font-black text-neutral-500 tracking-[0.2em] uppercase transition-all duration-500 overflow-hidden",
              isCollapsed ? "h-0 opacity-0 mb-0" : "h-auto opacity-100 mb-2"
            )}>
              {section.label}
            </h3>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center w-full h-[40px] text-[13px] font-medium rounded-xl transition-all duration-200",
                        isCollapsed ? "justify-center px-0" : "justify-start px-3",
                        isActive
                          ? "text-white bg-white/5 shadow-sm"
                          : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                      )}
                    >
                      <item.icon 
                        className={cn(
                          "w-[16px] h-[16px] transition-all duration-200",
                          isCollapsed ? "mr-0" : "mr-3",
                          isActive 
                              ? cn("opacity-100 scale-110", activeColor)
                              : "opacity-40 group-hover:opacity-100"
                        )} 
                      />

                      <span className={cn(
                          "truncate transition-all duration-300",
                          isCollapsed ? "hidden" : "block",
                          isActive ? "font-semibold" : "font-normal"
                      )}>
                          {item.name}
                      </span>
                      
                      {isActive && (
                          <div className={cn(
                            "ml-auto w-1 h-4 rounded-full animate-in fade-in zoom-in duration-300", 
                            isCollapsed ? "hidden" : "block",
                            activeBg
                          )} />
                      )}
                    </Link>

                    <div className={cn(
                      "absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-neutral-900 border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase rounded shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 z-[100] whitespace-nowrap",
                      isCollapsed ? "block" : "hidden"
                    )}>
                      {item.name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>


    </div>
  )
}
