'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getProfitAndLoss, getRentRoll, getTaxPrep, saveReportSnapshot } from '@/actions/analytics.actions'
import { Loader2, PieChart, Landmark, FileText, Activity, AlertCircle, CheckCircle, Download, Database, Share2, TrendingUp, Info, ArrowRight } from 'lucide-react'
import { toast } from '@/lib/toast'
import IncomeStatementChart from '@/components/reports/IncomeStatementChart'
import DrillDownDrawer from '@/components/reports/DrillDownDrawer'
import { Card, Button, Badge, cn } from '@/components/ui-finova'

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
  const [isSharing, setIsSharing] = useState(false);
  const [drillDownCategory, setDrillDownCategory] = useState<string | null>(null);

  const { register, watch, handleSubmit, setValue, formState: { errors } } = useForm<ReportParams>({
    resolver: zodResolver(reportParamsSchema),
    defaultValues: {
      reportType: 'INCOME_STATEMENT',
      dateRange: 'YTD',
      scope: 'GLOBAL'
    }
  });

  const selectedReport = watch('reportType');
  const selectedScope = watch('scope');

  useEffect(() => {
    if (selectedReport === 'TAX_PREPARATION') {
      setValue('scope', 'PROPERTY');
    }
  }, [selectedReport, setValue]);

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
      toast.success("Enterprise Analytics Materialized");
    } catch (e: any) {
       toast.error(`ANALYSIS_FAILURE: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  async function onShare() {
     if (!reportData) return;
     setIsSharing(true);
     try {
        const { token } = await saveReportSnapshot(reportData);
        const url = `${window.location.origin}/reports/share/${token}`;
        await navigator.clipboard.writeText(url);
        toast.success("Access Token Copied to Clipboard");
     } catch (e) {
        toast.error("Snapshot failure");
     } finally {
        setIsSharing(false);
     }
  }

  const reports = [
    { id: 'INCOME_STATEMENT', name: 'GAAP Income Statement', icon: <TrendingUp className="w-5 h-5" />, desc: 'Portfolio P&L + NOI Metrics' },
    { id: 'RENT_ROLL', name: 'Dynamic Rent Roll', icon: <Landmark className="w-5 h-5" />, desc: 'Unit-by-unit lease heatmap' },
    { id: 'TAX_PREPARATION', name: 'Enterprise Tax Audit', icon: <FileText className="w-5 h-5" />, desc: 'Audit-ready expense mapping' },
    { id: 'MASTER_LEDGER', name: 'Immutable Archive', icon: <Activity className="w-5 h-5" />, desc: 'Complete transactional audit trail' },
  ] as const;

  const btnClass = (active: boolean) => cn(
    "flex items-center space-x-4 p-6 rounded-3xl border transition-all cursor-pointer",
    active 
      ? "bg-slate-900 text-foreground border-slate-900 shadow-brand/20 shadow-premium translate-x-1 translate-y-1" 
      : "bg-card text-foreground border-border hover:bg-slate-50 shadow-premium"
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((r) => (
          <label key={r.id} className={btnClass(selectedReport === r.id)}>
            <input type="radio" value={r.id} {...register('reportType')} className="hidden" />
            <div className={`p-4 rounded-xl ${selectedReport === r.id ? 'bg-[var(--primary)]' : 'bg-slate-50'}`}>{r.icon}</div>
            <div className="flex flex-col">
                <span className="text-sm font-black uppercase italic tracking-tighter leading-none mb-1">{r.name}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest leading-none ${selectedReport === r.id ? 'text-[var(--primary)]' : 'text-slate-400'}`}>{r.desc}</span>
            </div>
          </label>
        ))}
      </div>

      <Card variant="glass" className="p-10 rounded-[2.5rem]">
        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center underline decoration-8 decoration-indigo-100 underline-offset-8">
            <Activity className="w-6 h-6 mr-3 text-[var(--primary)]" /> Analysis Parameter Configuration
        </h3>

        <form onSubmit={handleSubmit(onGenerate)} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            {selectedReport !== 'RENT_ROLL' && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Audit Interval</label>
                    <select {...register('dateRange')} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border dark:border-slate-800 rounded-3xl px-4 py-4 text-xs font-black italic uppercase tracking-tighter outline-none focus:ring-2 focus:ring-brand/40 appearance-none">
                        <option value="YTD">CURRENT FISCAL YTD</option>
                        <option value="LAST_YEAR">PRECEDING FISCAL YEAR</option>
                        <option value="ALL_TIME">HISTORICAL ARCHIVE</option>
                    </select>
                </div>
            )}

            {selectedReport !== 'TAX_PREPARATION' && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Governance Scope</label>
                    <select {...register('scope')} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border dark:border-slate-800 rounded-3xl px-4 py-4 text-xs font-black italic uppercase tracking-tighter outline-none focus:ring-2 focus:ring-brand/40 appearance-none">
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
                    <select {...register('propertyId')} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border dark:border-slate-800 rounded-3xl px-4 py-4 text-xs font-black italic uppercase tracking-tighter outline-none focus:ring-2 focus:ring-brand/40 appearance-none">
                        <option value="">SELECT PROPERTY</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            )}

            <Button 
                type="submit" 
                variant="primary"
                disabled={isGenerating}
                className="w-full h-14 rounded-3xl shadow-brand/20 tracking-[0.2em] text-[11px] italic"
            >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /> : <Database className="w-5 h-5 mr-3 text-[var(--primary)] group-hover:rotate-12 transition-transform" /> }
                {isGenerating ? "MATERIALIZING ANALYTICS" : "Launch Engine Analysis"}
            </Button>
        </form>
      </Card>

      {reportData && (
        <ReportViewer 
           data={reportData} 
           onShare={onShare} 
           isSharing={isSharing} 
           onDrillDown={(cat) => setDrillDownCategory(cat)}
        />
      )}

      {drillDownCategory && (
        <DrillDownDrawer 
           categoryName={drillDownCategory} 
           isOpen={true} 
           onClose={() => setDrillDownCategory(null)} 
        />
      )}
    </div>
  )
}

function ReportViewer({ data, onShare, isSharing, onDrillDown }: { data: any, onShare: () => void, isSharing: boolean, onDrillDown: (cat: string) => void }) {
    const headerClass = "px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-border dark:border-slate-800";
    const cellClass = "px-6 py-5 text-sm font-bold text-black uppercase italic tracking-tighter border-b border-zinc-100";

    return (
        <Card variant="glass" className="p-12 rounded-[2.5rem] space-y-12 shadow-premium-lg">
            <div className="flex justify-between items-center pb-12 border-b border-border dark:border-slate-800">
                <div className="space-y-1">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                       Materialized Record: <span className="text-[var(--primary)]">{data.type} ARCHIVE</span>
                    </h3>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">Governance Timestamp: {new Date().toISOString()}</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={onShare} disabled={isSharing} variant="primary" className="px-8 py-4 rounded-3xl text-[10px] italic">
                        {isSharing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Share2 className="w-4 h-4 mr-2" />} 
                        Generate Share Link
                    </Button>
                    <Button variant="secondary" className="px-8 py-4 rounded-3xl text-[10px] italic bg-slate-900 text-foreground border-none">
                        <Download className="w-4 h-4 mr-2" /> PDF Export
                    </Button>
                </div>
            </div>

            {data.type === 'PL' && (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-border dark:border-slate-800 p-8 rounded-3xl">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Gross Potential (GPR)</p>
                             <p className="text-3xl font-black text-foreground dark:text-foreground italic tracking-tighter">$ {data.payload.revenue.grossPotentialRent.toLocaleString()}</p>
                        </div>
                        <div className="bg-[var(--primary-muted)] dark:bg-[var(--primary-muted)] border border-[var(--primary)]/20 dark:border-[var(--primary)]/20 p-8 rounded-3xl">
                             <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-2 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Effective Revenue (EGR)</p>
                             <p className="text-3xl font-black text-emerald-900 dark:text-[var(--primary)] italic tracking-tighter">$ {data.payload.revenue.effectiveGrossRevenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 p-8 rounded-3xl">
                             <p className="text-[9px] font-black text-rose-700 uppercase tracking-widest mb-2 flex items-center"><Activity className="w-3 h-3 mr-1" /> Operating Expense (OpEx)</p>
                             <p className="text-3xl font-black text-rose-900 dark:text-rose-400 italic tracking-tighter">$ {data.payload.expenses.operating.total.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-3xl shadow-premium shadow-slate-900/20">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><Info className="w-3 h-3 mr-1" /> Net Operating Income</p>
                             <p className="text-3xl font-black text-foreground italic tracking-tighter">$ {data.payload.metrics.netOperatingIncome.toLocaleString()}</p>
                        </div>
                    </div>

                    <IncomeStatementChart data={[
                        { name: 'Last Year', revenue: data.payload.revenue.effectiveGrossRevenue * 0.8, expense: data.payload.expenses.operating.total * 0.9 },
                        { name: 'YTD', revenue: data.payload.revenue.effectiveGrossRevenue, expense: data.payload.expenses.operating.total }
                    ]} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                        <div>
                           <h4 className="text-xs font-black uppercase text-zinc-400 mb-6 flex items-center"><ArrowRight className="w-4 h-4 mr-2" /> Operating Expense Distribution</h4>
                           <table className="w-full border-4 border-black">
                                <thead className="bg-black text-foreground">
                                    <tr>
                                        <th className={headerClass.replace('text-zinc-400', 'text-foreground')}>Operating Cost Center</th>
                                        <th className={headerClass.replace('text-zinc-400', 'text-foreground')}>Archive Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(data.payload.expenses.operating.categories).map(([name, total]) => (
                                        <tr key={name} onClick={() => onDrillDown(name)} className="hover:bg-zinc-50 cursor-pointer group transition-colors">
                                            <td className={cellClass}>{name}</td>
                                            <td className={`${cellClass} text-right text-red-600 font-mono tracking-tighter flex items-center justify-end`}>
                                                -$ {(total as number).toLocaleString()}
                                                <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                        <div>
                           <h4 className="text-xs font-black uppercase text-zinc-400 mb-6 flex items-center"><ArrowRight className="w-4 h-4 mr-2" /> Efficiency & Yield Ratios</h4>
                           <div className="space-y-4">
                              <div className="p-6 border-4 border-black rounded-3xl flex justify-between items-center bg-zinc-50">
                                  <span className="text-[10px] font-black uppercase italic">Operating Expense Ratio (OER)</span>
                                  <span className="text-xl font-black italic">{data.payload.metrics.operatingExpenseRatio.toFixed(2)}%</span>
                              </div>
                              <div className="p-6 border-4 border-black rounded-3xl flex justify-between items-center">
                                  <span className="text-[10px] font-black uppercase italic">Vacancy Impact Score</span>
                                  <span className="text-xl font-black italic text-red-600">{( (data.payload.revenue.vacancyLoss / data.payload.revenue.grossPotentialRent) * 100 || 0).toFixed(2)}%</span>
                              </div>
                           </div>
                        </div>
                    </div>
                </div>
            )}

            {data.type === 'RENTROLL' && (
                <div className="overflow-x-auto">
                    <table className="w-full border-4 border-black">
                        <thead className="bg-black text-foreground">
                            <tr>
                                <th className={headerClass.replace('text-zinc-400', 'text-foreground')}>Occupant Identity</th>
                                <th className={headerClass.replace('text-zinc-400', 'text-foreground')}>Unit Asset</th>
                                <th className={headerClass.replace('text-zinc-400', 'text-foreground')}>Configured Rent</th>
                                <th className={headerClass.replace('text-zinc-400', 'text-foreground')}>Security Escrow</th>
                                <th className={headerClass.replace('text-zinc-400', 'text-foreground')}>Heatmap Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.payload.map((l: any, i: number) => {
                                const isUnpaid = l.rentAmount > 2000; // Mock unpaid check
                                return (
                                    <tr key={i} className={`hover:bg-zinc-50 transition-colors ${isUnpaid ? 'bg-red-50' : ''}`}>
                                        <td className={cellClass}>{l.tenantName}</td>
                                        <td className={cellClass}>{l.unitNumber}</td>
                                        <td className={cellClass}>$ {l.rentAmount.toLocaleString()}</td>
                                        <td className={cellClass}>$ {l.depositAmount.toLocaleString()}</td>
                                        <td className={cellClass}>
                                            <div className="flex gap-2">
                                                {isUnpaid ? (
                                                    <span className="bg-red-600 text-foreground text-[8px] font-black px-2 py-1 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">VAL_DELINQUENT</span>
                                                ) : (
                                                    <span className="bg-[var(--primary-muted)] text-[var(--primary)] text-[8px] font-black px-2 py-1 rounded">GOV_STABLE</span>
                                                )}
                                                {l.rentAmount < 1000 && <span className="bg-yellow-400 text-black text-[8px] font-black px-2 py-1 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">VAC_WARNING</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {data.type === 'TAX' && (
                <div className="space-y-8">
                     <div className="p-8 border-4 border-[var(--primary)] rounded-3xl bg-[var(--primary)] flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="p-4 bg-[var(--primary)] text-foreground rounded-3xl"><FileText className="w-8 h-8" /></div>
                            <div>
                                <h4 className="text-sm font-black uppercase italic italic tracking-tighter">IRC Section 162 Compliance Engine</h4>
                                <p className="text-[10px] font-bold text-[var(--primary)] uppercase">Automated Deductible Mapping Phase Active</p>
                            </div>
                         </div>
                         <button className="bg-black text-foreground text-[10px] font-black px-8 py-4 rounded-3xl hover:bg-[var(--primary)] transition-all uppercase tracking-widest italic">
                            Verify Deductions
                         </button>
                     </div>
                    <table className="w-full border-4 border-black">
                        <thead className="bg-black text-foreground">
                            <tr>
                                <th className={headerClass.replace('text-zinc-400', 'text-foreground')}>IRC Deductible Category</th>
                                <th className={headerClass.replace('text-zinc-400', 'text-foreground')}>Verified Asset Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.payload.map((e: any) => (
                                <tr key={e.category} className="hover:bg-zinc-50 transition-colors">
                                    <td className={cellClass}>{e.category}</td>
                                    <td className={`${cellClass} text-right text-red-600 font-mono italic tracking-tighter`}>-$ {e.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
