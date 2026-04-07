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
            <thead>
              <tr className="border-b border-[#2A2D35] bg-[#1C1F26]/30 h-[35px]">
                <th className="text-[11px] font-medium text-muted-foreground px-3 text-left">Identity</th>
                <th className="text-[11px] font-medium text-muted-foreground px-3 text-left">Unit capacity</th>
                <th className="text-[11px] font-medium text-muted-foreground px-3 text-left">Status profile</th>
                <th className="text-[11px] font-medium text-muted-foreground px-3 text-left">Financial health</th>
                <th className="text-[11px] font-medium text-muted-foreground px-3 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2D35]">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="h-[38px] group hover:bg-[#1C1F26] transition-colors">
                    <td className="px-3 text-[12px] font-medium text-foreground">
                      {tenant.name}
                    </td>
                    <td className="px-3">
                      <span className="text-[12px] text-muted-foreground font-medium">
                        {tenant.units?.[0]?.property?.name || 'Unassigned'} Unit {tenant.units?.[0]?.unitNumber}
                      </span>
                    </td>
                    <td className="px-3">
                      <Badge variant={tenant.isActive ? "success" : "danger"} className="text-[10px] py-0 px-2 font-medium rounded-full">
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-3">
                      <div className="flex items-center gap-2">
                         <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[95%]" />
                         </div>
                         <span className="text-[10px] font-bold text-emerald-500">95%</span>
                      </div>
                    </td>
                    <td className="px-3 text-right">
                      <Link href={`/tenants/${tenant.id}`}>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
