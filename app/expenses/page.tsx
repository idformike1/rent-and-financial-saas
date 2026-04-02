import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, ReceiptText, TrendingDown, Landmark, Home, User, PieChart as PieIcon, ArrowRight } from 'lucide-react'
import ExpensesChartClient from './ExpensesChartClient'

export default async function UnifiedExpensesDashboard() {
  const entries = await (prisma as any).ledgerEntry.findMany({
    where: {
      expenseCategoryId: { not: null }
    },
    include: {
      expenseCategory: {
        include: { parent: true }
      },
      property: true
    },
    orderBy: { date: 'desc' }
  });

  const calculateTotal = (scope: string) => {
    return entries
      .filter((e: any) => e.expenseCategory?.scope === scope)
      .reduce((sum: number, e: any) => sum + Math.abs(Number(e.amount)), 0);
  };

  const propertyTotal = calculateTotal('PROPERTY');
  const homeTotal = calculateTotal('HOME');
  const personalTotal = calculateTotal('PERSONAL');
  const grandTotal = propertyTotal + homeTotal + personalTotal;

  // Prepare data for the chart (Group by Parent Category name)
  const categoryMap: Record<string, number> = {};
  entries.forEach((e: any) => {
    const catName = e.expenseCategory?.parent?.name || e.expenseCategory?.name || 'Uncategorized';
    categoryMap[catName] = (categoryMap[catName] || 0) + Math.abs(Number(e.amount));
  });

  const chartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const cardClass = "bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-2xl p-6 flex flex-col items-start space-y-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-default";

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-slate-900 pb-8 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Landmark className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Unified Wealth Ledger</h1>
          </div>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Holistic Liquidity Outflow Audit</p>
        </div>
        
        <div className="flex gap-4">
           <Link 
            href="/settings/categories" 
            className="bg-white text-slate-900 border-4 border-slate-900 font-black px-6 py-4 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px] flex items-center italic"
          >
            Manage Schema
          </Link>
          <Link 
            href="/treasury/expenses" 
            className="bg-slate-900 text-white font-black px-6 py-4 rounded-xl shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase tracking-widest text-[10px] flex items-center italic"
          >
            <Plus className="w-4 h-4 mr-3" /> Log Expenditure
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={cardClass}>
           <div className="bg-indigo-100 p-3 rounded-xl"><Landmark className="w-6 h-6 text-indigo-600" /></div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Business</p>
             <p className="text-3xl font-black text-slate-900 italic tracking-tighter">${propertyTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
           </div>
           <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full" style={{ width: `${(propertyTotal/grandTotal)*100}%` }}></div>
           </div>
        </div>

        <div className={cardClass}>
           <div className="bg-green-100 p-3 rounded-xl"><Home className="w-6 h-6 text-green-600" /></div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Home / Residence</p>
             <p className="text-3xl font-black text-slate-900 italic tracking-tighter">${homeTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
           </div>
           <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                <div className="bg-green-600 h-full" style={{ width: `${(homeTotal/grandTotal)*100}%` }}></div>
           </div>
        </div>

        <div className={cardClass}>
           <div className="bg-orange-100 p-3 rounded-xl"><User className="w-6 h-6 text-orange-600" /></div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal / Individual</p>
             <p className="text-3xl font-black text-slate-900 italic tracking-tighter">${personalTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
           </div>
           <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-600 h-full" style={{ width: `${(personalTotal/grandTotal)*100}%` }}></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8 border-b-2 border-slate-50 pb-6">
                <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center">
                    <PieIcon className="w-5 h-5 mr-3 text-indigo-600" /> Categorical Breakdown
                </h3>
            </div>
            <div className="h-80">
                <ExpensesChartClient data={chartData} />
            </div>
        </div>

        <div className="bg-white border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] rounded-3xl p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b-2 border-slate-50 pb-6">
                <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center">
                    <ReceiptText className="w-5 h-5 mr-3 text-indigo-600" /> Recent Engage Records
                </h3>
                <Link href="/reports/master-ledger" className="text-[10px] font-black uppercase text-indigo-600 hover:underline flex items-center">
                    Full Ledger <ArrowRight className="w-3 h-3 ml-2" />
                </Link>
            </div>
            <div className="flex-1 space-y-4">
                {entries.slice(0, 5).map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 font-mono italic">{new Date(e.date).toISOString().split('T')[0]}</span>
                            <span className="text-xs font-black text-slate-900 uppercase italic tracking-tighter underline decoration-2 decoration-slate-100 underline-offset-4">{e.payee || "INTERNAL"}</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-sm font-black text-red-600 italic tracking-tighter">-${Math.abs(Number(e.amount)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">{e.expenseCategory?.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
