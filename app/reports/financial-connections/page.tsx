'use client'

import { useState } from 'react'
import { 
  ArrowRight, 
  Database, 
  Activity, 
  Code2, 
  FileJson, 
  Layers, 
  Zap, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building2,
  Users,
  PieChart,
  GitBranch,
  ShieldCheck,
  Terminal,
  Link
} from 'lucide-react'

// GAAP to Axiom Translation Definition Hub
type TranslationNode = {
  id: string;
  label: string;
  gaap_definition: string;
  axiom_model: string;
  axiom_fields: string[];
  server_actions: string[];
  color_css: string;
  icon: any;
  category: 'REVENUE' | 'ASSET' | 'EXPENSE' | 'WATERFALL';
}

const TRANSLATION_MAP: TranslationNode[] = [
  {
    id: 'REVENUE_SALES',
    label: 'Revenue / Sales',
    gaap_definition: 'Income arising in the course of an entity’s ordinary activities. In Axiom, this is the gross realization of all rent and utility charges.',
    axiom_model: "LedgerEntry (categoryId → FinancialLedger.class: 'REVENUE')",
    axiom_fields: ['LedgerEntry.amount', 'FinancialLedger.name: "RENTAL INCOME"', 'Account.category: INCOME'],
    server_actions: ['actions/ledger.actions.ts::processPayment', 'actions/reports.actions.ts::generateGAAPSnpashot'],
    color_css: 'bg-emerald-500',
    icon: TrendingUp,
    category: 'REVENUE'
  },
  {
    id: 'ACCOUNTS_RECEIVABLE',
    label: 'Accounts Receivable (A/R)',
    gaap_definition: 'Assets representing the amount of money owed by customers (tenants) for services provided but not yet paid.',
    axiom_model: 'Tenant.Lease.Charges (Aggregate Unpaid Balance)',
    axiom_fields: ['Charge.amount - Charge.amountPaid', 'Charge.isFullyPaid: false', 'Lease.isActive: true'],
    server_actions: ['actions/tenant-lifecycle.actions.ts::materializeCharges', 'actions/reports.actions.ts::calculateDelinquency'],
    color_css: 'bg-indigo-500',
    icon: Users,
    category: 'ASSET'
  },
  {
    id: 'OPERATING_EXPENSES',
    label: 'Operating Expenses (OPEX)',
    gaap_definition: 'Administrative and operational costs like payroll, utilities, and repairs necessary for property maintenance.',
    axiom_model: "LedgerEntry (categoryId → FinancialLedger.class: 'EXPENSE')",
    axiom_fields: ['LedgerEntry.payee', 'LedgerEntry.receiptUrl', 'FinancialLedger.class: "EXPENSE"'],
    server_actions: ['actions/category.actions.ts::createAccountNode', 'actions/payment.actions.ts::recordBillPayment'],
    color_css: 'bg-rose-500',
    icon: Building2,
    category: 'EXPENSE'
  },
  {
    id: 'WATERFALL_ALGORITHM',
    label: 'Waterfall Algorithm',
    gaap_definition: 'Dynamic priority-based distribution protocol ensuring high-risk liabilities (like Rent) are liquidated before secondary fees.',
    axiom_model: 'Prisma.$transaction (Atomic Multi-Node Mutation)',
    axiom_fields: ['Atomic: Charge Update', 'Atomic: Ledger Entry Materialization', 'Atomic: Audit Log Genesis'],
    server_actions: ['actions/ledger.actions.ts::processPayment'],
    color_css: 'bg-amber-500',
    icon: Zap,
    category: 'WATERFALL'
  }
]

export default function FinanceTranslationHub() {
  const [selected, setSelected] = useState<TranslationNode>(TRANSLATION_MAP[0])

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-12">
      
      {/* HEADER SECTION - BRUTALIST AESTHETIC */}
      <div className="border-b-[12px] border-slate-900 pb-12 relative overflow-hidden group">
        <div className="flex items-center space-x-6 relative z-10">
          <div className="p-4 bg-slate-900 rounded-2xl transform transition-transform group-hover:rotate-12 duration-500">
             <Layers className="w-16 h-16 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-7xl font-black italic tracking-tighter text-slate-900 uppercase">
              Visual Finance Translation Hub
            </h1>
            <div className="flex items-center space-x-4 mt-2">
               <ShieldCheck className="w-5 h-5 text-indigo-600" />
               <p className="text-slate-500 font-black tracking-[0.4em] uppercase text-xs">
                 AXIOM V.3 Architecture ↔ GAAP Regulatory Standards
               </p>
            </div>
          </div>
        </div>
        <div className="absolute right-[-5%] top-0 opacity-5 -z-0">
           <PieChart className="w-96 h-96 text-slate-900" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* PHASE 1: THE GAAP HIERARCHY VISUALIZER (LEFT) */}
        <div className="lg:col-span-7 space-y-8 animate-in slide-in-from-left-8 duration-700">
          <div className="bg-white border-[8px] border-slate-900 rounded-[3rem] p-12 shadow-[24px_24px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-12 flex items-center text-slate-900">
               Hierarchical Translation Map
               <GitBranch className="w-8 h-8 ml-4 text-indigo-600 animate-pulse" />
            </h2>

            <div className="flex flex-col space-y-6 relative">
              <div className="absolute left-[39px] top-10 bottom-10 w-2 bg-slate-100 rounded-full" />
              
              {TRANSLATION_MAP.map((node) => {
                const isActive = selected.id === node.id
                const Icon = node.icon
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelected(node)}
                    className={`flex items-center text-left p-6 rounded-[2rem] border-4 transition-all relative z-10 ${
                      isActive 
                        ? 'bg-slate-900 border-indigo-600 translate-x-8 shadow-2xl scale-105' 
                        : 'bg-slate-50 border-slate-900/5 hover:border-slate-900/40 hover:bg-white hover:translate-x-3'
                    }`}
                  >
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mr-8 transition-all ${
                      isActive ? node.color_css : 'bg-slate-200'
                    }`}>
                      <Icon className={`w-10 h-10 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1">
                      <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 block ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                        {node.category} COMPONENT
                      </span>
                      <h3 className={`text-3xl font-black uppercase tracking-tighter ${isActive ? 'text-white' : 'text-slate-900'}`}>
                        {node.label}
                      </h3>
                    </div>
                    <ChevronRight className={`w-10 h-10 transition-transform ${isActive ? 'text-indigo-600 rotate-90' : 'text-slate-200'}`} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* INTERACTIVE WATERFALL CALLOUT */}
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(79,70,229,0.3)] flex items-center justify-between">
             <div className="space-y-2">
                <div className="flex items-center space-x-3">
                   <Zap className="w-6 h-6 text-white animate-bounce" />
                   <h4 className="text-white text-xl font-black uppercase italic tracking-widest">Protocol Velocity</h4>
                </div>
                <p className="text-indigo-100 text-sm font-bold opacity-80 max-w-md italic">
                  Mutation cascading at 0.04ms. Every payment triggers a 4point validation sequence across the Chart of Accounts.
                </p>
             </div>
             <Terminal className="w-16 h-16 text-indigo-800 opacity-50" />
          </div>
        </div>

        {/* PHASE 3: THE DYNAMIC TRANSLATION PANEL (RIGHT) */}
        <div className="lg:col-span-5 animate-in slide-in-from-right-8 duration-700 delay-100">
           <div className="sticky top-8 space-y-8">
              
              {/* GAAP DEFINITION CARD */}
              <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                   <ShieldCheck className="w-12 h-12 text-slate-100" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">GAAP Logical Proxy</h4>
                <p className="text-2xl font-black italic tracking-tighter text-slate-900 leading-tight">
                  "{selected.gaap_definition}"
                </p>
              </div>

              {/* AXIOM CODE-MAP CARD */}
              <div className="bg-slate-900 rounded-[2.5rem] p-12 border-4 border-slate-900 text-white relative shadow-2xl">
                 <div className="absolute top-0 right-0 p-8">
                    <Database className="w-32 h-32 text-indigo-600/10" />
                 </div>

                 <div className="relative z-10 space-y-12">
                   {/* Model Mapping */}
                   <section>
                      <div className="flex items-center space-x-3 mb-4">
                        <Link className="w-5 h-5 text-indigo-500" />
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Prisma Persistence Model</h5>
                      </div>
                      <div className="bg-slate-800/80 border-2 border-slate-700/50 p-5 rounded-2xl font-mono text-sm text-indigo-400 shadow-inner">
                        {selected.axiom_model}
                      </div>
                   </section>

                   {/* Payload Mapping */}
                   <section>
                      <div className="flex items-center space-x-3 mb-4">
                        <FileJson className="w-5 h-5 text-amber-500" />
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Variable Materialization</h5>
                      </div>
                      <div className="space-y-3">
                        {selected.axiom_fields.map((f, i) => (
                           <div key={i} className="flex items-center space-x-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/30">
                              <ArrowRight className="w-4 h-4 text-slate-600" />
                              <span className="text-sm font-bold tracking-tight text-slate-300">{f}</span>
                           </div>
                        ))}
                      </div>
                   </section>

                   {/* Server Actions Mapping */}
                   <section>
                      <div className="flex items-center space-x-3 mb-4">
                        <Code2 className="w-5 h-5 text-emerald-500" />
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Instruction Pathway (Active Gates)</h5>
                      </div>
                      <div className="space-y-4">
                         {selected.server_actions.map((act, i) => (
                           <div key={i} className="flex items-center justify-between bg-slate-800 p-5 rounded-2xl border-l-[6px] border-emerald-500 group cursor-default">
                              <span className="font-mono text-xs text-emerald-100 opacity-80">{act}</span>
                              <div className="flex items-center space-x-2">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-[10px] font-black uppercase text-emerald-500">Deployed</span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </section>
                 </div>
              </div>

              {/* AUDIT LOG RELAY */}
              <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-8 flex items-center justify-between hover:bg-slate-900 hover:text-white transition-all cursor-pointer group shadow-lg">
                 <div className="flex items-center space-x-6">
                    <Activity className="w-10 h-10 text-indigo-600 group-hover:text-indigo-400 group-hover:scale-110 transition-transform" />
                    <div>
                       <h6 className="text-xl font-black uppercase tracking-tighter">Trace Sequence In Log</h6>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500">Global Mutation Monitor</p>
                    </div>
                 </div>
                 <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
