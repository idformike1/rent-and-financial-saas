import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, User, Building, ArrowRight, Search, ShieldCheck } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui-finova'

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    include: {
      leases: {
        include: {
          unit: true
        }
      }
    }
  });

  return (
    <div className="py-12 px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* HEADER: DIRECTORY IDENTITY */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 dark:border-surface-800 pb-10 gap-8">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-brand fill-brand" />
           </div>
           <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Occupant <br/><span className="text-brand">Directory</span></h1>
              <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px] mt-2">Master Index of Portfolio Identity</p>
           </div>
        </div>
        <Link href="/onboarding">
          <Button variant="primary" className="h-14 px-8 rounded-2xl font-black uppercase italic tracking-tighter shadow-premium flex items-center gap-3">
            <Plus className="w-5 h-5" /> New Provisioning
          </Button>
        </Link>
      </div>

      {/* SEARCH COMMAND STRIP */}
      <Card className="p-4 bg-slate-900 border-none rounded-3xl flex items-center gap-4 group">
         <Search className="w-5 h-5 text-slate-500 ml-4 group-focus-within:text-brand transition-colors" />
         <input 
           type="text" 
           placeholder="Scan identity registry..." 
           className="bg-transparent border-none text-white text-xs font-bold uppercase tracking-widest outline-none w-full placeholder:text-zinc-700" 
         />
         <Badge className="bg-brand/20 text-brand border-brand/30 mr-2 whitespace-nowrap">{tenants.length} Identities</Badge>
      </Card>

      {/* CORE REGISTRY: FINOVA TABLE STANDARD */}
      <Card className="p-0 overflow-hidden border-none shadow-premium-lg rounded-[2.5rem] bg-white dark:bg-slate-900">
        {tenants.length === 0 ? (
          <div className="p-32 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110">
               <User className="w-10 h-10 text-slate-200 dark:text-slate-700" />
            </div>
            <div>
               <p className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">No Active Signals</p>
               <p className="text-slate-400 text-[9px] mt-3 font-black tracking-[0.3em] uppercase">Identity materialization required to populate directory.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/50 dark:bg-surface-950/50 border-b border-slate-100 dark:border-surface-800">
                <tr>
                  <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Identity Protocol</th>
                  <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Lease Portfolio</th>
                  <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Risk Matrix</th>
                  <th className="px-8 py-6 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Action Domain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-surface-800">
                {tenants.map((tenant: any) => {
                  const activeLeases = (tenant.leases as any[]).filter(l => l.isActive);
                  const primaryLease = activeLeases.find(l => l.isPrimary) || activeLeases[0];
                  
                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/50 dark:hover:bg-brand/5 transition-all group cursor-default">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl italic shadow-premium group-hover:rotate-6 transition-transform">
                            {tenant.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1.5 group-hover:text-brand transition-colors">{tenant.name}</span>
                            <div className="flex items-center gap-2">
                               <ShieldCheck className="w-3 h-3 text-emerald-500" />
                               <span className="text-[10px] font-bold text-slate-400 tracking-tight truncate max-w-[150px] uppercase font-mono">{tenant.email || 'PROTOCOL_NULL'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-3">
                          <Building className="w-4 h-4 text-brand" />
                          <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase italic tracking-tighter">
                            {primaryLease?.unit.unitNumber || 'UNASSIGNED'}
                          </span>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">{activeLeases.length} ACTIVE ATOMIC LEASES</p>
                      </td>
                      <td className="px-8 py-8">
                        <Badge variant={activeLeases.length > 0 ? 'success' : 'default'} className="px-3 py-1 text-[9px] rounded-xl border-none">
                          {activeLeases.length > 0 ? 'STATUS::ACTIVE' : 'STATUS::INACTIVE'}
                        </Badge>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <Link href={`/tenants/${tenant.id}`}>
                           <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-surface-800 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all shadow-sm">
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
