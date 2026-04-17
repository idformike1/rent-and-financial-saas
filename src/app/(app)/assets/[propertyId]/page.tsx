import { getCurrentSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getPropertySovereignViewService, getSidebarPropertiesService } from '@/src/services/queries/assets.services';
import { getPropertyAssetPulse } from '@/actions/analytics.actions';
import PropertySovereignClient from './PropertySovereignClient';

interface SovereignPageProps {
  params: Promise<{ propertyId: string }>;
}

export default async function SovereignViewport({ params }: SovereignPageProps) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const { propertyId } = await params;

  let propertyData;
  let pulseData;
  let allProperties;

  try {
    const [pData, plData, sidebarProps] = await Promise.all([
      getPropertySovereignViewService(propertyId, {
        operatorId: session.userId,
        organizationId: session.organizationId,
      }),
      getPropertyAssetPulse(propertyId),
      getSidebarPropertiesService({
        operatorId: session.userId,
        organizationId: session.organizationId
      })
    ]);
    
    propertyData = pData;
    pulseData = plData;
    allProperties = sidebarProps;
  } catch (error) {
    redirect('/assets');
  }

  return (
    <PropertySovereignClient 
      propertyData={propertyData} 
      pulseData={pulseData.success ? pulseData.data : null} 
      allProperties={allProperties}
    />
  );
}
