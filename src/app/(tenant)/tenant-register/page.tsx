import { assetService } from '@/src/services/asset.service';
import { getCurrentSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import TenantOnboardingWizard from '@/src/components/modules/tenants/TenantOnboardingWizard';

export default async function TenantRegisterPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const units = await assetService.getAvailableUnits(session.organizationId);

  return (
    <TenantOnboardingWizard initialUnits={JSON.parse(JSON.stringify(units))} />
  );
}
