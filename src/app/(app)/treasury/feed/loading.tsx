import React from 'react'
import { cn } from '@/lib/utils'

/**
 * MERCURY SKELETOR: TRANSACTIONS (V.3.2)
 * High-fidelity layout preservation during data hydration.
 */
const GRID_CLASS = "grid grid-cols-[32px_80px_minmax(250px,2fr)_120px_200px_180px_180px] gap-6 items-center"

export default function TransactionsLoading() {
  return (
    <div className="space-y-0 bg-background min-h-screen font-sans animate-pulse">
      
      {/* ── 1. HEADER SKELETON ───────────────────────────────────────────── */}
      <div className="pt-2 pb-6 space-y-8 bg-background">
        <div className="flex items-center justify-between">
            <div className="h-9 w-64 bg-white/[0.03] rounded-[var(--radius)]" />
            <div className="flex items-center gap-3">
               <div className="h-8 w-64 bg-white/[0.03] rounded-[var(--radius)]" />
               <div className="h-8 w-20 bg-white/[0.03] rounded-[var(--radius)]" />
            </div>
        </div>
        
        <div className="flex items-center gap-10 border-b border-white/[0.05]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pb-5 w-24">
              <div className="h-4 bg-white/[0.03] rounded w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. ANALYTICAL BLOCK SKELETON ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-0 border-b border-white/[0.05] bg-background">
         {[1, 2, 3].map((i) => (
           <div key={i} className={cn("py-10 space-y-6", i < 3 ? "border-r border-white/[0.05]" : "")}>
              <div className="space-y-2 px-0">
                 <div className="h-3 w-32 bg-white/[0.02] rounded" />
                 <div className="h-8 w-48 bg-white/[0.03] rounded" />
              </div>
           </div>
         ))}
      </div>

      {/* ── 3. TOOLBAR SKELETON ──────────────────────────────────────────── */}
      <div className="py-5 flex items-center justify-between bg-background border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
             <div className="h-8 w-32 bg-white/[0.03] rounded-[var(--radius)]" />
             <div className="h-8 w-24 bg-white/[0.03] rounded-[var(--radius)]" />
          </div>
          <div className="flex items-center gap-6">
             <div className="h-4 w-12 bg-white/[0.02] rounded" />
             <div className="h-4 w-[1px] bg-white/[0.05]" />
             <div className="h-4 w-24 bg-white/[0.02] rounded" />
             <div className="h-4 w-[1px] bg-white/[0.05]" />
             <div className="h-8 w-24 bg-white/[0.03] rounded-[var(--radius)]" />
          </div>
      </div>

      {/* ── 4. DATA STRATUM SKELETON ─────────────────────────────────────── */}
      <div className="space-y-0">
         {/* THEAD */}
         <div className={cn(GRID_CLASS, "py-3 border-b border-white/[0.05] bg-background")}>
            <div className="flex justify-center">
              <div className="w-3.5 h-3.5 bg-white/[0.05] rounded-[3px]" />
            </div>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-3 bg-white/[0.02] rounded w-16" />
            ))}
         </div>

         {/* ROWS */}
         {[...Array(15)].map((_, i) => (
           <div
             key={i}
             className={cn(GRID_CLASS, "h-[48px] border-b border-white/[0.01]")}
             style={{ opacity: 1 - (i * 0.05) }}
           >
             <div className="flex justify-center">
                <div className="w-3.5 h-3.5 bg-white/[0.02] rounded-[3px]" />
             </div>
             <div className="h-4 bg-white/[0.03] rounded w-12" />
             <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-[var(--radius)] bg-white/[0.03] shrink-0" />
                <div className="h-4 bg-white/[0.03] rounded w-48" />
             </div>
             <div className="flex justify-end pr-4">
                <div className="h-4 bg-white/[0.03] rounded w-16" />
             </div>
             <div className="h-4 bg-white/[0.02] rounded w-24 ml-6" />
             <div className="h-4 bg-white/[0.02] rounded w-24" />
             <div className="h-4 bg-white/[0.02] rounded w-24" />
           </div>
         ))}
      </div>
    </div>
  )
}
