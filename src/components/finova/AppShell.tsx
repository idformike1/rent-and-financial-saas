'use client'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GlobalSearch from './GlobalSearch'
import WorkspaceSwitcher from '@/src/components/Navigation/WorkspaceSwitcher'
import { cn } from '@/lib/utils'
import DynamicSidebar from '@/src/components/Navigation/DynamicSidebar'
import { Menu, X, LogOut, ChevronDown, PanelLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/src/components/finova/ui/popover'






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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['Treasury', 'Command', 'Intelligence hub', 'Governance control'])

  const pathname = usePathname()


  // ── AUTH ISOLATION GUARD ─────────────────────────────────────────────
  if (pathname === '/login' || pathname === '/onboarding') return <div className="w-full h-screen">{children}</div>;

  const onSignOut = () => signOut({ callbackUrl: '/login' });

  const userMenu = (
    <UserAccountMenu 
      userName={userName} 
      userRole={userRole} 
      onSignOut={onSignOut} 
    />
  );

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden font-sans selection:bg-primary/10 text-foreground">
      
      {/* ── MOBILE TOP BAR ─────────────────────────────────────────────────── */}
      <header className="md:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-background z-40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-[20px] h-[20px] bg-foreground rounded-[var(--radius-sm)] flex items-center justify-center">
             <span className="text-mercury-label-caps text-background">M</span>
          </div>
          <h2 className="text-mercury-heading text-foreground">Mercury</h2>
        </div>
        <div className="flex items-center gap-4">
          {userMenu}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-clinical-muted hover:text-foreground transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* ── MOBILE BACKDROP ───────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR (RESPONSIVE) ─────────────────────────────────────────── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border flex flex-col transform transition-all duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        isSidebarCollapsed ? "md:w-16" : "md:w-64"
      )}>

        {/* Brand bar (Responsive: hidden on tablet rail) */}
        <div className={cn(
          "h-14 flex items-center px-4 border-b border-border shrink-0 transition-all duration-300",
          isSidebarCollapsed ? "md:justify-center md:px-0" : "md:justify-start"
        )}>
          <div className="flex items-center gap-2">
            <div className="w-[20px] h-[20px] bg-foreground rounded-[var(--radius-sm)] flex items-center justify-center shrink-0">
               <span className="text-mercury-label-caps text-background">M</span>
            </div>
            <h2 className={cn(
              "text-mercury-heading text-foreground transition-all duration-300",
              isSidebarCollapsed ? "md:hidden" : "md:block lg:block"
            )}>
              Mercury
            </h2>
          </div>
          
          {/* Close button (Mobile only) */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="ml-auto p-1 text-clinical-muted hover:text-foreground md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── FLOATING TOGGLE BUTTON (Desktop/Tablet) ────────────────────── */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute top-4 -right-3 z-[60] w-6 h-6 rounded-full border border-border bg-background items-center justify-center shadow-sm hover:bg-white/[0.05] hover:border-white/20 text-clinical-muted hover:text-white transition-all duration-300 group"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ChevronLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
          )}
        </button>

        {/* Navigation Content (Context-Aware) */}
        <div className={cn(
          "flex-1 transition-all duration-300",
          isSidebarCollapsed ? "overflow-visible" : "overflow-hidden"
        )}>
          <DynamicSidebar 
            onMobileClose={() => setIsMobileMenuOpen(false)}
            activeModule={activeModule}
            isCollapsed={isSidebarCollapsed}
          />
        </div>

        {/* ── SIDEBAR FOOTER (AUDIT STATUS) ───────────────────────────────── */}
        <div className={cn(
          "mt-auto p-3 flex items-center justify-center transition-all duration-300",
          isSidebarCollapsed ? "bg-transparent border-none py-4" : "bg-card border-t border-border"
        )}>
           <div className="flex items-center gap-2 text-[10px] text-clinical-muted font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className={cn(
                "transition-all duration-300",
                isSidebarCollapsed ? "md:hidden" : "md:block lg:block"
              )}>Integrity: Validated</span>
           </div>
        </div>
      </aside>






      {/* ── MAIN COLUMN ─────────────────────────────────────────────────────── */}
      <div className="flex-1 h-screen overflow-hidden flex flex-col bg-background">


        {/* ── TOP BAR / HEADER (CENTERED SEARCH SYNC) ────────────────────────── */}
        <header className="hidden md:flex sticky top-0 z-40 w-full h-[56px] items-center bg-background border-b border-border shrink-0">

          <div className="w-full max-w-[1440px] mx-auto px-8 flex items-center">
            <div className="flex-1 flex items-center justify-center">
               <GlobalSearch />
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
               {workspaceSwitcher}
               <div className="px-3 py-1 rounded-[var(--radius-sm)] bg-muted/10 border border-border flex items-center justify-center overflow-hidden">
                  <span className="text-mercury-label-caps text-clinical-muted">{userRole}</span>
               </div>
               {userMenu}
            </div>
          </div>
        </header>


        {/* ── MAIN CANVAS ───────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-8 pb-16">
            {children}
          </div>
        </main>
      </div>

    </div>
  )
}

function UserAccountMenu({ userName, userRole, onSignOut }: { userName: string, userRole: string, onSignOut: () => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-muted/10 p-1 rounded-[var(--radius-sm)] transition-all group outline-none">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-foreground text-background flex items-center justify-center text-mercury-label-caps shrink-0 group-hover:scale-105 transition-transform">
            {userName.charAt(0)}
          </div>
          <ChevronDown size={14} className="text-clinical-muted group-hover:text-foreground transition-colors" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 mt-2" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-mercury-label-caps text-foreground truncate">{userName}</p>
            <p className="text-[10px] text-clinical-muted uppercase tracking-widest font-bold">{userRole}</p>
          </div>
          <div className="h-px bg-border/50 -mx-4" />
          <div className="space-y-1">
            <button 
              onClick={onSignOut}
              className="flex items-center w-full gap-3 px-2 py-2 rounded-[var(--radius-sm)] text-clinical-muted hover:text-red-500 hover:bg-red-500/5 transition-all group"
            >
              <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
              <span className="text-mercury-body">Sign Out</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
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
