'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LucideSearch, LucideChevronLeft, LucideChevronRight, LucideEye, LucideFilter, LucideX } from 'lucide-react'
import { SovereignSheet } from '@/src/components/ui/SovereignSheet'
import { cn } from '@/lib/utils'

interface UserOption {
  id: string
  name: string | null
  email: string
}

interface AuditFiltersProps {
  users: UserOption[]
  actions: string[]
  currentFilters: {
    page: number
    action?: string
    operator?: string
  }
}

export function AuditFilterBar({ users, actions, currentFilters }: AuditFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString())
      } else {
        params.delete(key)
      }
    })
    // Reset to page 1 on filter change
    if (!updates.page) params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
      <div className="relative flex-1 group">
        <LucideFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-brand transition-colors" />
        <select 
          value={currentFilters.action || ''}
          onChange={(e) => updateFilters({ action: e.target.value })}
          className="w-full h-11 bg-sidebar border border-border rounded-[var(--radius-sm)] pl-10 pr-4 text-[13px] text-foreground focus:border-brand/40 outline-none appearance-none"
        >
          <option value="">All Actions Protocol</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="relative flex-1 group">
        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-brand transition-colors" />
        <select 
          value={currentFilters.operator || ''}
          onChange={(e) => updateFilters({ operator: e.target.value })}
          className="w-full h-11 bg-sidebar border border-border rounded-[var(--radius-sm)] pl-10 pr-4 text-[13px] text-foreground focus:border-brand/40 outline-none appearance-none"
        >
          <option value="">All Operators</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => updateFilters({ page: Math.max(1, currentFilters.page - 1) })}
          disabled={currentFilters.page <= 1}
          className="w-10 h-11 border border-border rounded-[var(--radius-sm)] flex items-center justify-center text-foreground hover:bg-sidebar disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <LucideChevronLeft className="w-4 h-4" />
        </button>
        <div className="h-11 px-4 border border-border rounded-[var(--radius-sm)] flex items-center justify-center text-[11px] font-bold text-foreground/60 uppercase tracking-widest bg-sidebar">
          Sequence {currentFilters.page}
        </div>
        <button 
          onClick={() => updateFilters({ page: currentFilters.page + 1 })}
          className="w-10 h-11 border border-border rounded-[var(--radius-sm)] flex items-center justify-center text-foreground hover:bg-sidebar transition-colors"
        >
          <LucideChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {(currentFilters.action || currentFilters.operator || currentFilters.page > 1) && (
        <button 
          onClick={() => router.push('?')}
          className="h-11 px-4 text-[10px] font-bold uppercase tracking-widest text-destructive hover:text-destructive/80 transition-colors flex items-center gap-2"
        >
          <LucideX className="w-3 h-3" /> Reset Grid
        </button>
      )}
    </div>
  )
}

export function MetadataExplorer({ metadata, action }: { metadata: any, action: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand hover:text-brand/80 transition-colors group"
      >
        <LucideEye className="w-3 h-3 group-hover:scale-110 transition-transform" /> 
        View Payload
      </button>

      <SovereignSheet 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={`Forensic Intelligence: ${action}`}
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-sidebar/50 border border-border rounded-[var(--radius-sm)] border-l-4 border-l-brand">
            <p className="text-[10px] text-clinical-low uppercase tracking-[0.1em] mb-1">Decoded Metadata Source</p>
            <p className="text-mercury-body text-foreground">Detailed analytical signature of the mutation event.</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand/20 to-transparent rounded-[var(--radius-sm)] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <pre className="relative bg-[#020202] border border-border p-6 rounded-[var(--radius-sm)] overflow-x-auto selection:bg-brand/30">
              <code className="text-mercury-body text-brand/90 font-mono text-[13px] leading-relaxed">
                {JSON.stringify(metadata || {}, null, 2)}
              </code>
            </pre>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 border border-border rounded-[var(--radius-sm)] bg-sidebar/20">
                <p className="text-[10px] text-clinical-low uppercase tracking-widest mb-2 font-bold">Persistence</p>
                <p className="text-mercury-body text-foreground/60 leading-relaxed font-sans">
                  This payload is non-repudiable and stored in the global audit engine under sovereign jurisdiction.
                </p>
             </div>
             <div className="p-4 border border-border rounded-[var(--radius-sm)] bg-sidebar/20">
                <p className="text-[10px] text-clinical-low uppercase tracking-widest mb-2 font-bold">Traceability</p>
                <p className="text-mercury-body text-foreground/60 leading-relaxed font-sans">
                   Full audit chain maintained. Target entity and operator IDs are cross-referenced in the registry.
                </p>
             </div>
          </div>
        </div>
      </SovereignSheet>
    </>
  )
}
