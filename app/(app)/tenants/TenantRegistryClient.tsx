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
    <div className="space-y-6">
      {/* SEARCH COMMAND STRIP */}
      <Card className="p-2 flex items-center gap-2 focus-within:border-primary transition-all">
         <Search className="w-4 h-4 text-muted-foreground ml-2" />
         <input 
           type="text" 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           placeholder="Scan identity registry..." 
           className="bg-transparent border-none text-[13px] text-foreground outline-none w-full placeholder:text-muted-foreground h-10" 
         />
         <Badge variant="brand" className="mr-2">
           {filteredTenants.length} / {initialTenants.length} MATCHES
         </Badge>
      </Card>

      {/* CORE REGISTRY */}
      <Card className="p-0 overflow-hidden border border-border bg-card shadow-none">
        {filteredTenants.length === 0 ? (
          <div className="p-12 text-center space-y-4">
             <p className="text-display font-weight-display text-foreground">Identity Signal Lost</p>
             <p className="text-muted-foreground text-[15px] max-w-sm mx-auto">Zero matches found in the encrypted occupant registry.</p>
             <Button variant="secondary" onClick={() => setSearchTerm('')}>Reset Scan</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#1C1F26]/30 text-[12px] text-muted-foreground font-medium border-b border-border h-[35px]">
                <tr>
                  <th className="px-[22px]">Identity Protocol</th>
                  <th className="px-[22px]">Lease Portfolio</th>
                  <th className="px-[22px]">Risk Matrix</th>
                  <th className="px-[22px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTenants.map((tenant) => {
                  const activeLeases = (tenant.leases as any[]).filter(l => l.isActive);
                  const primaryLease = activeLeases.find(l => l.isPrimary) || activeLeases[0];
                  
                  return (
                    <tr key={tenant.id} className="hover:bg-[#1C1F26] transition-none h-[38px] group">
                      <td className="px-[22px]">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-[4px] bg-muted text-foreground flex items-center justify-center text-[10px] font-bold">
                            {tenant.name.charAt(0)}
                          </div>
                          <div className="flex flex-col leading-none">
                            <span className="text-[13px] text-foreground font-medium">{tenant.name}</span>
                            <span className="text-[11px] text-muted-foreground">{tenant.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-[22px]">
                        <div className="flex flex-col leading-none">
                          <span className="text-[12px] text-foreground font-medium">{primaryLease?.unit.unitNumber || 'Unassigned'}</span>
                          <span className="text-[10px] text-muted-foreground">{primaryLease?.unit.type || 'Standard'}</span>
                        </div>
                      </td>
                      <td className="px-[22px]">
                         <Badge variant={activeLeases.length > 0 ? 'success' : 'default'} className="font-medium">
                           {activeLeases.length > 0 ? 'Active' : 'Reserved'}
                         </Badge>
                      </td>
                      <td className="px-[22px] text-right">
                        <Link href={`/tenants/${tenant.id}`}>
                           <Button variant="secondary" size="sm" className="h-7 w-7 p-0 rounded-full">
                              <ArrowRight className="w-3.5 h-3.5" />
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
      </Card>
    </div>
  )
}
