import prisma from '@/lib/prisma'
import { AccountCategory } from '@prisma/client'
import Link from 'next/link'
import { PieChart, Plus, ReceiptText, TrendingDown } from 'lucide-react'

export default async function ExpensesDashboard() {
  const expenseAccounts = await prisma.account.findMany({
    where: { category: AccountCategory.EXPENSE },
    include: {
      entries: {
        orderBy: { date: 'desc' }
      }
    }
  });

  const totalsByCategory = expenseAccounts.map(account => {
    const total = account.entries.reduce((sum, entry) => sum + entry.amount.toNumber(), 0);
    return { name: account.name, total, entries: account.entries };
  }).filter(t => t.total > 0 || t.entries.length > 0);

  const totalExpense = totalsByCategory.reduce((acc, cat) => acc + cat.total, 0);

  // Flatten entries for the table
  const allEntries = totalsByCategory.flatMap(cat => 
    cat.entries.map(e => ({ ...e, accountName: cat.name }))
  ).sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <TrendingDown className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Operational Expenses</h1>
          </div>
          <p className="text-slate-500 font-medium">Categorical breakdown and audit log of all property expenditures.</p>
        </div>
        <Link 
          href="/treasury/expenses" 
          className="bg-slate-900 text-white font-black px-6 py-4 rounded-xl shadow-[6px_6px_0px_0px_rgba(203,213,225,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase tracking-widest text-xs flex items-center"
        >
          <Plus className="w-4 h-4 mr-3" /> Log New Expense
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="col-span-1 md:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-center border-l-4 border-l-red-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Expenditures</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">${totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {totalsByCategory.slice(0, 3).map(cat => (
             <div key={cat.name} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 truncate">{cat.name}</p>
               <p className="text-2xl font-black text-slate-900 tracking-tighter">${cat.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
             </div>
          ))}
        </div>
      </div>

      <div className="bg-white border text-slate-900 border-slate-200 shadow-sm rounded-3xl overflow-hidden p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center">
            <ReceiptText className="w-5 h-5 mr-3 text-slate-400" /> Expense Registry Log
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
               <tr>
                 <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                 <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                 <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                 <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
               {allEntries.length === 0 ? (
                 <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No operational expenses recorded.</td></tr>
               ) : (
                allEntries.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(e.date).toISOString().split('T')[0]}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">{e.accountName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-sm truncate text-slate-700">{e.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-black text-red-600 tracking-tight">$ {e.amount.toNumber().toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                ))
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
