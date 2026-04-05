'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ShieldCheck, ArrowRight, Building, User } from 'lucide-react'
import { Card, Badge } from '@/components/ui-finova'

interface Tenant {
  id: string
  name: string
  email: string | null
  leases: any[]
}

export default function OccupantDirectory({ initialTenants }: { initialTenants: Tenant[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  // ── FILTER LOGIC: The "Brain" of the search ───────────────────────────────
  const filteredTenants = initialTenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tenant.email && tenant.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-12">
      {/* SEARCH COMMAND STRIP */}
      <Card className="p-1 bg-slate-900 border-none rounded-3xl flex items-center gap-4 group transition-all ring-1 ring-slate-800 focus-within:ring-brand/50">
         <Search className="w-5 h-5 text-slate-500 ml-5 group-focus-within:text-brand transition-colors" />
         <input 
           type="text" 
           placeholder="Scan identity registry (e.g. 'JACK')..." 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="bg-transparent border-none text-white text-xs font-bold uppercase tracking-widest outline-none w-full py-4 placeholder:text-zinc-700" 
         />
         <div className="flex items-center pr-2">
            <Badge className="bg-brand/20 text-brand border-brand/30 whitespace-nowrap h-8 px-4 rounded-xl font-mono">
               {filteredTenants.length} Identities Found
            </Badge>
         </div>
      </Card>

      {/* CORE REGISTRY TABLE */}
      <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-card dark:bg-slate-900">
        {filteredTenants.length === 0 ? (
          <div className="p-32 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110 border border-border dark:border-slate-800">
               <User className="w-10 h-10 text-slate-200 dark:text-slate-400" />
            </div>
            <div>
               <p className="text-2xl font-black text-foreground dark:text-white uppercase italic tracking-tighter leading-none">Identity Void</p>
               <p className="text-slate-400 text-[9px] mt-3 font-black tracking-[0.3em] uppercase">No active signals found matching your current scan parameters.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-border dark:border-slate-800">
                <tr>
                  <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Identity Protocol</th>
                  <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Lease Portfolio</th>
                  <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Risk Matrix</th>
                  <th className="px-8 py-6 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Action Domain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredTenants.map((tenant: any) => {
                  const activeLeases = (tenant.leases as any[]).filter(l => l.isActive);
                  const primaryLease = activeLeases.find(l => l.isPrimary) || activeLeases[0];
                  
                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/50 dark:hover:bg-brand/5 transition-all group">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-xl italic shadow-xl group-hover:rotate-6 transition-all border border-white/10">
                            {tenant.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-foreground dark:text-white uppercase italic tracking-tighter leading-none mb-1.5 group-hover:text-brand transition-colors">{tenant.name}</span>
                            <div className="flex items-center gap-2">
                               <ShieldCheck className="w-3 h-3 text-[var(--primary)]" />
                               <span className="text-[10px] font-bold text-slate-400 tracking-tight truncate max-w-[150px] uppercase font-mono">{tenant.email || 'PROTOCOL_NULL'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-3">
                          <Building className="w-4 h-4 text-brand" />
                          <span className="text-sm font-black text-slate-400 dark:text-slate-300 uppercase italic tracking-tighter">
                            {primaryLease?.unit.unitNumber || 'UNASSIGNED'}
                          </span>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">{activeLeases.length} ACTIVE ATOMIC LEASES</p>
                      </td>
                      <td className="px-8 py-8">
                        <Badge className={`px-4 py-1.5 text-[9px] rounded-xl border-none font-black tracking-widest ${activeLeases.length > 0 ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-slate-100 text-slate-400'}`}>
                          {activeLeases.length > 0 ? 'STATUS::ACTIVE' : 'STATUS::INACTIVE'}
                        </Badge>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <Link href={`/tenants/${tenant.id}`}>
                           <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-800 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all shadow-premium">
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                           </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
