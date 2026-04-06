'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, Building, User } from 'lucide-react'
import { Card, Badge, Input } from '@/components/ui-finova'

interface Tenant {
  id: string
  name: string
  email: string | null
  leases: any[]
}

export default function OccupantDirectory({ initialTenants }: { initialTenants: Tenant[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTenants = initialTenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tenant.email && tenant.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-8">
      {/* SEARCH COMMAND STRIP */}
      <div className="relative group max-w-sm">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
         <Input 
           type="text" 
           placeholder="Search identity registry..." 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="pl-10 h-10" 
         />
      </div>

      {/* CORE REGISTRY TABLE */}
      <div className="bg-card border border-border rounded-[8px] overflow-hidden">
        {filteredTenants.length === 0 ? (
          <div className="p-20 text-center space-y-4 bg-card">
            <User className="w-10 h-10 text-border mx-auto" />
            <div>
               <p className="text-xl font-bold text-foreground tracking-tight">Identity Void</p>
               <p className="text-muted-foreground text-[11px] mt-2 uppercase tracking-widest leading-relaxed font-bold">No active signals found matching your current search parameters.</p>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Identity Protocol</th>
                  <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Lease Portfolio</th>
                  <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Status Flag</th>
                  <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase tracking-widest text-right">Domain Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTenants.map((tenant: any) => {
                  const activeLeases = (tenant.leases as any[]).filter(l => l.isActive);
                  const primaryLease = activeLeases.find(l => l.isPrimary) || activeLeases[0];
                  
                  return (
                    <tr key={tenant.id} className="h-[64px] hover:bg-foreground/[0.02] group transition-none cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-[6px] bg-muted border border-border text-foreground flex items-center justify-center font-bold text-sm">
                            {tenant.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-foreground tracking-tight">{tenant.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{tenant.email || 'PROTOCOL_NULL'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-bold text-foreground">
                            {primaryLease?.unit.unitNumber || 'UNASSIGNED'}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">{activeLeases.length} ACTIVE</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={activeLeases.length > 0 ? 'success' : 'default'} className="text-[10px] font-bold">
                           {activeLeases.length > 0 ? 'active' : 'inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/tenants/${tenant.id}`} onClick={(e) => e.stopPropagation()}>
                           <button className="h-9 w-9 rounded-[8px] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-none">
                              <ArrowRight className="w-4 h-4" />
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
      </div>
    </div>
  )
}
