'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { WORKSPACE_CONFIG, WorkspaceMode } from '@/src/config/workspace.config'

interface DynamicSidebarProps {
  activeWorkspaceId?: string
  organizations: { id: string; name: string }[]
  onMobileClose?: () => void
  activeModule?: 'RENT' | 'WEALTH'
}

import { useSession } from 'next-auth/react'

export default function DynamicSidebar({ 
  activeWorkspaceId, 
  organizations,
  onMobileClose,
  activeModule
}: DynamicSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  // ── 1. ENTITLEMENT DETECTION ───────────────────────────────────────────
  const canAccessRent = (session?.user as any)?.canAccessRent ?? true
  const canAccessWealth = (session?.user as any)?.canAccessWealth ?? true

  // ── 2. MODE ORCHESTRATION ──────────────────────────────────────────────
  // The mode is now explicitly driven by the Top Header Switcher (activeModule)
  const mode: WorkspaceMode = activeModule === 'WEALTH' ? 'WEALTH' : 'PROPERTY'
  
  // Safety Guard: If user somehow tries to access a forbidden module via URL/Cookie
  const hasAccess = mode === 'WEALTH' ? canAccessWealth : canAccessRent
  const config = WORKSPACE_CONFIG[mode]

  if (!hasAccess) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <Zap className="w-8 h-8 text-red-500/20 mb-4" />
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Access Terminated</p>
        <p className="text-[9px] text-neutral-600 mt-2 uppercase tracking-tighter">Your identity lacks active entitlements for this functional scope.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">

      {/* ── MODE INDICATOR BADGE ────────────────────────────────────────── */}
      <div className="px-4 py-3">
        <div className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300",
          mode === 'WEALTH' 
            ? "border-amber-500/30 text-amber-500 bg-amber-500/5 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)]" 
            : "border-primary/30 text-primary bg-primary/5 shadow-[0_0_15px_-3px_rgba(var(--primary),0.1)]"
        )}>
          <span className={cn(
              "w-1.5 h-1.5 rounded-full mr-2",
              mode === 'WEALTH' ? "bg-amber-500" : "bg-primary"
          )} />
          {config.badgeText}
        </div>
      </div>

      {/* ── DYNAMIC NAVIGATION CONTENT ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-6 pt-2 scrollbar-none">
        {config.menuItems.map((section) => (
          <div key={section.label} className="space-y-1">
            <h3 className="px-3 text-[10px] font-black text-clinical-muted/60 tracking-[0.2em] uppercase">
              {section.label}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center w-full px-3 h-[40px] text-[13px] font-medium rounded-[var(--radius-sm)] transition-all duration-200 group",
                      isActive
                        ? "text-foreground bg-sidebar-accent shadow-sm"
                        : "text-clinical-muted hover:text-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        "w-[16px] h-[16px] mr-3 transition-all duration-200",
                        isActive 
                            ? "opacity-100 text-primary scale-110" 
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
                        <div className="ml-auto w-1 h-4 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
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
