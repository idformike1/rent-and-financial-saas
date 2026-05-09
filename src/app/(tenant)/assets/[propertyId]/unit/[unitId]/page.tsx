import { getCurrentSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { assetService } from '@/src/services/asset.service';
import PropertySovereignClient from "@/src/components/modules/assets/PropertySovereignClient";
import UnitSideSheet from '@/src/components/modules/assets/UnitSideSheet';

interface Props {
  params: Promise<{ propertyId: string; unitId: string }>;
}

export default async function UnitDirectPage({ params }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const { propertyId, unitId } = await params;

  let propertyData;
  let pulseData;
  let allProperties;
  let unitData;

  try {
    // 1. Fetch full dashboard context
    propertyData = await assetService.getPropertySovereignView(propertyId, session.organizationId);
    pulseData = await assetService.getPropertyAssetPulse(propertyId, session.organizationId);
    allProperties = await assetService.getSidebarProperties(session.organizationId);
    
    // 2. Fetch specific unit context
    unitData = await assetService.getUnitSovereignView(unitId, session.organizationId);
  } catch (error) {
    console.error('[UNIT_DIRECT_FATAL]', error);
    redirect(`/assets/${propertyId}`);
  }

  return (
    <>
      <PropertySovereignClient 
        propertyData={JSON.parse(JSON.stringify(propertyData))} 
        pulseData={JSON.parse(JSON.stringify(pulseData))} 
        allProperties={JSON.parse(JSON.stringify(allProperties))}
        role={session.role}
      />
      <UnitSideSheet 
        activeUnitOverride={JSON.parse(JSON.stringify(unitData))} 
        isModal={true} 
      />
    </>
  );
}
