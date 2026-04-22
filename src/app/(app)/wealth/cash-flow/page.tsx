import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/src/actions/workspace.actions'
import TrendChart from '@/src/components/Cockpit/TrendChart'
import ExpenseLogger from '@/src/components/Cockpit/ExpenseLogger'
import CategoryBreakdown from '@/src/components/Cockpit/CategoryBreakdown'
import { getWealthAccounts } from '@/actions/wealth.actions'
import { getLedgerFilterMetadata, getMasterLedger } from '@/actions/analytics.actions'

export default async function CashFlowInsightsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const activeId = await getActiveWorkspaceId();
  if (!activeId) redirect('/home');

  // Parallel Data Acquisition (High Fidelity)
  const [accounts, metadata, ledgerEntries] = await Promise.all([
    getWealthAccounts(),
    getLedgerFilterMetadata(),
    getMasterLedger({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        take: 1000
    })
  ]);

  const categories = (metadata as any).categories || [];
  
  // Calculate Burn Breakdown
  const expenseEntries = (ledgerEntries as any[] || []).filter(e => e.amount < 0 && e.expenseCategory);
  const categoryTotals: Record<string, number> = {};
  let totalBurn = 0;

  expenseEntries.forEach(entry => {
    const catName = entry.expenseCategory?.name || 'Uncategorized';
    categoryTotals[catName] = (categoryTotals[catName] || 0) + Math.abs(entry.amount);
    totalBurn += Math.abs(entry.amount);
  });

  const breakdownData = Object.entries(categoryTotals).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalBurn > 0 ? (amount / totalBurn) * 100 : 0
  }));

  // Existing Trend Data (Retained)
  const MOCK_CASHFLOW_DATA = [
    { date: 'JAN', value: 12000 },
    { date: 'FEB', value: 15400 },
    { date: 'MAR', value: 11200 },
    { date: 'APR', value: 18900 },
    { date: 'MAY', value: 21000 },
    { date: 'JUN', value: 19500 },
  ]

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header>
        <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-1">
          Fiscal Command Center
        </h1>
        <h2 className="text-5xl font-weight-display text-white leading-none tracking-tighter">
          Cash Flow Insights
        </h2>
      </header>

      {/* Primary Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TrendChart data={MOCK_CASHFLOW_DATA} title="Personal Income Trajectory" />
        <TrendChart data={MOCK_CASHFLOW_DATA.map(d => ({ ...d, value: d.value * 0.4 }))} title="Lifestyle Burn" />
      </div>

      {/* Operational Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
              <ExpenseLogger 
                accounts={accounts as any} 
                categories={categories as any} 
              />
          </div>
          <div className="lg:col-span-1">
              <CategoryBreakdown data={breakdownData} />
          </div>
      </div>
    </div>
  );
}
