import prisma from '@/lib/prisma'
import { AccountCategory } from '@prisma/client'
import DashboardCharts from './DashboardCharts'
import { Landmark, Briefcase, PiggyBank } from 'lucide-react'

export default async function TreasuryDashboard() {
  // Aggregate Vault Balances
  const assets = await prisma.account.findMany({
    where: { category: AccountCategory.ASSET },
    include: {
      entries: true
    }
  });

  let totalCash = 0;
  let totalBank = 0;
  let totalSavings = 0;

  for (const asset of assets) {
    const sum = asset.entries.reduce((acc, el) => acc + el.amount.toNumber(), 0);
    if (asset.name.includes('Cash')) totalCash += sum;
    else if (asset.name.includes('Savings')) totalSavings += sum;
    else totalBank += sum; 
  }

  // MOCK Trend Data (In production, sum entries group by month via SQL)
  const mockTrendData = [
    { month: 'Jan', income: 4000, expense: 2400 },
    { month: 'Feb', income: 3000, expense: 1398 },
    { month: 'Mar', income: 5500, expense: 3800 },
    { month: 'Apr', income: 6200, expense: 2900 },
    { month: 'May', income: Math.round(totalBank / 2), expense: 1900 },
  ];

  // Utility Recovery Data (Algorithm B Insight Widget output proxy)
  // We use the aggregated account balances for the current period (mocking YTD for seed data view)
  const masterBills = await prisma.account.findMany({
    where: { category: AccountCategory.EXPENSE, name: { contains: 'Master' } },
    include: { entries: true }
  });
  
  const recoveryIncomes = await prisma.account.findMany({
    where: { category: AccountCategory.INCOME, name: { contains: 'Utility' } },
    include: { entries: true }
  });

  const rawExpense = masterBills.reduce((acc, act) => acc + act.entries.reduce((a, b) => a + b.amount.toNumber(), 0), 0)
  const rawRecovery = recoveryIncomes.reduce((acc, act) => acc + act.entries.reduce((a, b) => a + Math.abs(b.amount.toNumber()), 0), 0)

  // Avoid chart crash if 0 by enforcing minimal fallback for blank slate test
  const expVal = rawExpense > 0 ? rawExpense : 1000;
  const recVal = rawRecovery > 0 ? rawRecovery : 750;

  const recoveryData = [
    { name: 'Recovered', value: recVal },
    { name: 'Unrecovered', value: Math.max(0, expVal - recVal) }
  ];

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Macro Cash Flow</h1>
        <p className="text-slate-500 mt-1">Real-time balances and net operating analytics.</p>
      </div>

      {/* The Vault Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 shadow-sm border border-slate-200 sm:rounded-lg">
          <div className="flex items-center text-slate-500 mb-4 font-medium uppercase tracking-wider text-xs">
            <Briefcase className="w-4 h-4 mr-2" /> Bank Checking
          </div>
          <p className="text-3xl font-bold text-slate-900">${totalBank.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        
        <div className="bg-white p-6 shadow-sm border border-slate-200 sm:rounded-lg">
          <div className="flex items-center text-slate-500 mb-4 font-medium uppercase tracking-wider text-xs">
            <PiggyBank className="w-4 h-4 mr-2" /> Savings Reserve
          </div>
          <p className="text-3xl font-bold text-slate-900">${totalSavings.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        
        <div className="bg-white p-6 shadow-sm border border-slate-200 sm:rounded-lg border-t-4 border-t-indigo-600">
          <div className="flex items-center text-slate-500 mb-4 font-medium uppercase tracking-wider text-xs">
            <Landmark className="w-4 h-4 mr-2" /> Cash in Hand
          </div>
          <p className="text-3xl font-bold text-indigo-700">${totalCash.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
      </div>

      <DashboardCharts trendData={mockTrendData} recoveryData={recoveryData} />
    </div>
  )
}
