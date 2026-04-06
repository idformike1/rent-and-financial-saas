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
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A919E] group-focus-within:text-white transition-colors" />
         <Input 
           type="text" 
           placeholder="Scan identity registry..." 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="pl-10" 
         />
      </div>

      {/* CORE REGISTRY TABLE */}
      <Card variant="outline" className="p-0 border-[#23252A] bg-transparent">
        {filteredTenants.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <User className="w-10 h-10 text-[#23252A] mx-auto" />
            <div>
               <p className="text-xl font-medium text-white italic tracking-tight">Identity Void</p>
               <p className="text-[#8A919E] text-[10px] mt-2 uppercase tracking-widest leading-relaxed">No active signals found matching your current scan parameters.</p>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
              <thead className="border-b border-[#23252A]">
                <tr className="bg-transparent">
                  <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A]">Identity Protocol</th>
                  <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A]">Lease Portfolio</th>
                  <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A]">Status Flag</th>
                  <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A] text-right">Domain Access</th>
                </tr>
              </thead>
              <tbody className="divide-none">
                {filteredTenants.map((tenant: any) => {
                  const activeLeases = (tenant.leases as any[]).filter(l => l.isActive);
                  const primaryLease = activeLeases.find(l => l.isPrimary) || activeLeases[0];
                  
                  return (
                    <tr key={tenant.id} className="border-b border-[#23252A] hover:bg-[#14161A] group transition-none cursor-pointer">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-[4px] bg-[#1A1D24] border border-[#23252A] text-white flex items-center justify-center font-bold text-sm">
                            {tenant.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white tracking-tight">{tenant.name}</span>
                            <span className="text-[10px] text-[#8A919E] uppercase tracking-wider font-mono">{tenant.email || 'PROTOCOL_NULL'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-[#8A919E]" />
                          <span className="text-sm font-medium text-white">
                            {primaryLease?.unit.unitNumber || 'UNASSIGNED'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8A919E] mt-1 uppercase tracking-widest">{activeLeases.length} ACTIVE</p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={activeLeases.length > 0 ? 'success' : 'default'} className="lowercase text-[10px]">
                           {activeLeases.length > 0 ? 'active' : 'inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link href={`/tenants/${tenant.id}`} onClick={(e) => e.stopPropagation()}>
                           <button className="h-8 w-8 rounded-[4px] border border-[#23252A] flex items-center justify-center text-[#8A919E] hover:text-white hover:bg-[#23252A] transition-none">
                              <ArrowRight className="w-3.5 h-3.5" />
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
