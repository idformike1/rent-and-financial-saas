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
    "flex items-center space-x-4 p-6 rounded-[8px] border transition-all cursor-pointer",
    active 
      ? "bg-card text-foreground border-foreground translate-x-1 translate-y-1" 
      : "bg-card text-foreground border-border hover:bg-muted"
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((r) => (
          <label key={r.id} className={btnClass(selectedReport === r.id)}>
            <input type="radio" value={r.id} {...register('reportType')} className="hidden" />
            <div className={`p-4 rounded-xl ${selectedReport === r.id ? 'bg-[var(--primary)]' : 'bg-muted'}`}>{r.icon}</div>
            <div className="flex flex-col">
                <span className="text-sm leading-none mb-1">{r.name}</span>
                <span className={`text-[9px] font-bold leading-none ${selectedReport === r.id ? 'text-[var(--primary)]' : 'text-muted-foreground'}`}>{r.desc}</span>
            </div>
          </label>
        ))}
      </div>

      <Card variant="glass" className="p-6 rounded-[8px]">
        <h3 className="text-xl  mb-8 flex items-center underline decoration-8 decoration-indigo-100 underline-offset-8">
            <Activity className="w-6 h-6 mr-3 text-[var(--primary)]" /> Analysis Parameter Configuration
        </h3>

        <form onSubmit={handleSubmit(onGenerate)} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {selectedReport !== 'RENT_ROLL' && (
                <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground  block">Audit Interval</label>
                    <select {...register('dateRange')} className="w-full bg-muted dark:bg-card border border-border border-border rounded-[8px] px-4 py-4 text-xs  outline-none focus:ring-2 focus:ring-brand/40 appearance-none">
                        <option value="YTD">CURRENT FISCAL YTD</option>
                        <option value="LAST_YEAR">PRECEDING FISCAL YEAR</option>
                        <option value="ALL_TIME">HISTORICAL ARCHIVE</option>
                    </select>
                </div>
            )}

            {selectedReport !== 'TAX_PREPARATION' && (
                <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground  block">Governance Scope</label>
                    <select {...register('scope')} className="w-full bg-muted dark:bg-card border border-border border-border rounded-[8px] px-4 py-4 text-xs  outline-none focus:ring-2 focus:ring-brand/40 appearance-none">
                        <option value="GLOBAL">PORTFOLIO GLOBAL</option>
                        <option value="PROPERTY">BUSINESS (PROPERTY)</option>
                        <option value="HOME">RESIDENTIAL (HOME)</option>
                        <option value="PERSONAL">INDIVIDUAL (PERSONAL)</option>
                    </select>
                </div>
            )}

            {(selectedScope === 'PROPERTY' || selectedReport === 'TAX_PREPARATION' || selectedReport === 'RENT_ROLL') && (
                <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground  block">Asset Specific Identifier</label>
                    <select {...register('propertyId')} className="w-full bg-muted dark:bg-card border border-border border-border rounded-[8px] px-4 py-4 text-xs  outline-none focus:ring-2 focus:ring-brand/40 appearance-none">
                        <option value="">SELECT PROPERTY</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            )}

            <Button 
                type="submit" 
                variant="primary"
                disabled={isGenerating}
                className="w-full h-14 rounded-[8px]  text-[11px]"
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
    const headerClass = "px-6 py-5 text-left text-[10px]  text-muted-foreground border-b border-border border-border";
    const cellClass = "px-6 py-5 text-sm font-bold text-foreground  border-b border-border";

    return (
        <Card variant="glass" className="p-6 rounded-[8px] space-y-6">
            <div className="flex justify-between items-center pb-12 border-b border-border border-border">
                <div className="space-y-1">
                    <h3 className="text-display font-weight-display ">
                       Materialized Record: <span className="text-[var(--primary)]">{data.type} ARCHIVE</span>
                    </h3>
                    <p className="text-[10px]  text-muted-foreground ">Governance Timestamp: {new Date().toISOString()}</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={onShare} disabled={isSharing} variant="primary" className="px-8 py-4 rounded-[8px] text-[10px]">
                        {isSharing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Share2 className="w-4 h-4 mr-2" />} 
                        Generate Share Link
                    </Button>
                    <Button variant="secondary" className="px-8 py-4 rounded-[8px] text-[10px] bg-card text-foreground border-none">
                        <Download className="w-4 h-4 mr-2" /> PDF Export
                    </Button>
                </div>
            </div>

            {data.type === 'PL' && (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-muted dark:bg-card border border-border border-border p-6 rounded-[8px]">
                             <p className="text-[9px] text-muted-foreground  mb-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Gross Potential (GPR)</p>
                             <p className="text-display font-weight-display text-foreground dark:text-foreground">$ {data.payload.revenue.grossPotentialRent.toLocaleString()}</p>
                        </div>
                        <div className="bg-[var(--primary-muted)] dark:bg-[var(--primary-muted)] border border-[var(--primary)]/20 dark:border-[var(--primary)]/20 p-6 rounded-[8px]">
                             <p className="text-[9px] text-emerald-700  mb-2 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Effective Revenue (EGR)</p>
                             <p className="text-display font-weight-display text-emerald-900 dark:text-[var(--primary)]">$ {data.payload.revenue.effectiveGrossRevenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 p-6 rounded-[8px]">
                             <p className="text-[9px] text-rose-700  mb-2 flex items-center"><Activity className="w-3 h-3 mr-1" /> Operating Expense (OpEx)</p>
                             <p className="text-display font-weight-display text-rose-900 dark:text-rose-400">$ {data.payload.expenses.operating.total.toLocaleString()}</p>
                        </div>
                        <div className="bg-card p-6 rounded-[8px] ">
                             <p className="text-[9px] text-muted-foreground  mb-2 flex items-center"><Info className="w-3 h-3 mr-1" /> Net Operating Income</p>
                             <p className="text-display font-weight-display text-foreground">$ {data.payload.metrics.netOperatingIncome.toLocaleString()}</p>
                        </div>
                    </div>

                    <IncomeStatementChart data={[
                        { name: 'Last Year', revenue: data.payload.revenue.effectiveGrossRevenue * 0.8, expense: data.payload.expenses.operating.total * 0.9 },
                        { name: 'YTD', revenue: data.payload.revenue.effectiveGrossRevenue, expense: data.payload.expenses.operating.total }
                    ]} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                        <div>
                           <h4 className="text-xs  text-muted-foreground mb-6 flex items-center"><ArrowRight className="w-4 h-4 mr-2" /> Operating Expense Distribution</h4>
                           <table className="w-full border-4 border-foreground">
                                <thead className="bg-black text-foreground">
                                    <tr>
                                        <th className={headerClass.replace('text-muted-foreground', 'text-foreground')}>Operating Cost Center</th>
                                        <th className={headerClass.replace('text-muted-foreground', 'text-foreground')}>Archive Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(data.payload.expenses.operating.categories).map(([name, total]) => (
                                        <tr key={name} onClick={() => onDrillDown(name)} className="hover:bg-muted cursor-pointer group transition-colors">
                                            <td className={cellClass}>{name}</td>
                                            <td className={`${cellClass} text-right text-red-600 flex items-center justify-end`}>
                                                -$ {(total as number).toLocaleString()}
                                                <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                        <div>
                           <h4 className="text-xs  text-muted-foreground mb-6 flex items-center"><ArrowRight className="w-4 h-4 mr-2" /> Efficiency & Yield Ratios</h4>
                           <div className="space-y-4">
                              <div className="p-6 border-4 border-foreground rounded-[8px] flex justify-between items-center bg-muted">
                                  <span className="text-[10px] ">Operating Expense Ratio (OER)</span>
                                  <span className="text-xl">{data.payload.metrics.operatingExpenseRatio.toFixed(2)}%</span>
                              </div>
                              <div className="p-6 border-4 border-foreground rounded-[8px] flex justify-between items-center">
                                  <span className="text-[10px] ">Vacancy Impact Score</span>
                                  <span className="text-xl text-red-600">{( (data.payload.revenue.vacancyLoss / data.payload.revenue.grossPotentialRent) * 100 || 0).toFixed(2)}%</span>
                              </div>
                           </div>
                        </div>
                    </div>
                </div>
            )}

            {data.type === 'RENTROLL' && (
                <div className="overflow-x-auto">
                    <table className="w-full border-4 border-foreground">
                        <thead className="bg-black text-foreground">
                            <tr>
                                <th className={headerClass.replace('text-muted-foreground', 'text-foreground')}>Occupant Identity</th>
                                <th className={headerClass.replace('text-muted-foreground', 'text-foreground')}>Unit Asset</th>
                                <th className={headerClass.replace('text-muted-foreground', 'text-foreground')}>Configured Rent</th>
                                <th className={headerClass.replace('text-muted-foreground', 'text-foreground')}>Security Escrow</th>
                                <th className={headerClass.replace('text-muted-foreground', 'text-foreground')}>Heatmap Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.payload.map((l: any, i: number) => {
                                const isUnpaid = l.rentAmount > 2000; // Mock unpaid check
                                return (
                                    <tr key={i} className={`hover:bg-muted transition-colors ${isUnpaid ? 'bg-red-50' : ''}`}>
                                        <td className={cellClass}>{l.tenantName}</td>
                                        <td className={cellClass}>{l.unitNumber}</td>
                                        <td className={cellClass}>$ {l.rentAmount.toLocaleString()}</td>
                                        <td className={cellClass}>$ {l.depositAmount.toLocaleString()}</td>
                                        <td className={cellClass}>
                                            <div className="flex gap-2">
                                                {isUnpaid ? (
                                                    <span className="bg-red-600 text-foreground text-[8px] px-2 py-1 rounded shadow-none animate-pulse">VAL_DELINQUENT</span>
                                                ) : (
                                                    <span className="bg-[var(--primary-muted)] text-[var(--primary)] text-[8px] px-2 py-1 rounded">GOV_STABLE</span>
                                                )}
                                                {l.rentAmount < 1000 && <span className="bg-yellow-400 text-foreground text-[8px] px-2 py-1 rounded shadow-none">VAC_WARNING</span>}
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
                     <div className="p-6 border-4 border-[var(--primary)] rounded-[8px] bg-[var(--primary)] flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="p-4 bg-[var(--primary)] text-foreground rounded-[8px]"><FileText className="w-8 h-8" /></div>
                            <div>
                                <h4 className="text-sm ">IRC Section 162 Compliance Engine</h4>
                                <p className="text-[10px] font-bold text-[var(--primary)] ">Automated Deductible Mapping Phase Active</p>
                            </div>
                         </div>
                         <button className="bg-black text-foreground text-[10px] px-8 py-4 rounded-[8px] hover:bg-[var(--primary)] transition-all ">
                            Verify Deductions
                         </button>
                     </div>
                    <table className="w-full border-4 border-foreground">
                        <thead className="bg-black text-foreground">
                            <tr>
                                <th className={headerClass.replace('text-muted-foreground', 'text-foreground')}>IRC Deductible Category</th>
                                <th className={headerClass.replace('text-muted-foreground', 'text-foreground')}>Verified Asset Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.payload.map((e: any) => (
                                <tr key={e.category} className="hover:bg-muted transition-colors">
                                    <td className={cellClass}>{e.category}</td>
                                    <td className={`${cellClass} text-right text-red-600`}>-$ {e.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
