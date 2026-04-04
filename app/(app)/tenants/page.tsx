import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, User, Building, ArrowRight, Search, ShieldCheck } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui-finova'
import TenantRegistryClient from './TenantRegistryClient'

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

      <TenantRegistryClient tenants={tenants} />
    </div>
  )
}
