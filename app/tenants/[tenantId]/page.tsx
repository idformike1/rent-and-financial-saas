import prisma from '@/lib/prisma'
import TenantProfileClient from './TenantProfileClient'
import { notFound } from 'next/navigation'
import { ChargeDTO } from '@/types'

export default async function TenantProfilePage({ params }: { params: { tenantId: string } }) {
  const paramData = await params;
  const tId = paramData.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tId },
    include: {
      charges: {
        where: { isFullyPaid: false, amount: { gt: 0 } },
        include: { lease: true }
      }
    }
  })

  if (!tenant) notFound()

  // Algorithm A Data Prep: Ensure charges are sorted exactly as Algorithm A will sort them backend
  const sortedCharges = tenant.charges.sort((a, b) => {
    if (a.lease.isPrimary && !b.lease.isPrimary) return -1;
    if (!a.lease.isPrimary && b.lease.isPrimary) return 1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  const chargesDTO: ChargeDTO[] = sortedCharges.map(c => ({
    id: c.id,
    tenantId: c.tenantId,
    leaseId: c.leaseId,
    type: c.type,
    amount: c.amount.toNumber(),
    amountPaid: c.amountPaid.toNumber(),
    dueDate: c.dueDate,
    isFullyPaid: c.isFullyPaid
  }))

  const tenantDTO = {
    id: tenant.id,
    name: tenant.name
  }

  return (
    <div className="py-6">
      <TenantProfileClient tenant={tenantDTO} charges={chargesDTO} />
    </div>
  )
}
