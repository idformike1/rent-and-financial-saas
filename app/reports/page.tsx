import prisma from '@/lib/prisma'
import ReportHubClient from './ReportHubClient'
import { BrainCircuit, ShieldCheck, History } from 'lucide-react'

export default async function ReportsPage() {
  const properties = await (prisma as any).property.findMany();

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-slate-900 pb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <BrainCircuit className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase underline decoration-4 decoration-indigo-100 underline-offset-8">Intelligence Hub</h1>
          </div>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Strategic Fiscal Analysis & Reporting Engine</p>
        </div>

        <div className="flex items-center gap-3">
             <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                <ShieldCheck className="w-3 h-3 mr-2 text-indigo-600" />
                <span className="text-[8px] font-black uppercase text-indigo-700 tracking-widest leading-none">Status: Analysis Logic Bound</span>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <ReportHubClient properties={properties} />
      </div>

      <div className="bg-slate-900 border-4 border-slate-900 rounded-3xl p-10 flex items-center justify-between shadow-[20px_20px_0px_0px_rgba(79,70,229,0.2)]">
          <div className="flex items-center space-x-6">
             <History className="w-10 h-10 text-indigo-400" />
             <div className="space-y-1">
                <p className="text-white font-black uppercase italic tracking-tighter text-xl leading-none">Predictive Audit Readiness</p>
                <p className="text-slate-500 font-bold text-xs tracking-tight uppercase">Engineered for 100% GAAP compliance and IRS reporting integrity.</p>
             </div>
          </div>
          <button className="bg-white text-slate-900 text-[10px] font-black px-6 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest italic shadow-lg">
             Enter Audit Mode
          </button>
      </div>
    </div>
  )
}
