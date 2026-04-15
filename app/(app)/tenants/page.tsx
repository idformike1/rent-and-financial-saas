import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, User, Building, ArrowRight, Search, ShieldCheck } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui-finova'
import TenantRegistryClient from './TenantRegistryClient'

import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

export default async function TenantsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const tenantsRaw = await prisma.tenant.findMany({
    where: { organizationId: session.organizationId },
    include: {
      leases: {
        include: {
          unit: true
        }
      }
    }
  });

  const tenants = tenantsRaw.map((tenant: any) => ({
    ...tenant,
    leases: tenant.leases.map((lease: any) => ({
      ...lease,
      rentAmount: Number(lease.rentAmount),
      depositAmount: Number(lease.depositAmount),
      startDate: lease.startDate?.toISOString() || null,
      endDate: lease.endDate?.toISOString() || null,
      unit: {
        ...lease.unit,
        marketRent: Number(lease.unit.marketRent)
      }
    }))
  }));

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <div className="space-y-1">
          <h1 className="text-[28px] font-display text-foreground leading-none">
            Occupant Directory
          </h1>
          <p className="text-[15px] font-[400] text-muted-foreground opacity-60">
            Master index of portfolio identity and lease governance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/onboarding">
            <Button size="sm" className="bg-sidebar-primary hover:bg-sidebar-primary/90 h-8 px-4 rounded-full text-[13px] border-none">
              <Plus className="w-[14px] h-[14px] mr-2" /> New Provisioning
            </Button>
          </Link>
        </div>
      </div>

      <TenantRegistryClient tenants={tenants} />
    </div>
  )
}
