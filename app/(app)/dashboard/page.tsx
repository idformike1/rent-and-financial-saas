import { Card, Badge, Button, RollingCounter } from '@/components/ui-finova'
import { Activity, Zap, TrendingUp } from 'lucide-react'
import ExportControls from '@/components/ExportControls'

export default async function FinovaDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
             Treasury <span className="text-brand">Oversight</span>
           </h1>
           <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Axiom 2026 Core Infrastructure Active</p>
        </div>
        <div className="flex gap-4 items-center">
           <ExportControls />
           <Badge variant="brand" className="rounded-xl px-3 py-1"><Zap size={14} className="mr-2" /> Live Ledger V.3.1</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue', val: 78500, color: 'text-brand', icn: TrendingUp },
          { label: 'Operating Income', val: 42300, color: 'text-emerald-500', icn: Activity },
          { label: 'Liquidity', val: 98.4, color: 'text-indigo-500', icn: Zap, suffix: "%" }
        ].map((s) => (
          <Card key={s.label} variant="glass" className="finova-glass p-6 md:p-8 rounded-3xl flex flex-col justify-between min-h-[180px]">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
               <s.icn className="w-5 h-5 text-slate-400" />
            </div>
            <h2 className={`text-3xl md:text-4xl font-black tracking-tighter ${s.color} italic leading-none`}>
               <RollingCounter value={s.val} prefix={s.suffix ? "" : "$"} suffix={s.suffix || ""} />
            </h2>
          </Card>
        ))}
      </div>
    </div>
  )
}
