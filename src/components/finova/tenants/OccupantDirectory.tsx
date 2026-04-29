'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, Building, User } from 'lucide-react'
import { Badge, Input, Button } from '@/src/components/finova/ui-finova'
import { Card } from '@/src/components/system/Card'

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
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clinical-muted group-focus-within:text-primary transition-colors" />
         <Input 
           type="text" 
           placeholder="Search identity registry..." 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="pl-10 h-10 rounded-[var(--radius-sm)] text-mercury-body" 
         />
      </div>

      {/* CORE REGISTRY TABLE */}
      <div className="bg-card border border-border rounded-[var(--radius-sm)] overflow-hidden">
        {filteredTenants.length === 0 ? (
          <div className="p-20 text-center space-y-4 bg-card">
            <User className="w-10 h-10 text-border mx-auto" />
            <div>
               <p className="text-mercury-headline text-foreground">Identity Void</p>
               <p className="text-clinical-muted text-mercury-body mt-2">No active signals found matching your current search parameters.</p>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-mercury-label-caps text-clinical-muted">Identity Protocol</th>
                  <th className="px-4 py-3 text-mercury-label-caps text-clinical-muted">Lease Portfolio</th>
                  <th className="px-4 py-3 text-mercury-label-caps text-clinical-muted">Status Flag</th>
                  <th className="px-4 py-3 text-mercury-label-caps text-clinical-muted text-right">Domain Access</th>
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
                          <div className="h-10 w-10 rounded-[var(--radius-sm)] bg-muted border border-border text-foreground flex items-center justify-center font-bold text-mercury-body">
                            {tenant.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-mercury-heading text-foreground">{tenant.name}</span>
                            <span className="text-mercury-label-caps text-clinical-muted">{tenant.email || 'PROTOCOL_NULL'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-clinical-muted" />
                          <span className="text-mercury-heading text-foreground">
                            {primaryLease?.unit.unitNumber || 'UNASSIGNED'}
                          </span>
                        </div>
                        <p className="text-mercury-label-caps text-clinical-muted mt-1">{activeLeases.length} ACTIVE</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={activeLeases.length > 0 ? 'success' : 'default'} className="text-[10px] font-bold">
                           {activeLeases.length > 0 ? 'active' : 'inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/tenants/${tenant.id}`} onClick={(e) => e.stopPropagation()}>
                           <Button type="button" variant="secondary" disabled={false} className="h-9 w-9 p-0 rounded-[var(--radius-sm)] border border-border flex items-center justify-center text-clinical-muted hover:text-foreground hover:bg-muted transition-none">
                              <ArrowRight className="w-4 h-4" />
                           </Button>
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
