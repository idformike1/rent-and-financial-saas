'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { switchActiveOrganization } from "@/src/actions/workspace.actions"
import { cn } from "@/lib/utils"
import { ChevronDown, Building2 } from "lucide-react"

/**
 * MASTER KEY: WORKSPACE SWITCHER (PHASE 11)
 * 
 * Dynamic silo-detection UI that adapts to the user's organizational context.
 * Features a "Clinical / Organic Luxury" aesthetic with glassmorphic depth.
 */

interface Workspace {
  id: string
  name: string
}

interface WorkspaceSwitcherProps {
  organizations: Workspace[]
  activeId?: string
}

export default function WorkspaceSwitcher({ organizations, activeId }: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const activeOrg = organizations.find(o => o.id === activeId) || organizations[0]

  const handleSwitch = (id: string) => {
    if (id === activeId) return
    
    startTransition(async () => {
      try {
        const result = await switchActiveOrganization(id) as any
        // If the action redirects or succeeds, we refresh the UI
        if (result?.success || !result?.error) {
            setIsOpen(false)
            router.refresh()
        }
      } catch (err) {
        console.error('[WORKSPACE_SWITCH_UI_ERROR]', err)
      }
    })
  }

  // ── 1. SILO-DETECTION LOGIC ───────────────────────────────────────────
  if (!organizations || organizations.length === 0) return null

  // If only one silo exists, display the identity label without a dropdown
  if (organizations.length === 1) {
    return (
      <div className="flex items-center gap-3 px-3 h-9 rounded-[var(--radius-sm)] border border-transparent bg-transparent text-clinical-muted">
        <div className="w-2 h-2 rounded-full bg-amber-500/40 animate-pulse" />
        <span className="text-mercury-label-caps truncate max-w-[150px] font-medium tracking-wider">
          {activeOrg?.name}
        </span>
      </div>
    )
  }

  // ── 2. MULTI-SILO INTERFACE (DROPDOWN) ───────────────────────────────
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-2 px-3 h-9 rounded-[var(--radius-sm)] border border-border bg-sidebar-accent/30 hover:bg-sidebar-accent/60 backdrop-blur-md transition-all duration-300 group text-foreground shadow-sm",
          isPending && "opacity-50 cursor-not-allowed",
          isOpen && "border-amber-500/50 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
        )}
      >
        <Building2 className={cn(
          "w-4 h-4 text-clinical-muted group-hover:text-amber-500 shrink-0 transition-colors",
          isOpen && "text-amber-500"
        )} />
        <span className="text-mercury-label-caps truncate max-w-[120px] font-medium tracking-tight">
          {activeOrg?.name || "Select Workspace"}
        </span>
        <ChevronDown className={cn(
          "w-3 h-3 text-clinical-muted transition-transform duration-300", 
          isOpen && "rotate-180 text-amber-500"
        )} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown Container */}
          <div className="absolute top-full left-0 mt-2 w-[240px] bg-black/80 border border-white/10 rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-white/5 mb-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
                Available Silos
              </span>
            </div>
            
            <div className="max-h-[320px] overflow-y-auto custom-scrollbar px-1">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSwitch(org.id)}
                  className={cn(
                    "w-full flex flex-col items-start px-3 py-2.5 rounded-lg text-left hover:bg-white/5 transition-all group relative overflow-hidden",
                    org.id === activeId && "bg-white/5"
                  )}
                >
                  {org.id === activeId && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-amber-500 rounded-r-full" />
                  )}
                  
                  <div className="flex items-center justify-between w-full">
                    <span className={cn(
                      "text-mercury-label-caps truncate transition-colors",
                      org.id === activeId ? "text-amber-500 font-bold" : "text-white/60 group-hover:text-white"
                    )}>
                      {org.name}
                    </span>
                    {org.id === activeId && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    )}
                  </div>
                  
                  <span className="text-[9px] text-white/10 uppercase font-mono tracking-tighter mt-0.5">
                    Identity: {org.id.slice(0, 8)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
