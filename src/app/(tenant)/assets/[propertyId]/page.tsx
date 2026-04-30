import { getCurrentSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { assetService } from '@/src/services/asset.service';
import { getProfitAndLoss } from '@/actions/analytics.actions';
import PropertySovereignClient from "@/src/components/modules/assets/PropertySovereignClient";

interface SovereignPageProps {
  /** Geographic and semantic node identifier */
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
    // 1. Fetch primary identity data
    propertyData = await assetService.getPropertySovereignView(propertyId, session.organizationId);
    
    // 2. Fetch secondary telemetry
    const plData = await assetService.getPropertyAssetPulse(propertyId, session.organizationId);
    
    // 3. Fetch sidebar context
    allProperties = await assetService.getSidebarProperties(session.organizationId);
    
    pulseData = plData; 
  } catch (error) {
    console.error('[ASSET_VIEWPORT_FATAL]', error);
    redirect('/assets');
  }

  return (
    <PropertySovereignClient 
      propertyData={propertyData} 
      pulseData={pulseData} 
      allProperties={allProperties}
      role={session.role}
    />
  );



}
