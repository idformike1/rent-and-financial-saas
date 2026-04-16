import { getCurrentSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getPropertySovereignViewService } from '@/src/services/queries/assets.services';
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
  try {
    const [pData, plData] = await Promise.all([
      getPropertySovereignViewService(propertyId, {
        operatorId: session.userId,
        organizationId: session.organizationId,
      }),
      getPropertyAssetPulse(propertyId)
    ]);
    propertyData = pData;
    pulseData = plData;
  } catch (error) {
    redirect('/assets'); // Redirect back to parent command if deep link fails or is unauthorized
  }

  return (
    <PropertySovereignClient 
      propertyData={propertyData} 
      pulseData={pulseData.success ? pulseData.data : null} 
    />
  );
}

