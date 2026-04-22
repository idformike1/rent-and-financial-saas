import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/src/actions/workspace.actions'
import TrendChart from '@/src/components/Cockpit/TrendChart'

const MOCK_CASHFLOW_DATA = [
  { date: 'JAN', value: 12000 },
  { date: 'FEB', value: 15400 },
  { date: 'MAR', value: 11200 },
  { date: 'APR', value: 18900 },
  { date: 'MAY', value: 21000 },
  { date: 'JUN', value: 19500 },
]

export default async function CashFlowInsightsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const activeId = await getActiveWorkspaceId();
  if (!activeId) redirect('/home');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500/60 mb-1">
          Fiscal Telemetry
        </h1>
        <h2 className="text-display font-weight-display text-white leading-none">
          Cash Flow Insights
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TrendChart data={MOCK_CASHFLOW_DATA} title="Personal Income Trajectory" />
        <TrendChart data={MOCK_CASHFLOW_DATA.map(d => ({ ...d, value: d.value * 0.4 }))} title="Lifestyle Burn" />
      </div>
    </div>
  );
}
