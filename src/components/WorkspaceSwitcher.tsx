'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { switchWorkspaceAction } from "@/src/actions/workspace.actions"
import { cn } from "@/lib/utils"
import { ChevronDown, Building2 } from "lucide-react"

/**
 * WORKSPACE SWITCHER (MERCURY UI P4)
 * 
 * Clinical, high-density component for navigating between organizational 
 * domain spaces without full session re-authentication.
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
      const result = await switchWorkspaceAction(id)
      if (result.success) {
        setIsOpen(false)
        router.refresh()
      }
    })
  }

  if (!organizations || organizations.length <= 1) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-2 px-3 h-9 rounded-[var(--radius-sm)] border border-border bg-sidebar-accent/50 hover:bg-sidebar-accent transition-all duration-200 group text-foreground",
          isPending && "opacity-50 cursor-not-allowed"
        )}
      >
        <Building2 className="w-4 h-4 text-clinical-muted group-hover:text-foreground shrink-0" />
        <span className="text-mercury-label-caps truncate max-w-[120px]">
          {activeOrg?.name || "Select Workspace"}
        </span>
        <ChevronDown className={cn("w-3 h-3 text-clinical-muted transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-[220px] bg-card border border-border rounded-[var(--radius-sm)] shadow-clinical py-1 z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1.5 border-b border-border">
              <span className="text-[10px] uppercase tracking-widest text-clinical-muted font-semibold">
                Workspaces
              </span>
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSwitch(org.id)}
                  className={cn(
                    "w-full flex flex-col items-start px-3 py-2 text-left hover:bg-sidebar-accent transition-colors group",
                    org.id === activeId && "bg-sidebar-accent/30"
                  )}
                >
                  <span className={cn(
                    "text-mercury-label-caps truncate w-full",
                    org.id === activeId ? "text-foreground font-semibold" : "text-clinical-muted group-hover:text-foreground"
                  )}>
                    {org.name}
                  </span>
                  <span className="text-[9px] text-clinical-muted/60 uppercase tracking-tighter">
                    ID: {org.id.slice(0, 8)}...
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
