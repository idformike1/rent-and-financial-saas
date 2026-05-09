import { getCurrentSession } from '@/lib/auth-utils';
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { assetService } from '@/src/services/asset.service';
import { getPropertyLedgerEntries } from '@/src/services/analytics.service';
import { getProfitAndLoss } from '@/actions/analytics.actions';
import PropertySovereignClient from "@/src/components/modules/assets/PropertySovereignClient";

interface SovereignPageProps {
  /** Geographic and semantic node identifier */
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ timeframe?: 'MONTHLY' | 'YEARLY' | 'ALL_TIME' }>;
}

export default async function SovereignViewport({ params, searchParams }: SovereignPageProps) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const { propertyId } = await params;
  const { timeframe = 'ALL_TIME' } = await searchParams;

  let propertyData;
  let pulseData;
  let allProperties;
  let initialLedger: any[] = [];

  try {
    // 1. Fetch primary identity data
    propertyData = await assetService.getPropertySovereignView(propertyId, session.organizationId);
    
    // 2. Fetch secondary telemetry
    const plData = await assetService.getPropertyAssetPulse(propertyId, session.organizationId, timeframe);
    
    // 3. Fetch sidebar context
    allProperties = await assetService.getSidebarProperties(session.organizationId);
    
    // 4. Fetch initial ledger state (Refactored from Client Side Action)
    initialLedger = await getPropertyLedgerEntries(session.organizationId, propertyId, timeframe);

    pulseData = plData; 
  } catch (error) {
    console.error('[ASSET_VIEWPORT_FATAL]', error);
    redirect('/assets');
  }

  return (
    <PropertySovereignClient 
      propertyData={JSON.parse(JSON.stringify(propertyData))} 
      pulseData={JSON.parse(JSON.stringify(pulseData))} 
      allProperties={JSON.parse(JSON.stringify(allProperties))}
      initialLedger={initialLedger}
      role={session.role}
    />
  );



}
