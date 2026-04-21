import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { FinancialCommandCenter } from '@/src/components/CommandCenter';
import { getActiveWorkspaceId } from '@/src/actions/workspace.actions';

export default async function TenancyCommandCenterPage({ params }: { params: { tenantId: string } }) {
  const session = await auth();
  if (!session) return notFound();

  const activeOrgId = (await getActiveWorkspaceId()) || session.user.organizationId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: params.tenantId, organizationId: activeOrgId },
    include: {
      leases: { where: { isActive: true } }
    }
  });

  if (!tenant || tenant.leases.length === 0) return notFound();

  const lease = tenant.leases[0];

  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { tenantId: tenant.id, organizationId: activeOrgId },
    orderBy: { date: 'desc' }
  });

  let balance = 0;
  ledgerEntries.forEach(e => {
    if (e.type === 'DEBIT') balance += Number(e.amount);
    else balance -= Number(e.amount);
  });

  const tenantData = {
    id: tenant.id,
    name: tenant.name,
    leaseId: lease.id,
    unitId: lease.unitId
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-8">
      <FinancialCommandCenter 
        tenant={tenantData} 
        ledgerEntries={ledgerEntries} 
        balance={balance} 
      />
    </div>
  );
}
