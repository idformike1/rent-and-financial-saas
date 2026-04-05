'use client'

import { useSession } from 'next-auth/react'
import { Card, Label, Input, Button, Badge } from '@/components/ui-finova'
import { Lock, ShieldCheck, Landmark, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'MANAGER'
  const isSovereign = ['ADMIN', 'OWNER'].includes(userRole)

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <div>
           <Badge variant="brand" className="mb-4">System Governance</Badge>
           <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Master Settings</h1>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Corporate Treasury & Identity Logic</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Treasury Configuration */}
        <div className="space-y-6 relative">
          <div className="flex items-center gap-3 mb-2">
            <Landmark className="w-4 h-4 text-brand" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Master Bank Account</h3>
          </div>

          <Card className={cn("relative overflow-hidden", !isSovereign && "opacity-80")}>
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label>Bank Institution Name</Label>
                  <Input placeholder="e.g. Gotham National Bank" defaultValue="Central Reserve Capital" disabled={!isSovereign} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Account Number (Physical)</Label>
                  <Input placeholder="XXXX-XXXX-XXXX" defaultValue="8849-1120-9932" disabled={!isSovereign} />
                </div>
                <div>
                  <Label>Routing Transit Number</Label>
                  <Input placeholder="000 000 000" defaultValue="122105278" disabled={!isSovereign} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 <div>
                    <Label>International SWIFT/BIC</Label>
                    <Input placeholder="BIC Code" defaultValue="GOTHUS33XXX" disabled={!isSovereign} />
                 </div>
              </div>

              <Button className="w-full h-16" disabled={!isSovereign}>
                <Save className="w-4 h-4 mr-3" />
                Synchronize Fiscal Identity
              </Button>
            </div>

            {/* Sovereign Lockdown Overlay */}
            {!isSovereign && (
              <div className="absolute inset-0 z-50 glass-panel flex flex-col items-center justify-center space-y-4 backdrop-blur-xl bg-slate-950/40">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                  <Lock className="w-8 h-8 text-rose-500" />
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-black italic tracking-tighter text-white uppercase">[ RESTRICTED CLEARANCE ]</h4>
                  <p className="text-[8px] font-black text-rose-400 uppercase tracking-[0.3em] mt-2">Requires ADMIN or OWNER Authorization</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Identity & Compliance */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Organization Identity</h3>
          </div>

          <Card className="space-y-8">
            <div className="flex items-center gap-6 pb-8 border-b border-white/5">
               <div className="w-20 h-20 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-3xl font-black text-brand italic">
                 {session?.user?.organizationName?.charAt(0) || 'A'}
               </div>
               <div>
                  <h4 className="text-2xl font-black italic tracking-tighter text-white uppercase">{session?.user?.organizationName || 'Axiom Global'}</h4>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Tenant ID: {session?.user?.organizationId || 'unverified'}</p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center p-5 rounded-3xl bg-white/3 border border-white/5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Compliance Status</span>
                  <Badge variant="success">Active_Audit_Locked</Badge>
               </div>
               <div className="flex justify-between items-center p-5 rounded-3xl bg-white/3 border border-white/5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data Retention Policy</span>
                  <Badge variant="default">GAAP_7_YEAR_PERSISTENCE</Badge>
               </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
