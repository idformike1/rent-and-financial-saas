'use client'

import { useState } from 'react'
import { Search, User, Building, ArrowRight, ShieldCheck, UserMinus, ShieldAlert } from 'lucide-react'
import { Card, Badge, Button, cn } from '@/components/ui-finova'
import Link from 'next/link'

export default function TenantRegistryClient({ tenants: initialTenants }: { tenants: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTenants = initialTenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-12">
      {/* SEARCH COMMAND STRIP */}
      <Card className="p-4 bg-card border-none rounded-3xl flex items-center gap-4 group transition-all duration-500 focus-within:ring-4 focus-within:ring-brand/10">
         <Search className="w-5 h-5 text-muted-foreground ml-4 group-focus-within:text-brand transition-colors" />
         <input 
           type="text" 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           placeholder="Scan identity registry (Name or Email)..." 
           className="bg-transparent border-none text-xs font-black uppercase tracking-[0.2em] text-foreground outline-none w-full placeholder:text-muted-foreground" 
         />
         <Badge className="bg-brand text-foreground border-none mr-2 whitespace-nowrap">
           {filteredTenants.length} / {initialTenants.length} MATCHES
         </Badge>
      </Card>

      {/* CORE REGISTRY: FINOVA TABLE STANDARD */}
      <Card className="p-0 overflow-hidden border-none rounded-[2.5rem] bg-card dark:bg-card transition-all duration-700">
        {filteredTenants.length === 0 ? (
          <div className="p-32 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-rose-500/20 shadow-rose-500/10 hover:rotate-12 transition-transform">
               <ShieldAlert className="w-12 h-12 text-rose-500" />
            </div>
            <div>
               <p className="text-3xl font-black text-foreground dark:text-foreground uppercase italic tracking-tighter leading-none">Identity Signal Lost</p>
               <p className="text-muted-foreground text-[10px] mt-4 font-black tracking-[0.4em] uppercase max-w-sm mx-auto leading-relaxed">The search parameters yielded zero matches within the encrypted occupant registry.</p>
            </div>
            <Button variant="secondary" onClick={() => setSearchTerm('')} className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">Reset Scan Parameters</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted dark:bg-black/20 border-b border-border border-border">
                <tr>
                  <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Identity Protocol</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Lease Portfolio</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Risk Matrix</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Action Domain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {filteredTenants.map((tenant) => {
                  const activeLeases = (tenant.leases as any[]).filter(l => l.isActive);
                  const primaryLease = activeLeases.find(l => l.isPrimary) || activeLeases[0];
                  
                  return (
                    <tr key={tenant.id} className="hover:bg-muted dark:hover:bg-brand/5 transition-all group cursor-default">
                      <td className="px-8 py-10">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-[1.5rem] bg-card text-foreground flex items-center justify-center font-black text-2xl italic group-hover:rotate-6 transition-transform relative overflow-hidden">
                            <span className="relative z-10">{tenant.name.charAt(0)}</span>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xl font-black text-foreground dark:text-foreground uppercase italic tracking-tighter leading-none group-hover:text-brand transition-colors">{tenant.name}</span>
                            <div className="flex items-center gap-2.5">
                               <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                               <span className="text-[10px] font-bold text-muted-foreground tracking-tight truncate max-w-[200px] uppercase font-mono">{tenant.email || 'PROTOCOL_NULL'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[var(--primary-muted)]0/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20">
                             <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-lg font-black text-muted-foreground dark:text-foreground uppercase italic tracking-tighter leading-none">
                                {primaryLease?.unit.unitNumber || 'UNASSIGNED'}
                            </span>
                            <p className="text-[9px] font-black text-muted-foreground mt-1 uppercase tracking-widest leading-none line-clamp-1">{primaryLease?.unit.type || 'STAGING_NODE'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-10">
                        <div className="flex flex-col gap-3">
                           <Badge variant={activeLeases.length > 0 ? 'success' : 'default'} className="px-4 py-1.5 text-[9px] rounded-full border-none-sm">
                             {activeLeases.length > 0 ? 'SIGNAL::ACTIVE' : 'SIGNAL::RESERVED'}
                           </Badge>
                           <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">{activeLeases.length} Active Nodes</span>
                        </div>
                      </td>
                      <td className="px-8 py-10 text-right">
                        <Link href={`/tenants/${tenant.id}`}>
                           <button className="h-12 w-12 rounded-3xl bg-card dark:bg-card flex items-center justify-center text-muted-foreground group-hover:bg-brand group-hover:text-foreground transition-all ring-1 ring-border dark:ring-white/5 border-none">
                              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
