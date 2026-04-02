import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import TenantProfileView from '@/app/tenants/[tenantId]/TenantProfileView'

export default async function TenantProfilePage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

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
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    nationalId: tenant.nationalId,
    isDeleted: tenant.isDeleted
  };

  const chargesDTO = tenant.charges.map((c: any) => ({
    id: c.id,
    type: c.type,
    amount: c.amount.toNumber(),
    amountPaid: c.amountPaid.toNumber(),
    dueDate: c.dueDate,
    isFullyPaid: c.isFullyPaid
  }));

  const activeLeases = tenant.leases
    .filter((l: any) => l.isActive)
    .map((l: any) => ({
      id: l.id,
      unitId: l.unit.id,
      unitNumber: l.unit.unitNumber,
      rentAmount: l.rentAmount.toNumber(),
      startDate: l.startDate,
      endDate: l.endDate,
      isPrimary: l.isPrimary
    }));

  return (
    <div className="py-6">
      <TenantProfileView 
        tenant={tenantDTO} 
        activeLeases={activeLeases}
        charges={chargesDTO}
      />
    </div>
  );
}
