import { getCurrentSession } from '@/lib/auth-utils';
import { assetService } from '@/src/services/asset.service';
import UnitSideSheet from '@/src/components/modules/assets/UnitSideSheet';
import { notFound, redirect } from 'next/navigation';

interface Props {
  params: Promise<{ propertyId: string; unitId: string }>;
}

export default async function UnitInterceptPage({ params }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const { unitId } = await params;

  const unitData = await assetService.getUnitSovereignView(unitId, session.organizationId);
  if (!unitData) return notFound();

  return (
    <UnitSideSheet 
      activeUnitOverride={JSON.parse(JSON.stringify(unitData))} 
      isModal={true} 
    />
  );
}
