import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import TenantProfileView from '@/app/tenants/[tenantId]/TenantProfileView'

export default async function TenantProfilePage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      leases: {
        include: { unit: true },
        orderBy: { startDate: 'desc' }
      },
      charges: {
        where: { isFullyPaid: false },
        orderBy: { dueDate: 'asc' }
      }
    }
  });

  if (!tenant) {
    notFound();
  }

  // Map to DTOs for the client component
  const tenantDTO = {
    id: tenant.id,
    name: tenant.name
  };

  const chargesDTO = tenant.charges.map(c => ({
    id: c.id,
    type: c.type,
    amount: c.amount.toNumber(),
    amountPaid: c.amountPaid.toNumber(),
    dueDate: c.dueDate,
    isFullyPaid: c.isFullyPaid
  }));

  const activeLease = tenant.leases.find(l => l.isActive);

  return (
    <div className="py-6">
      <TenantProfileView 
        tenant={tenantDTO} 
        activeLease={activeLease ? {
          id: activeLease.id,
          unitNumber: activeLease.unit.unitNumber,
          rentAmount: activeLease.rentAmount.toNumber(),
          startDate: activeLease.startDate,
          endDate: activeLease.endDate
        } : null}
        charges={chargesDTO}
      />
    </div>
  );
}
