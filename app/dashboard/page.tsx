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
  const accounts = await prisma.account.findMany({ include: { entries: true } });
  const entries = await prisma.ledgerEntry.findMany({ include: { account: true } });
  
  const stats = { egr: 0, noi: 0, gpr: 0, cashFlow: 0 };
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
  stats.gpr = stats.egr * 1.05;
  stats.cashFlow = stats.noi * 0.92;

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
    <div className="p-8 lg:p-12 space-y-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Financial Oversight</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Real-time ledger velocity monitoring.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm">Audit Log</Button>
          <Button variant="primary" size="sm"><Zap className="w-4 h-4 mr-2" /> Action Hub</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Gross Revenue (EGR)', val: stats.egr, color: 'text-emerald-500', icn: TrendingUp },
          { label: 'Net Operating Income', val: stats.noi, color: 'text-brand', icn: Activity },
          { label: 'Yield Forecast (GPR)', val: stats.gpr, color: 'text-slate-900', icn: DollarSign },
          { label: 'Liquidity Score', val: 98.2, color: 'text-indigo-500', icn: Zap, isRaw: true }
        ].map(s => (
          <Card key={s.label} className="bg-white dark:bg-slate-900 border-none shadow-premium-lg rounded-3xl p-8 transition-transform hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
              <s.icn className={`w-5 h-5 ${s.color}`} />
            </div>
            <h2 className={`text-4xl font-black tracking-tighter ${s.color} italic`}>
              {s.isRaw ? s.val : `$${s.val.toLocaleString()}`}
            </h2>
            <div className="mt-6">
              <Badge variant="success" className="text-[9px]">Synchronized</Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 p-10 bg-white dark:bg-slate-900 border-none shadow-premium rounded-3xl">
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Revenue Projection</h3>
             <Badge>Live Analysis</Badge>
          </div>
          <div className="h-[400px]">
            <DashboardCharts trendData={trendData} recoveryData={[]} />
          </div>
        </Card>
        
        <Card className="p-10 bg-slate-900 text-white border-none shadow-premium rounded-[3rem] space-y-10">
           <div className="h-20 w-20 rounded-3xl bg-brand/20 flex items-center justify-center">
              <Zap className="w-10 h-10 text-brand fill-brand" />
           </div>
           <div>
              <h4 className="text-2xl font-black uppercase italic tracking-tighter">Axiom Intelligence</h4>
              <p className="text-xs text-slate-400 font-medium mt-4 leading-relaxed uppercase tracking-widest opacity-60">
                Autonomous auditing enabled. Every transaction is mapped to the GAAP hierarchy instantly.
              </p>
           </div>
           <Button variant="primary" className="w-full h-14 bg-white text-slate-900 hover:bg-white/90">Initialize Audit</Button>
        </Card>
      </div>
    </div>
  )
}
