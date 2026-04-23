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

    // DATA RECONSTRUCTION FOR V3.0 INTERFACE (Decimal -> Number Serialization)
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
        rentAmount: Number(l.rentAmount || 0),
        depositAmount: Number(l.depositAmount || 0),
        startDate: l.startDate,
        endDate: l.endDate,
        isPrimary: l.isPrimary
      }));

    return (
      <div className="min-h-screen bg-background">
        <TenantProfileView 
          tenant={tenantDTO as any}
          activeLeases={activeLeases as any}
          charges={tenant.charges.map((c: any) => ({ 
            id: c.id, 
            type: c.type,
            amount: Number(c.amount || 0), 
            amountPaid: Number(c.amountPaid || 0), 
            dueDate: c.dueDate instanceof Date ? c.dueDate.toISOString() : c.dueDate,
            isFullyPaid: c.isFullyPaid
          }))}
          ledgerEntries={tenant.ledgerEntries.map((e: any) => ({ 
            id: e.id,
            amount: Number(e.amount || 0), 
            description: e.description,
            transactionDate: e.transactionDate instanceof Date ? e.transactionDate.toISOString() : e.transactionDate 
          }))}
        />
      </div>
    );
  } catch (e) {
    console.error('[PROFILE_RENDER_FATAL]', e);
    notFound();
  }
}
