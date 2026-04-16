import TenantProfileView from './TenantProfileView'
import { getTenantForensicDossierService } from '@/src/services/mutations/tenant.services'
import { notFound, redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth-utils'

export default async function TenantProfilePage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const session = await getCurrentSession();
  
  if (!session) redirect('/login');

  try {
    const data = await getTenantForensicDossierService(tenantId, {
      operatorId: session.userId,
      organizationId: session.organizationId
    });

    const { tenant } = data;
    const { integrityScore, stripChart } = tenant;

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
      <div className="min-h-screen bg-background">
        <TenantProfileView 
          tenant={JSON.parse(JSON.stringify(tenantDTO || {}))} 
          activeLeases={JSON.parse(JSON.stringify(activeLeases || []))}
          charges={JSON.parse(JSON.stringify(tenant.charges || []))}
          ledgerEntries={JSON.parse(JSON.stringify(tenant.ledgerEntries || []))}
        />
      </div>
    );
  } catch (e) {
    console.error('[PROFILE_RENDER_FATAL]', e);
    notFound();
  }
}
