import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import IntelligenceHeader from '@/src/components/finova/insights/IntelligenceHeader';
import HealthIndicatorCards from '@/src/components/finova/insights/HealthIndicatorCards';
import ProgressTrackerCards from '@/src/components/finova/insights/ProgressTrackerCards';
import ActionableLedgers from '@/src/components/finova/insights/ActionableLedgers';
import ForecastingSection from '@/src/components/finova/insights/ForecastingSection';
import TacticalOverview from '@/src/components/finova/insights/TacticalOverview';

export const metadata: Metadata = {
  title: 'Operational Dashboard | Cash & Payment Intelligence',
  description: 'Tenant collections, due amounts, utility billing & cash flow forecast.',
};

export default async function TenantDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <main className="flex flex-col gap-6 xl:h-[calc(100vh-160px)] overflow-hidden max-w-7xl mx-auto w-full">
      {/* Scrollable Container for Desktop Lockdown */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="space-y-8 pb-12">
          {/* Section 1: Header */}
          <IntelligenceHeader />

          {/* Section 2: Primary Financial Health Indicators */}
          <HealthIndicatorCards />

          {/* Section 3: Granular Progress Trackers */}
          <ProgressTrackerCards />

          {/* Section 4: Actionable Ledger Tables */}
          <ActionableLedgers />

          {/* Section 5: Forecasting & Strategy */}
          <ForecastingSection />

          {/* Section 6: Tactical Overviews & Footer */}
          <TacticalOverview />
        </div>
      </div>
    </main>
  );
}
