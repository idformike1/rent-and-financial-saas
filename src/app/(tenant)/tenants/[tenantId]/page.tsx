import TenantProfileView from '@/src/components/modules/tenants/TenantProfileView'
import { tenantService } from '@/src/services/tenant.service'
import { notFound, redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth-utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function TenantProfilePage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const session = await getCurrentSession();
  
  if (!session) redirect('/login');

  try {
    const data = await tenantService.getTenantForensicDossier(tenantId, {
      operatorId: session.userId,
      organizationId: session.organizationId
    });

    const { tenant } = data;
    const { integrityScore, stripChart } = tenant as any;

    // DATA RECONSTRUCTION FOR V3.0 INTERFACE (Decimal -> Number Serialization)
    const tenantDTO = {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      nationalId: tenant.nationalId,
      isDeleted: (tenant as any).isDeleted,
      integrityScore,
      stripChart
    };

    const activeLeases = (tenant as any).leases
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
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link 
            href="/tenants" 
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Back to Registry
          </Link>
          
          <TenantProfileView 
            tenant={tenantDTO as any}
            activeLeases={activeLeases as any}
            ledgerEntries={(tenant as any).ledgerEntries.map((e: any) => ({ 
              id: e.id,
              amount: Number(e.amount || 0), 
              type: e.type,
              description: e.description,
              transactionDate: e.transactionDate instanceof Date ? e.transactionDate.toISOString() : e.transactionDate 
             }))}
          />
        </div>
      </div>
    );
  } catch (e) {
    console.error('[PROFILE_RENDER_FATAL]', e);
    notFound();
  }
}
