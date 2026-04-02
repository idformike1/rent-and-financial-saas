import prisma from '@/lib/prisma'
import { AccountCategory } from '@prisma/client'
import DashboardCharts from './DashboardCharts'
import { Landmark, Briefcase, PiggyBank, ReceiptText, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function TreasuryDashboard() {
  // Aggregate actual account totals from LedgerEntry table
  const accounts = await prisma.account.findMany({
    include: {
      entries: true
    }
  });

  const vaultBalances = {
    bank: 0,
    savings: 0,
    cash: 0
  };

  accounts.forEach((acc: any) => {
    const total = acc.entries.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);
    if (acc.name.toLowerCase().includes('bank') || acc.name.toLowerCase().includes('chase')) vaultBalances.bank += total;
    else if (acc.name.toLowerCase().includes('savings')) vaultBalances.savings += total;
    else if (acc.name.toLowerCase().includes('cash')) vaultBalances.cash += total;
  });

  // Trend Data Aggregation (Last 3 Months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const trendMap: Record<string, { income: number, expense: number }> = {};

  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    trendMap[months[d.getMonth()]] = { income: 0, expense: 0 };
  }

  const entries = await prisma.ledgerEntry.findMany({
    include: { account: true }
  });

  entries.forEach((entry: any) => {
    const entryDate = new Date(entry.date);
    const monthName = months[entryDate.getMonth()];
    if (trendMap[monthName]) {
      if (entry.account?.category === AccountCategory.INCOME) {
        trendMap[monthName].income += Math.abs(Number(entry.amount));
      } else if (entry.account?.category === AccountCategory.EXPENSE) {
        trendMap[monthName].expense += Number(entry.amount);
      }
    }
  });

  const trendData = Object.keys(trendMap).map(k => ({
    month: k,
    income: trendMap[k].income,
    expense: trendMap[k].expense
  }));

  // Utility Recovery Data (Algorithm B)
  const masterBills = accounts.filter((a: any) => a.category === AccountCategory.EXPENSE && a.name.includes('Master'));
  const recoveries = accounts.filter((a: any) => a.category === AccountCategory.INCOME && a.name.includes('Utility'));

  const billTotal = masterBills.reduce((acc: number, a: any) => acc + a.entries.reduce((s: number, e: any) => s + Number(e.amount), 0), 0);
  const recoveryTotal = recoveries.reduce((acc: number, a: any) => acc + a.entries.reduce((s: number, e: any) => s + Math.abs(Number(e.amount)), 0), 0);

  const recoveryData = [
    { name: 'Recovered', value: recoveryTotal },
    { name: 'Unrecovered', value: Math.max(0, billTotal - recoveryTotal) }
  ];

  // Delinquency Analysis
  const tenants = await prisma.tenant.findMany({
    include: {
      charges: {
        where: { isFullyPaid: false }
      }
    }
  });

  const delinquentTenants = tenants.map((t: any) => {
    const balance = t.charges.reduce((sum: number, c: any) => sum + (Number(c.amount) - Number(c.amountPaid)), 0);
    return { id: t.id, name: t.name, balance };
  }).filter((t: any) => t.balance > 0).sort((a: any, b: any) => b.balance - a.balance);

  return (
    <div className="py-6 min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <ReceiptText className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Treasury Terminal</h1>
          </div>
          <p className="text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-sm">Enterprise-grade NOI analytics & master cash registry.</p>
        </div>
        <Link 
          href="/treasury/expenses" 
          className="bg-white text-slate-900 border-2 border-slate-900 font-black px-6 py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase tracking-widest text-xs flex items-center"
        >
          <Landmark className="w-4 h-4 mr-3" /> Log Operational Expense
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center text-slate-400 mb-4 font-bold uppercase tracking-widest text-[10px]">
             <Briefcase className="w-4 h-4 mr-2" /> Bank Checking
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">${vaultBalances.bank.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>

        <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center text-slate-400 mb-4 font-bold uppercase tracking-widest text-[10px]">
             <PiggyBank className="w-4 h-4 mr-2" /> Savings Reserve
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">${vaultBalances.savings.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl border-l-[6px] border-l-indigo-600">
          <div className="flex items-center text-slate-500 mb-4 font-bold uppercase tracking-widest text-[10px]">
             <Landmark className="w-4 h-4 mr-2" /> Cash in Hand
          </div>
          <p className="text-4xl font-black text-white tracking-tighter">${vaultBalances.cash.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
      </div>

      <DashboardCharts trendData={trendData} recoveryData={recoveryData} />

      <div className="mt-12 bg-white border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] rounded-[2.5rem] overflow-hidden p-10 animate-in slide-in-from-bottom-8 duration-1000">
        <div className="flex items-center justify-between mb-10">
           <div>
             <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 flex items-center">
               <AlertCircle className="w-6 h-6 mr-3 text-red-500 animate-pulse" /> High-Priority Delinquency Registry
             </h3>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 ml-9">Master Aging Analysis Engine</p>
           </div>
           <Link href="/reports/master-ledger" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
              View Full Ledger Entry Registry
           </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
               <tr>
                 <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Occupant Identity</th>
                 <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fiscal Status</th>
                 <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-red-500">Residual Debt (-)</th>
                 <th className="px-8 py-5 text-right"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {delinquentTenants.length === 0 ? (
                 <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400 font-medium italic">No active fiscal drift detected. Portfolio status is nominal.</td></tr>
               ) : (
                delinquentTenants.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6 whitespace-nowrap">
                       <span className="font-black text-slate-900 tracking-tight text-xl group-hover:text-indigo-600 transition-colors uppercase italic">{t.name}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                       <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">Delinquent Protocol</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right font-black text-red-600 text-2xl tracking-tighter">$ {t.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-8 py-6 whitespace-nowrap text-right uppercase">
                       <Link href={`/tenants/${t.id}`} className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors">
                          Enforce <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                       </Link>
                    </td>
                  </tr>
                ))
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
