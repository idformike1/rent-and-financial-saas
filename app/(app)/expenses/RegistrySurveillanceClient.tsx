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
import { Card, Badge, Button } from '@/components/ui-finova'

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
    <div className="space-y-6">
      
      {/* GLOBAL TELEMETRY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 space-y-1">
           <span className="text-[12px] font-bold text-muted-foreground  tracking-widest">Global Net Outflow</span>
           <div className={cn("text-[28px] font-[380] font-finance tabular-nums leading-none", netPosition < 0 ? "text-rose-600" : "text-emerald-600")}>
              ${Math.abs(netPosition).toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </div>
        </Card>
        <Card className="p-5 space-y-1 bg-muted/30">
           <span className="text-[12px] font-bold text-muted-foreground  tracking-widest">Aggregate Inflow</span>
           <div className="text-[20px] font-bold font-finance tabular-nums text-emerald-600">
              +${totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </div>
        </Card>
        <Card className="p-5 space-y-1 bg-muted/30">
           <span className="text-[12px] font-bold text-muted-foreground  tracking-widest">Aggregate Outflow</span>
           <div className="text-[20px] font-bold font-finance tabular-nums text-rose-600">
              -${totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </div>
        </Card>
      </div>

      {/* REGISTRY TERMINAL HEADER */}
      <Card className="p-2 flex items-center gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors" />
          <input 
            type="text" 
            placeholder="Search registry records..."
            className="w-full bg-transparent h-10 pl-10 pr-4 text-[13px] text-foreground placeholder-muted-foreground outline-none border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
           <Badge variant="brand" className="h-8 flex items-center font-bold">
              {filtered.length} MATCHES
           </Badge>
        </div>
      </Card>

      {/* THE REGISTRY TABLE */}
      <Card className="p-0 overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 text-[10px] text-muted-foreground  tracking-widest border-b border-border">
              <tr>
                <th className="px-5 py-3 font-bold">Execution Date</th>
                <th className="px-5 py-3 font-bold">Payee / Entity</th>
                <th className="px-5 py-3 font-bold">Description</th>
                <th className="px-5 py-3 font-bold">Categorization</th>
                <th className="px-5 py-3 font-bold">Asset Scope</th>
                <th className="px-5 py-3 font-bold text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-muted/50 transition-colors h-[52px]">
                  <td className="px-5">
                    <span className="text-[12px] text-muted-foreground font-finance">
                      {new Date(entry.transactionDate || entry.date).toISOString().split('T')[0]}
                    </span>
                  </td>
                  <td className="px-5">
                    <span className="text-[14px] font-bold text-foreground">
                       {entry.payee || "INTERNAL_TRANSFER"}
                    </span>
                  </td>
                  <td className="px-5">
                    <span className="text-[13px] text-muted-foreground truncate max-w-[200px] block">
                       {entry.description || "N/A"}
                    </span>
                  </td>
                  <td className="px-5">
                    <Badge variant="default" className="bg-muted text-muted-foreground border-none">
                      {entry.expenseCategory?.name || "UNCLASSIFIED"}
                    </Badge>
                  </td>
                  <td className="px-5">
                    {entry.propertyId ? (
                      <Link 
                        href={`/properties/${entry.propertyId}`}
                        className="flex items-center gap-2 text-primary hover:underline transition-all"
                      >
                         <Building2 className="w-3.5 h-3.5 opacity-60" />
                         <span className="text-[12px] truncate max-w-[120px]">
                            {entry.property?.name}
                         </span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 opacity-40">
                         <Layers className="w-3.5 h-3.5" />
                         <span className="text-[11px] ">
                            CORPORATE
                         </span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 text-right">
                    <span className={cn(
                      "text-[14px] font-bold font-finance tabular-nums",
                      Number(entry.amount) < 0 ? "text-rose-600" : "text-emerald-600"
                    )}>
                      {Number(entry.amount) < 0 ? '-' : '+'}${Math.abs(Number(entry.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
               <FileText className="w-12 h-12 mb-4 opacity-20" />
               <span className="text-[12px]  tracking-widest font-bold">No Transaction Data</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
