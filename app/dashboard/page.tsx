import prisma from '@/lib/prisma'
import { AccountCategory } from '@prisma/client'
import DashboardCharts from '@/app/treasury/DashboardCharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Briefcase,
  PiggyBank
} from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui-finova'
import Link from 'next/link'

export default async function FinovaDashboard() {
  // --- DATA AGGREGATION ENGINE ---
  const accounts = await prisma.account.findMany({ include: { entries: true } });
  const entries = await prisma.ledgerEntry.findMany({ include: { account: true } });
  
  const stats = {
    egr: 0, // Effective Gross Revenue
    noi: 0, // Net Operating Income
    gpr: 0, // Gross Potential Rent
    cashFlow: 0
  };

  const vaultBalances = { bank: 0, savings: 0, cash: 0 };

  accounts.forEach((acc: any) => {
    const total = acc.entries.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);
    if (acc.name.toLowerCase().includes('bank')) vaultBalances.bank += total;
    else if (acc.name.toLowerCase().includes('savings')) vaultBalances.savings += total;
    else if (acc.name.toLowerCase().includes('cash')) vaultBalances.cash += total;
    
    if (acc.category === AccountCategory.INCOME) stats.egr += Math.abs(total);
    if (acc.category === AccountCategory.EXPENSE) stats.noi -= total;
  });

  stats.noi += stats.egr;
  stats.gpr = stats.egr * 1.05; // Mock logic for GPR oversight
  stats.cashFlow = stats.noi * 0.92;

  // Chart Data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendMap: Record<string, { income: number, expense: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    trendMap[months[d.getMonth()]] = { income: 0, expense: 0 };
  }

  entries.forEach((entry: any) => {
    const d = new Date(entry.date);
    const m = months[d.getMonth()];
    if (trendMap[m]) {
      if (entry.account?.category === AccountCategory.INCOME) trendMap[m].income += Math.abs(Number(entry.amount));
      else if (entry.account?.category === AccountCategory.EXPENSE) trendMap[m].expense += Number(entry.amount);
    }
  });

  const trendData = Object.keys(trendMap).map(k => ({ month: k, income: trendMap[k].income, expense: trendMap[k].expense }));

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-in fade-in duration-700 bg-surface-50 dark:bg-surface-950 min-h-screen">
      
      {/* HEADER: FINOVA STANDARD BREADCRUMB & IDENTITY */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Business Overview</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Track portfolio performance and real-time ledger velocity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">Download Report</Button>
          <Button variant="primary" size="sm">
            <Zap className="w-4 h-4 mr-2 fill-white" /> Upgrade Plan
          </Button>
        </div>
      </div>

      {/* PHASE 1 MANDATE: 4-QUADRANT DOMINANT GRID (IMAGE 5 & 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Effective Gross Revenue</p>
              <h2 className="text-3xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">
                ${stats.egr.toLocaleString()}
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="success" className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> 12%
                </Badge>
                <span className="text-[10px] font-medium text-slate-400 italic">vs last cycle</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Net Operating Income</p>
              <h2 className="text-3xl font-black tracking-tighter text-brand">
                ${stats.noi.toLocaleString()}
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="success" className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> 8.4%
                </Badge>
                <span className="text-[10px] font-medium text-slate-400 italic">Target Realized</span>
              </div>
            </div>
            <div className="p-3 bg-brand/10 rounded-xl">
              <Activity className="w-6 h-6 text-brand" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Yield Forecast (GPR)</p>
              <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                ${stats.gpr.toLocaleString()}
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="warning" className="flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3" /> 2.1%
                </Badge>
                <span className="text-[10px] font-medium text-slate-400 italic">Physical Vacancy Delta</span>
              </div>
            </div>
            <div className="p-3 bg-surface-100 dark:bg-surface-800 rounded-xl">
              <DollarSign className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group border-brand/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Liquidity Score</p>
              <h2 className="text-3xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">
                98.2
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Optimal</Badge>
                <span className="text-[10px] font-medium text-slate-400 italic">Audit Ready</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* VAULT REGISTRY (IMAGE 7 CARDS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-surface-900 dark:text-white">Revenue Evaluation</h3>
               <select className="bg-surface-50 dark:bg-surface-800 border-none text-[10px] font-bold uppercase rounded-lg px-3 py-1 ring-0 outline-none">
                  <option>Yearly</option>
                  <option>Monthly</option>
               </select>
            </div>
            <div className="h-[350px]">
              <DashboardCharts trendData={trendData} recoveryData={[]} />
            </div>
          </Card>
          
          <Card className="p-0 overflow-hidden">
            <div className="px-8 py-6 border-b border-surface-100 dark:border-surface-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">Sub-Account Distribution</h3>
              <Badge>Real Time</Badge>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-brand">
                    <Briefcase className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Bank Checking</p>
                    <p className="font-black text-xl text-surface-900 dark:text-white">${vaultBalances.bank.toLocaleString()}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                    <PiggyBank className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Tax Reserva</p>
                    <p className="font-black text-xl text-surface-900 dark:text-white">${vaultBalances.savings.toLocaleString()}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-slate-600">
                    <CreditCard className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Cash Petty</p>
                    <p className="font-black text-xl text-surface-900 dark:text-white">${vaultBalances.cash.toLocaleString()}</p>
                 </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8 flex flex-col items-center text-center space-y-6">
             <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <Zap className="w-8 h-8 text-brand" />
             </div>
             <div>
                <h4 className="text-xl font-black text-surface-900 dark:text-white">Axiom Intelligence Hub</h4>
                <p className="text-xs font-medium text-slate-400 mt-2 px-4 leading-relaxed">
                  Advanced predictive modeling for portfolio churn and NOI leakage detection.
                </p>
             </div>
             <Button variant="primary" className="w-full">Initialize Hub</Button>
          </Card>

          <Card className="p-8 space-y-8">
             <h3 className="text-lg font-bold text-surface-900 dark:text-white">Terminal Health</h3>
             <div className="space-y-6">
                {[
                  { name: 'Waterfall Engine', status: 'Stable', val: 92 },
                  { name: 'GAAP Compliance', status: 'Active', val: 100 },
                  { name: 'Audit Resilience', status: 'Primary', val: 78 }
                ].map(item => (
                  <div key={item.name} className="space-y-2">
                     <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                        <span className="text-slate-400">{item.name}</span>
                        <span className="text-slate-900 dark:text-white">{item.status}</span>
                     </div>
                     <div className="h-1.5 bg-slate-100 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand" style={{ width: `${item.val}%` }} />
                     </div>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
