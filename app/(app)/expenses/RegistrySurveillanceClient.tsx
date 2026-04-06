'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Building2, 
  Layers, 
  ExternalLink, 
  ArrowRight, 
  Menu,
  FileText,
  Filter,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RegistryTableProps {
  entries: any[]
}

export default function RegistrySurveillanceClient({ entries }: RegistryTableProps) {
  const [search, setSearch] = useState('')

  const filtered = entries.filter((e: any) => {
    const term = search.toLowerCase()
    return (
      e.payee?.toLowerCase().includes(term) ||
      e.description?.toLowerCase().includes(term) ||
      e.expenseCategory?.name?.toLowerCase().includes(term) ||
      e.property?.name?.toLowerCase().includes(term)
    )
  })

  const EXCLUSION_KEYWORDS = ['TRANSFER', 'INTERNAL', 'REFUND'];
  
  const isExcluded = (e: any) => {
    const desc = (e.description || '').toUpperCase();
    return EXCLUSION_KEYWORDS.some(kw => desc.includes(kw));
  };

  const totalInflow = entries
    .filter(e => e.account?.category === 'INCOME' && Number(e.amount) > 0 && !isExcluded(e))
    .reduce((sum, e) => sum + Number(e.amount), 0)
    
  const totalOutflow = entries
    .filter(e => e.account?.category === 'EXPENSE' && Number(e.amount) < 0 && !isExcluded(e))
    .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0)
    
  const netPosition = totalInflow - totalOutflow

  return (
    <div className="space-y-12">
      
      {/* GLOBAL TELEMETRY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border bg-card overflow-hidden rounded-xl divide-x divide-white/10">
        <div className="p-8 space-y-4">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Global Net Outflow</span>
           <div className={cn("text-4xl font-mono tracking-tighter font-finance tabular-nums", netPosition < 0 ? "text-rose-500" : "text-emerald-500")}>
              ${Math.abs(netPosition).toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </div>
        </div>
        <div className="p-8 space-y-4 opacity-50">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Volume: Inflow</span>
           <div className="text-2xl font-mono text-emerald-400 font-finance tabular-nums">
              +${totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </div>
        </div>
        <div className="p-8 space-y-4 opacity-50">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Volume: Outflow</span>
           <div className="text-2xl font-mono text-rose-400 font-finance tabular-nums">
              -${totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </div>
        </div>
      </div>

      {/* REGISTRY TERMINAL HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="FILTER SURVEILLANCE DATA..."
            className="w-full bg-card border border-border h-12 pl-12 pr-4 text-[10px] font-mono text-foreground placeholder-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus:border-emerald-500/50 transition-all uppercase tracking-widest"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
           <div className="h-12 px-6 bg-background border border-white/5 flex items-center gap-4 text-[9px] font-black tracking-widest text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>MATCHED_RECORDS:</span>
              <span className="text-emerald-500 font-mono italic">{filtered.length.toString().padStart(3, '0')}</span>
           </div>
        </div>
      </div>

      {/* THE REGISTRY TABLE */}
      <div className="border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-background/50 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-border">
              <tr>
                <th className="px-6 py-5 font-black border-r border-border">Date</th>
                <th className="px-6 py-5 font-black border-r border-border">Entity/Payee</th>
                <th className="px-6 py-5 font-black border-r border-border">Description</th>
                <th className="px-6 py-5 font-black border-r border-border">Category</th>
                <th className="px-6 py-5 font-black border-r border-border">Scope</th>
                <th className="px-6 py-5 font-black text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-card/[0.02] transition-all group">
                  <td className="px-6 py-4 border-r border-white/5">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(entry.transactionDate || entry.date).toISOString().split('T')[0]}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-r border-white/5">
                    <span className="text-[11px] font-bold text-foreground uppercase italic tracking-tight">
                       {entry.payee || "INTERNAL_TRANSFER"}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-r border-white/5 relative group/desc">
                    <span className="text-[10px] text-slate-400 capitalize truncate max-w-[200px] block">
                       {entry.description || "N/A"}
                    </span>
                    {entry.description && entry.description.length > 20 && (
                      <div className="absolute left-6 top-0 -translate-y-full mb-2 hidden group-hover/desc:block z-50 bg-slate-900 border border-border p-3 rounded-xl shadow-2xl text-[10px] text-foreground w-[300px] pointer-events-none animate-in fade-in slide-in-from-bottom-2">
                        <p className="font-mono text-slate-500 uppercase tracking-widest text-[8px] mb-2 font-black">SURVEILLANCE_DETAIL</p>
                        {entry.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 border-r border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                         {entry.expenseCategory?.name || "UNCLASSIFIED"}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-white/5">
                    {entry.propertyId ? (
                      <Link 
                        href={`/properties/${entry.propertyId}`}
                        className="flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)] transition-colors group/link"
                      >
                         <Building2 className="w-3.5 h-3.5 opacity-50 group-hover/link:opacity-100" />
                         <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[120px]">
                            {entry.property?.name}
                         </span>
                         <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/link:opacity-40 transition-opacity" />
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 opacity-40 grayscale">
                         <Layers className="w-3.5 h-3.5" />
                         <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest font-mono">
                            CORPORATE/GENERAL
                         </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "text-[13px] font-mono font-bold font-finance tabular-nums italic tracking-tighter",
                      Number(entry.amount) < 0 ? "text-rose-500" : "text-emerald-400"
                    )}>
                      {Number(entry.amount) < 0 ? '-' : '+'}${Math.abs(Number(entry.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center opacity-20">
               <FileText className="w-12 h-12 mb-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Surveillance Data Found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
