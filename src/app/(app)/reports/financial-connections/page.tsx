'use client'

import { useState } from 'react'

import { Card, Badge, Button } from '@/components/ui-finova'

// GAAP to Axiom Translation Definition Hub
type TranslationNode = {
  id: string;
  label: string;
  gaap_definition: string;
  axiom_model: string;
  axiom_fields: string[];
  server_actions: string[];
  color_css: string;
  icon: string;
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
    color_css: 'bg-[var(--primary)]',
    icon: '📈',
    category: 'REVENUE'
  },
  {
    id: 'ACCOUNTS_RECEIVABLE',
    label: 'Accounts Receivable (A/R)',
    gaap_definition: 'Assets representing the amount of money owed by customers (tenants) for services provided but not yet paid.',
    axiom_model: 'Tenant.Lease.Charges (Aggregate Unpaid Balance)',
    axiom_fields: ['Charge.amount - Charge.amountPaid', 'Charge.isFullyPaid: false', 'Lease.isActive: true'],
    server_actions: ['actions/tenant-lifecycle.actions.ts::materializeCharges', 'actions/reports.actions.ts::calculateDelinquency'],
    color_css: 'bg-[var(--primary)]',
    icon: '[U]',
    category: 'ASSET'
  },
  {
    id: 'OPERATING_EXPENSES',
    label: 'Operating Expenses (OPEX)',
    gaap_definition: 'Administrative and operational costs like payroll, utilities, and repairs necessary for property maintenance.',
    axiom_model: "LedgerEntry (categoryId → FinancialLedger.class: 'EXPENSE')",
    axiom_fields: ['LedgerEntry.payee', 'LedgerEntry.receiptUrl', 'FinancialLedger.class: "EXPENSE"'],
    server_actions: ['actions/category.actions.ts::createAccountNode', 'actions/payment.actions.ts::recordBillPayment'],
    color_css: 'bg-destructive',
    icon: '[B]',
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
    icon: '⚡',
    category: 'WATERFALL'
  }
]

export default function FinanceTranslationHub() {
  const [selected, setSelected] = useState<TranslationNode>(TRANSLATION_MAP[0])

  return (
    <div className="min-h-screen bg-muted p-6 lg:p-6 space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER SECTION: FINOVA RECONSTRUCTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border border-border pb-12 gap-6 relative overflow-hidden group">
        <div className="flex items-center space-x-6 relative z-10">
          <div className="w-16 h-16 bg-brand/10 rounded-[8px] flex items-center justify-center transition-transform group-hover:rotate-12 duration-500">
             <span className="text-3xl text-brand font-bold">[L]</span>
          </div>
          <div>
            <h1 className="text-display font-weight-display text-foreground leading-none">
              Finance <br/><span className="text-brand">Translation Hub</span>
            </h1>
            <div className="flex items-center space-x-4 mt-2">
                <span className="text-[var(--primary)] font-bold text-xs">✓</span>
               <p className="text-muted-foreground font-bold   text-[10px]">
                 AXIOM V.3 Architecture ↔ GAAP Regulatory Standards
               </p>
            </div>
          </div>
        </div>
        <div className="absolute right-[-5%] top-0 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
           <span className="text-[384px] text-brand font-bold">[P]</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* HIERARCHY VISUALIZER (LEFT) */}
        <div className="lg:col-span-7 space-y-8 animate-in slide-in-from-left-8 duration-700">
          <Card className="rounded-[8px] p-6 border-none bg-card">
            <h2 className="text-xl  mb-10 flex items-center text-foreground border-b border-border border-border pb-6">
                Hierarchical Translation Map
                <span className="text-brand ml-4 font-bold">[Ξ]</span>
             </h2>

            <div className="flex flex-col space-y-4">
              {TRANSLATION_MAP.map((node) => {
                const isActive = selected.id === node.id
                return (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={false}
                    key={node.id}
                    onClick={() => setSelected(node)}
                    className={`flex items-center text-left p-5 rounded-[8px] transition-all relative z-10 w-full h-auto border-none justify-start ${
                      isActive 
                        ? 'bg-card dark:bg-brand text-foreground -translate-y-1' 
                        : 'bg-muted hover:bg-card dark:hover:bg-surface-800 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-[6px] flex items-center justify-center mr-6 transition-all shrink-0 ${
                      isActive ? 'bg-card/20' : 'bg-muted'
                    }`}>
                      <span className={`text-2xl ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{node.icon}</span>
                    </div>
                    <div className="flex-1">
                      <span className={`text-[9px]   mb-1 block ${isActive ? 'text-foreground/60' : 'text-muted-foreground'}`}>
                        {node.category} COMPONENT
                      </span>
                      <h3 className={`text-lg  ${isActive ? 'text-foreground' : 'text-foreground'}`}>
                        {node.label}
                      </h3>
                    </div>
                    <span className={`text-xl transition-transform ${isActive ? 'text-foreground' : 'text-foreground'}`}>{isActive ? '▼' : '▶'}</span>
                  </Button>
                )
              })}
            </div>
          </Card>

          <Card className="bg-brand border-none rounded-[8px] p-6 flex items-center justify-between text-foreground overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-muted/50 rounded-[6px] -mr-16 -mt-8 group-hover:scale-150 transition-transform" />
             <div className="space-y-2 relative z-10">
                 <div className="flex items-center space-x-3">
                    <span className="text-foreground text-xl">⚡</span>
                    <h4 className="text-lg ">Protocol Velocity</h4>
                 </div>
                <p className="text-foreground/70 text-xs font-medium max-w-md tracking-wide ">
                  Mutation cascading at 0.04ms. Every payment triggers a 4-point validation sequence.
                </p>
             </div>
              <span className="text-6xl text-foreground/10 group-hover:rotate-12 transition-transform">[_]</span>
          </Card>
        </div>

        {/* TRANSLATION PANEL (RIGHT) */}
        <div className="lg:col-span-5 animate-in slide-in-from-right-8 duration-700 delay-100">
           <div className="sticky top-28 space-y-8">
              
              <Card className="rounded-[8px] p-6 border-none bg-card border-l-8 border-brand">
                <h4 className="text-[9px]   text-muted-foreground mb-6">GAAP Logical Proxy</h4>
                <p className="text-xl text-foreground leading-relaxed">
                  "{selected.gaap_definition}"
                </p>
              </Card>

              <Card className="bg-background border-none p-6 rounded-[8px] text-foreground relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform">
                     <span className="text-[192px] text-brand font-bold">[!]</span>
                  </div>

                 <div className="relative z-10 space-y-10">
                   <section>
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-brand font-bold">➲</span>
                       <h5 className="text-[10px]   text-muted-foreground">Persistence Model</h5>
                      </div>
                      <div className="bg-card/80 border border-border px-5 py-4 rounded-[6px] text-xs text-brand/80">
                        {selected.axiom_model}
                      </div>
                   </section>

                   <section>
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-amber-500 font-bold">{}</span>
                       <h5 className="text-[10px]   text-muted-foreground">Materialization</h5>
                      </div>
                      <div className="space-y-3">
                        {selected.axiom_fields.map((f, i) => (
                           <div key={i} className="flex items-center space-x-4 bg-card/40 p-4 rounded-[6px] border border-border/50">
                               <span className="text-muted-foreground font-bold">→</span>
                               <span className="text-[11px] font-bold tracking-tight text-muted-foreground">{f}</span>
                           </div>
                        ))}
                      </div>
                   </section>

                   <section>
                      <div className="flex items-center space-x-3 mb-4">
                         <span className="text-[var(--primary)] font-bold">[S]</span>
                         <h5 className="text-[10px]   text-muted-foreground">Instruction Pathway</h5>
                      </div>
                      <div className="space-y-4">
                         {selected.server_actions.map((act, i) => (
                           <div key={i} className="flex items-center justify-between bg-card p-4 rounded-[6px] border-l-[4px] border-mercury-green group cursor-default">
                              <span className="text-[10px] text-[var(--primary)]/80">{act}</span>
                              <Badge className="bg-[var(--primary)]/10 text-[var(--primary)] text-[8px] px-1.5 py-0">Active</Badge>
                           </div>
                         ))}
                      </div>
                   </section>
                 </div>
              </Card>

              <Card className="rounded-[8px] p-6 flex items-center justify-between transition-all cursor-pointer group bg-card border-none">
                 <div className="flex items-center space-x-6">
                     <div className="w-12 h-12 rounded-[6px] bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-brand text-xl">➲</span>
                     </div>
                    <div>
                       <h6 className="text-lg text-foreground">Trace In Log</h6>
                       <p className="text-[9px]  text-muted-foreground">Global Monitor</p>
                    </div>
                 </div>
                  <span className="text-2xl text-foreground group-hover:text-brand group-hover:translate-x-2 transition-all">→</span>
              </Card>
           </div>
        </div>
      </div>
    </div>
  )
}
