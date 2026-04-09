'use client'

import { useState } from 'react'
import { Search, User, Building, ArrowRight, ShieldCheck, UserMinus, ShieldAlert } from 'lucide-react'
import { Card, Badge, Button, cn, MercuryTable, THead, TBody, TR, TD } from '@/components/ui-finova'
import Link from 'next/link'

export default function TenantRegistryClient({ tenants: initialTenants }: { tenants: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTenants = initialTenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* CORE REGISTRY CARD (Integrated) */}
      <div className="mercury-card w-full overflow-hidden">
        
        {/* TACTICAL FILTER STRIP (Inside the Card) */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-white/[0.02]">
           <div className="flex items-center gap-2 flex-1">
              <Search className="w-[14px] h-[14px] text-muted-foreground/30" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find in registry (Keyword)..." 
                className="bg-transparent border-none text-[13px] text-foreground outline-none w-full max-w-[300px] placeholder:text-muted-foreground/20 h-6 font-[380] tracking-tight" 
              />
           </div>
           <div className="flex items-center gap-2">
              <div className="text-[11px] font-bold text-muted-foreground/40 tracking-tight px-3 py-1 bg-white/5 rounded-full border border-white/5 flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3 opacity-40" />
                 {filteredTenants.length} Synchronized
              </div>
           </div>
        </div>

        {filteredTenants.length === 0 ? (
          <div className="p-12 text-center space-y-4">
             <p className="text-display font-display text-foreground">Identity Signal Lost</p>
             <p className="text-muted-foreground text-[15px] max-w-sm mx-auto">Zero matches found in the encrypted occupant registry.</p>
             <Button variant="secondary" size="sm" onClick={() => setSearchTerm('')}>Reset Scan</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <MercuryTable>
              <THead>
                <TR isHeader>
                  <TD isHeader className="w-[40px]">
                    <div className="w-[18px] h-[18px] border border-white/[0.2] rounded-[4px]" />
                  </TD>
                  <TD isHeader className="w-[100px]">Date</TD>
                  <TD isHeader>Entity</TD>
                  <TD isHeader>Unit / Capacity</TD>
                  <TD isHeader>Status Profile</TD>
                  <TD isHeader className="text-right">Risk Score</TD>
                </TR>
              </THead>
              <TBody>
                {filteredTenants.map((tenant) => (
                  <TR key={tenant.id}>
                    <TD className="w-[40px]">
                       <div className="w-[18px] h-[18px] border border-white/[0.1] rounded-[4px]" />
                    </TD>
                    <TD variant="date" className="w-[100px]">
                       {"Apr 7"}
                    </TD>
                    <TD>
                      <Link href={`/tenants/${tenant.id}`} className="flex items-center gap-3 group/name hover:opacity-80 transition-opacity cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[11px] text-foreground/40 font-bold shrink-0 group-hover/name:border-white/20 transition-all">
                          {tenant.name.charAt(0)}
                        </div>
                        <span className="font-[380] tracking-tight border-b border-transparent group-hover/name:border-white/20">{tenant.name}</span>
                      </Link>
                    </TD>
                    <TD>
                      <span className="text-muted-foreground/60 font-[380] tracking-tight">
                        {tenant.units?.[0]?.property?.name || 'Unassigned'} / {tenant.units?.[0]?.unitNumber}
                      </span>
                    </TD>
                    <TD>
                      <Badge variant={tenant.isActive ? "success" : "danger"} className="p-0 px-2 font-bold desaturate scale-90 origin-left">
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                       <span className="text-[#37CC73] font-bold">95%</span>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </MercuryTable>
          </div>
        )}
      </div>
    </div>
  )
}
