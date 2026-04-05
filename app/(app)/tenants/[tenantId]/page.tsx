import TenantProfileView from '@/app/(app)/tenants/[tenantId]/TenantProfileView'
import { getTenantForensicDossier } from '@/actions/tenant-forensics.actions'
import { notFound } from 'next/navigation'

export default async function TenantProfilePage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  const res: any = await getTenantForensicDossier(tenantId);
  if (!res.success || !res.data) {
    notFound();
  }

  const { tenant, integrityScore, stripChart } = res.data;

  // DATA RECONSTRUCTION FOR V3.0 INTERFACE
  const tenantDTO = {
    id: tenant.id,
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    nationalId: tenant.nationalId,
    isDeleted: tenant.isDeleted,
    integrityScore,
    stripChart
  };

  const activeLeases = tenant.leases
    .filter((l: any) => l.isActive)
    .map((l: any) => ({
      id: l.id,
      unitId: l.unit.id,
      unitNumber: l.unit.unitNumber,
      rentAmount: l.rentAmount,
      startDate: l.startDate,
      endDate: l.endDate,
      isPrimary: l.isPrimary
    }));

  const forensicLedger = tenant.charges.map((c: any) => {
    // Find the entry that matches this charge
    const matchedEntry = tenant.ledgerEntries.find((e: any) => 
       Math.abs(new Date(e.transactionDate).getTime() - new Date(c.dueDate).getTime()) < 30 * 24 * 60 * 60 * 1000
    );

    return {
      id: c.id,
      type: c.type,
      amount: c.amount,
      amountPaid: c.amountPaid,
      dueDate: c.dueDate,
      paymentDate: matchedEntry?.transactionDate || null,
      isFullyPaid: c.isFullyPaid
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
      <TenantProfileView 
        tenant={JSON.parse(JSON.stringify(tenantDTO))} 
        activeLeases={JSON.parse(JSON.stringify(activeLeases))}
        charges={JSON.parse(JSON.stringify(forensicLedger))}
      />
    </div>
  );
}
