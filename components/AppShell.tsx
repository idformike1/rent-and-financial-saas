'use client'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GlobalSearch from './GlobalSearch'
import WorkspaceSwitcher from '@/src/components/Navigation/WorkspaceSwitcher'
import { cn } from '@/lib/utils'
import {
  Home,
  List,
  Building2,
  Users,
  Zap,
  Tag,
  Wallet,
  Activity,
  BarChart3,
  CalendarDays,
  Database,
  Search,
  Settings,
  ShieldCheck,
  Users2
} from 'lucide-react'
import DynamicSidebar from '@/src/components/Navigation/DynamicSidebar'

// Navigation logic moved to src/config/workspace.config.ts and DynamicSidebar.tsx


export default function AppShell({ 
  children,
  organizations = [],
  activeWorkspaceId,
  workspaceSwitcher,
  activeModule
}: { 
  children: React.ReactNode,
  organizations?: { id: string, name: string }[],
  activeWorkspaceId?: string,
  workspaceSwitcher?: React.ReactNode,
  activeModule?: 'RENT' | 'WEALTH'
}) {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'MANAGER'
  const userName = session?.user?.name || 'Sovereign Auditor'

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['Treasury', 'Command', 'Intelligence hub', 'Governance control'])
  const pathname = usePathname()


  // ── AUTH ISOLATION GUARD ─────────────────────────────────────────────
  // If the current path is /login, we bypass the shell to prevent 
  // UI overlap. We wrap in a w-full container to maintain centering
  // within the RootLayout's flex body.
  if (pathname === '/login' || pathname === '/onboarding') return <div className="w-full h-screen">{children}</div>;

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
            <div className="w-[20px] h-[20px] bg-foreground rounded-[var(--radius-sm)] flex items-center justify-center">
               <span className="text-mercury-label-caps text-background">M</span>
            </div>
            <h2 className="text-mercury-heading text-foreground">
              Mercury
            </h2>
          </div>
        </div>

        {/* Navigation Content (Context-Aware) */}
        <div className="flex-1 overflow-hidden">
          <DynamicSidebar 
            activeWorkspaceId={activeWorkspaceId}
            organizations={organizations}
            onMobileClose={() => setIsMobileMenuOpen(false)}
            activeModule={activeModule}
          />
        </div>

        {/* ── USER PROFILE ─────────────────────────────────────────────────── */}
        <div className="mt-auto p-3 border-t border-border flex items-center gap-2 bg-card">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-foreground text-background flex items-center justify-center text-mercury-label-caps shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-mercury-label-caps text-foreground truncate leading-none">
              {userName}
            </p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1 text-clinical-muted hover:text-foreground transition-colors"
          >
            <span className="text-mercury-body">➲</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN COLUMN ─────────────────────────────────────────────────────── */}
      <div className="flex-1 ml-[232px] h-screen overflow-hidden flex flex-col bg-background">

        {/* ── TOP BAR / HEADER (CENTERED SEARCH SYNC) ────────────────────────── */}
        <header className="sticky top-0 z-40 w-full h-[56px] flex items-center bg-background border-b border-border shrink-0">
          <div className="w-full max-w-[1440px] mx-auto px-8 flex items-center">
            <div className="flex-1 flex items-center justify-center">
               <GlobalSearch />
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
               {workspaceSwitcher}
               <div className="px-3 py-1 rounded-[var(--radius-sm)] bg-muted/10 border border-border flex items-center justify-center overflow-hidden">
                  <span className="text-mercury-label-caps text-clinical-muted">{userRole}</span>
               </div>
            </div>
          </div>
        </header>

        {/* ── MAIN CANVAS ───────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto min-h-0">
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
    default: "border-border text-clinical-muted bg-secondary",
    success: "border-mercury-green/20 text-mercury-green bg-mercury-green/10",
    warning: "border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/10",
    danger:  "border-destructive/20 text-destructive bg-destructive/10",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)] border text-mercury-label-caps leading-none",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
