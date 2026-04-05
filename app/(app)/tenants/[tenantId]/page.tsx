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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
      <TenantProfileView 
        tenant={JSON.parse(JSON.stringify(tenantDTO))} 
        activeLeases={JSON.parse(JSON.stringify(activeLeases))}
        charges={JSON.parse(JSON.stringify(tenant.charges))}
        ledgerEntries={JSON.parse(JSON.stringify(tenant.ledgerEntries))}
      />
    </div>
  );
}
