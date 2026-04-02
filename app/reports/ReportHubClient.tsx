'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getProfitAndLoss, getRentRoll, getTaxPrep } from '@/actions/reports.actions'
import { Loader2, PieChart, Landmark, FileText, Activity, AlertCircle, CheckCircle, Download, Database } from 'lucide-react'
import { toast } from '@/lib/toast'

const reportParamsSchema = z.object({
  reportType: z.enum(['INCOME_STATEMENT', 'RENT_ROLL', 'TAX_PREPARATION', 'MASTER_LEDGER']),
  dateRange: z.enum(['YTD', 'LAST_YEAR', 'ALL_TIME']),
  scope: z.enum(['GLOBAL', 'PROPERTY', 'HOME', 'PERSONAL']),
  propertyId: z.string().optional(),
});

type ReportParams = z.infer<typeof reportParamsSchema>;

export default function ReportHubClient({ properties }: { properties: any[] }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const { register, watch, handleSubmit, formState: { errors } } = useForm<ReportParams>({
    resolver: zodResolver(reportParamsSchema),
    defaultValues: {
      reportType: 'INCOME_STATEMENT',
      dateRange: 'YTD',
      scope: 'GLOBAL'
    }
  });

  const selectedReport = watch('reportType');
  const selectedScope = watch('scope');

  async function onGenerate(params: ReportParams) {
    setIsGenerating(true);
    setReportData(null);
    try {
      if (params.reportType === 'INCOME_STATEMENT') {
        const data = await getProfitAndLoss(params.dateRange, params.scope, params.propertyId);
        setReportData({ type: 'PL', payload: data });
      } else if (params.reportType === 'RENT_ROLL') {
        const data = await getRentRoll(params.propertyId);
        setReportData({ type: 'RENTROLL', payload: data });
      } else if (params.reportType === 'TAX_PREPARATION') {
        const year = params.dateRange === 'LAST_YEAR' ? new Date().getFullYear() - 1 : new Date().getFullYear();
        const data = await getTaxPrep(year, params.propertyId);
        setReportData({ type: 'TAX', payload: data });
      }
      toast.success("Analytics Materialized Successfully");
    } catch (e: any) {
      toast.error(`ERROR: ${e.message || "Failed to generate report"}`);
    } finally {
      setIsGenerating(false);
    }
  }

  const reports = [
    { id: 'INCOME_STATEMENT', name: 'Income Statement', icon: <PieChart className="w-5 h-5" />, desc: 'Standard P&L (Income vs Expenses)' },
    { id: 'RENT_ROLL', name: 'Rent Roll Registry', icon: <Landmark className="w-5 h-5" />, desc: 'Unit-by-unit lease visualization' },
    { id: 'TAX_PREPARATION', name: 'IRC Tax Portfolio', icon: <FileText className="w-5 h-5" />, desc: 'Tax-categorized property expenses' },
    { id: 'MASTER_LEDGER', name: 'The Immutable Ledger', icon: <Activity className="w-5 h-5" />, desc: 'Raw chronological audit log' },
  ] as const;

  const btnClass = (active: boolean) => `flex items-center space-x-4 p-6 rounded-2xl border-4 transition-all ${
    active ? 'bg-indigo-600 text-white border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] translate-x-1 translate-y-1' : 'bg-white text-slate-900 border-slate-900 hover:bg-slate-50'
  }`;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((r) => (
          <label key={r.id} className={btnClass(selectedReport === r.id)}>
            <input type="radio" value={r.id} {...register('reportType')} className="hidden" />
            <div className={`p-4 rounded-xl ${selectedReport === r.id ? 'bg-white/20' : 'bg-slate-50'}`}>{r.icon}</div>
            <div className="flex flex-col">
                <span className="text-sm font-black uppercase italic tracking-tighter leading-none mb-1">{r.name}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest leading-none ${selectedReport === r.id ? 'text-indigo-200' : 'text-slate-400'}`}>{r.desc}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="bg-white border-4 border-slate-900 shadow-[14px_14px_0px_0px_rgba(15,23,42,1)] rounded-3xl p-10 ring-12 ring-slate-50 ring-inset">
        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center underline decoration-4 decoration-indigo-100 italic underline-offset-8">
            <Activity className="w-6 h-6 mr-3 text-indigo-600" /> Analysis Parameter Configuration
        </h3>

        <form onSubmit={handleSubmit(onGenerate)} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            
            {/* Dynamic Param Logic */}
            {selectedReport !== 'RENT_ROLL' && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Audit Interval</label>
                    <select {...register('dateRange')} className="w-full bg-white border-4 border-slate-900 rounded-xl px-4 py-3 text-sm font-black italic uppercase tracking-tighter outline-none focus:border-indigo-600 transition-all appearance-none">
                        <option value="YTD">CURRENT FISCAL YTD</option>
                        <option value="LAST_YEAR">PRECEDING FISCAL YEAR</option>
                        <option value="ALL_TIME">HISTORICAL ARCHIVE</option>
                    </select>
                </div>
            )}

            {selectedReport !== 'TAX_PREPARATION' && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Governance Scope</label>
                    <select {...register('scope')} className="w-full bg-white border-4 border-slate-900 rounded-xl px-4 py-3 text-sm font-black italic uppercase tracking-tighter outline-none focus:border-indigo-600 transition-all appearance-none">
                        <option value="GLOBAL">PORTFOLIO GLOBAL</option>
                        <option value="PROPERTY">BUSINESS (PROPERTY)</option>
                        <option value="HOME">RESIDENTIAL (HOME)</option>
                        <option value="PERSONAL">INDIVIDUAL (PERSONAL)</option>
                    </select>
                </div>
            )}

            {(selectedScope === 'PROPERTY' || selectedReport === 'TAX_PREPARATION' || selectedReport === 'RENT_ROLL') && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Asset Specific Identifier</label>
                    <select {...register('propertyId')} className="w-full bg-white border-4 border-slate-900 rounded-xl px-4 py-3 text-sm font-black italic uppercase tracking-tighter outline-none focus:border-indigo-600 transition-all appearance-none">
                        <option value="">SELECT PROPERTY</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            )}

            <button 
                type="submit" 
                disabled={isGenerating}
                className="w-full bg-slate-900 text-white font-black h-12 rounded-xl shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase tracking-[0.2em] text-[10px] italic flex items-center justify-center group"
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : <Database className="w-4 h-4 mr-3 text-indigo-400 group-hover:rotate-12 transition-transform" /> }
                {isGenerating ? "QUERYING ANALYTICS" : "Launch Engine Analysis"}
            </button>
        </form>
      </div>


      {reportData && <ReportViewer data={reportData} />}
    </div>
  )
}

function ReportViewer({ data }: { data: { type: string, payload: any } }) {
    const headerClass = "px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b-4 border-slate-900";
    const cellClass = "px-6 py-5 text-sm font-bold text-slate-900 uppercase italic tracking-tighter border-b border-slate-100";

    return (
        <div className="bg-white border-4 border-slate-900 shadow-[18px_18px_0px_0px_rgba(15,23,42,1)] rounded-3xl overflow-hidden p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex justify-between items-center mb-8 pb-8 border-b-4 border-slate-900">
                <h3 className="text-2xl font-black italic uppercase italic tracking-tighter">
                   Generation Result: <span className="text-indigo-600">{data.type} ARCHIVE</span>
                </h3>
                <div className="flex gap-4">
                    <button className="bg-slate-900 text-white text-[10px] font-black px-6 py-3 rounded-xl hover:bg-indigo-600 transition-all uppercase tracking-widest italic flex items-center">
                        <Download className="w-4 h-4 mr-2" /> PDF Archive
                    </button>
                    <button className="bg-white border-4 border-slate-900 text-slate-900 text-[10px] font-black px-6 py-3 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest italic flex items-center">
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </button>
                </div>
            </div>

            {data.type === 'PL' && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="bg-green-50 border-4 border-green-200 p-8 rounded-2xl">
                             <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Total Gross Income</p>
                             <p className="text-4xl font-black text-green-900 italic tracking-tighter">$ {data.payload.income.toLocaleString()}</p>
                        </div>
                        <div className="bg-red-50 border-4 border-red-200 p-8 rounded-2xl">
                             <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-2">Total Expenditures</p>
                             <p className="text-4xl font-black text-red-900 italic tracking-tighter">$ {data.payload.totalExpenses.toLocaleString()}</p>
                        </div>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-900 text-white">
                            <tr>
                                <th className={headerClass.replace('text-slate-400', 'text-slate-200')}>Category Definition</th>
                                <th className={headerClass.replace('text-slate-400', 'text-slate-200')}>Numerical Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.payload.expenses.map((e: any) => (
                                <tr key={e.name} className="hover:bg-slate-50 group">
                                    <td className={cellClass}>{e.name}</td>
                                    <td className={`${cellClass} text-right text-red-600 font-mono tracking-tighter`}>-$ {e.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {data.type === 'RENTROLL' && (
                <table className="w-full">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            <th className={headerClass.replace('text-slate-400', 'text-slate-200')}>Occupant Name</th>
                            <th className={headerClass.replace('text-slate-400', 'text-slate-200')}>Unit ID</th>
                            <th className={headerClass.replace('text-slate-400', 'text-slate-200')}>Base Rent</th>
                            <th className={headerClass.replace('text-slate-400', 'text-slate-200')}>Deposit Escrow</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.payload.map((l: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50 group">
                                <td className={cellClass}>{l.tenantName}</td>
                                <td className={cellClass}>{l.unitNumber}</td>
                                <td className={cellClass}>$ {l.rentAmount.toLocaleString()}</td>
                                <td className={cellClass}>$ {l.depositAmount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {data.type === 'TAX' && (
                <table className="w-full">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            <th className={headerClass.replace('text-slate-400', 'text-slate-200')}>IRC Standard Category</th>
                            <th className={headerClass.replace('text-slate-400', 'text-slate-200')}>Deductible Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.payload.map((e: any) => (
                            <tr key={e.category} className="hover:bg-slate-50 group">
                                <td className={cellClass}>{e.category}</td>
                                <td className={`${cellClass} text-right text-red-600 font-mono italic`}>-$ {e.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
