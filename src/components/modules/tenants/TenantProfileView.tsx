'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PaymentDrawer from '@/src/components/finova/PaymentDrawer'
import LogUtilityModal from './LogUtilityModal'
import AdjustLedgerModal from './AdjustLedgerModal'
import EditTenantModal from './EditTenantModal'
import ReverseTransactionModal from './ReverseTransactionModal'
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Home, 
  CreditCard, 
  FileText, 
  History, 
  MoreHorizontal,
  Activity,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Download,
  Plus,
  Scale,
  RotateCcw
} from 'lucide-react'
import { Badge, Button, cn } from '@/src/components/finova/ui-finova'
import { MercuryTable, THead, TBody, TR, TD } from '@/src/components/system/DataTable'
import { Card } from '@/src/components/system/Card'
import { toast } from '@/lib/toast'

interface TenantProfileViewProps {
  tenant: { 
    id: string; 
    name: string; 
    email?: string; 
    phone?: string; 
    nationalId?: string;
    isDeleted: boolean;
    integrityScore: number;
    stripChart: { label: string; status: 'GREEN' | 'YELLOW' | 'RED' | 'EMPTY' }[];
  };
  activeLeases: {
    id: string;
    unitId: string;
    unitNumber: string;
    rentAmount: number;
    depositAmount: number;
    startDate: string;
    endDate: string;
    isPrimary: boolean;
  }[];
  ledgerEntries: any[];
}

export default function TenantProfileView({ tenant, activeLeases, ledgerEntries }: TenantProfileViewProps) {
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reversalContext, setReversalContext] = useState<{ id: string; description: string } | null>(null);
  const router = useRouter();

  // 1. STRICT DATA INTEGRITY: Dynamic Balance Calculation
  // All financial vitals must be derived from the ledgerEntries array to ensure parity.
  const liveBalance = ledgerEntries.reduce((sum, entry) => {
    const amount = Number(entry.amount);
    if (entry.type === 'DEBIT') return sum + amount;
    if (entry.type === 'CREDIT') return sum - amount;
    return sum;
  }, 0);

  const totalEscrow = activeLeases.reduce((sum, l) => sum + l.depositAmount, 0);
  const arrears = liveBalance > 0 ? liveBalance : 0;
  const unappliedCredit = liveBalance < 0 ? Math.abs(liveBalance) : 0;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const downloadStatementCSV = (name: string, entries: any[]) => {
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Balance'];
    
    // Sort entries by date ascending for the CSV flow
    const sorted = [...entries].sort((a, b) => 
      new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
    );

    let runningBalance = 0;
    const rows = sorted.map(entry => {
      const amount = Number(entry.amount);
      const type = entry.type;
      if (type === 'DEBIT') runningBalance += amount;
      else if (type === 'CREDIT') runningBalance -= amount;
      
      return [
        new Date(entry.transactionDate).toLocaleDateString(),
        type,
        `"${entry.description.replace(/"/g, '""')}"`, // Escape quotes
        type === 'CREDIT' ? `-${amount.toFixed(2)}` : amount.toFixed(2),
        runningBalance.toFixed(2)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `${name.replace(/\s+/g, '_')}_Statement_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVoidTransaction = (id: string, description: string) => {
    setReversalContext({ id, description });
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* A. TOP HEADER: Global Actions & Breadcrumbs */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center text-clinical-muted text-sm gap-2">
            <span>Tenants</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{tenant.name}</h1>
          <Badge variant={tenant.isDeleted ? 'danger' : 'success'} className="ml-2">
            {tenant.isDeleted ? 'DEACTIVATED' : 'ACTIVE'}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => downloadStatementCSV(tenant.name, ledgerEntries)}>
            <Download className="w-4 h-4 mr-2" />
            Generate Statement
          </Button>
          <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => setIsPaymentDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </header>

      {/* B. CONTEXT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 items-start">
        
        {/* LEFT SIDEBAR: Identity & Context */}
        <aside className="space-y-6">
          <Card className="p-6 border border-border shadow-sm bg-white/5 backdrop-blur-md">
            <div className="flex flex-col items-center text-center pb-6 border-b border-white/[0.08]">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-primary/20">
                <User className="w-10 h-10 text-primary opacity-80" />
              </div>
              <h2 className="text-xl font-bold text-foreground leading-tight">{tenant.name}</h2>
              <p className="text-clinical-muted text-sm mt-1">{tenant.id.split('-')[0].toUpperCase()}</p>
              
              {/* Contact Information (Directly Below Name) */}
              <div className="mt-4 space-y-1">
                <p className="text-sm font-medium text-foreground truncate flex items-center justify-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-clinical-muted" /> {tenant.email || 'No Email'}
                </p>
                <p className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-clinical-muted" /> {tenant.phone || 'No Phone'}
                </p>
              </div>
            </div>

            <div className="py-6 space-y-5">
              <hr className="border-white/[0.08]" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Building2 className="w-4 h-4 text-clinical-muted" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-clinical-muted">Connected Unit</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {activeLeases[0] ? `Unit ${activeLeases[0].unitNumber} | Sovereign Towers` : 'UNASSIGNED'}
                    </p>
                  </div>
                </div>

                <div className="pl-11 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-clinical-muted">Monthly Rent</p>
                    <p className="text-sm font-medium text-foreground">
                      {activeLeases[0] ? formatCurrency(activeLeases[0].rentAmount) : "Month-to-Month"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-clinical-muted">Lease Expiry</p>
                    <p className="text-sm font-medium text-foreground">
                      {activeLeases[0] ? new Date(activeLeases[0].endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "No Active Lease"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button variant="secondary" className="w-full" onClick={() => setIsEditModalOpen(true)}>
                Manage Tenant
              </Button>
              <Button variant="secondary" className="w-full border-white/5 bg-white/[0.02]" onClick={() => setIsUtilityModalOpen(true)}>
                <Activity className="w-4 h-4 mr-2 opacity-50" />
                Log Utility/Meter
              </Button>
              <Button variant="secondary" className="w-full border-white/5 bg-white/[0.02]" onClick={() => setIsAdjustmentModalOpen(true)}>
                <Scale className="w-4 h-4 mr-2 opacity-50" />
                Apply Waiver/Adjustment
              </Button>
            </div>
          </Card>

          {/* Integrity HUD */}
          <Card className="p-6 border border-border shadow-sm bg-white/5">
             <h3 className="text-[10px] uppercase font-bold tracking-widest text-clinical-muted mb-4">Integrity HUD</h3>
             <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Occupant Trust Score</span>
                <span className={cn(
                  "text-lg font-bold",
                  tenant.integrityScore > 80 ? "text-emerald-500" : tenant.integrityScore > 50 ? "text-amber-500" : "text-rose-500"
                )}>
                  {tenant.integrityScore}%
                </span>
             </div>
             <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    tenant.integrityScore > 80 ? "bg-emerald-500" : tenant.integrityScore > 50 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${tenant.integrityScore}%` }}
                />
             </div>
          </Card>
        </aside>

        {/* MAIN STAGE: Financials & Ledger */}
        <main className="space-y-6">
          
          {/* Financial Vitals Grid (Purely Typographic) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 border border-border shadow-sm bg-zinc-950/40">
               <p className="text-[10px] uppercase font-bold tracking-widest text-clinical-muted mb-1">Arrears / Due</p>
               <h3 className={cn("text-3xl font-mono font-bold tracking-tight", arrears > 0 ? "text-rose-500" : "text-foreground")}>
                  {formatCurrency(arrears)}
               </h3>
            </Card>

            <Card className="p-5 border border-border shadow-sm bg-zinc-950/40">
               <p className="text-[10px] uppercase font-bold tracking-widest text-clinical-muted mb-1">Unapplied Credit</p>
               <h3 className="text-3xl font-mono font-bold tracking-tight text-emerald-500">
                  {formatCurrency(unappliedCredit)}
               </h3>
            </Card>

            <Card className="p-5 border border-border shadow-sm bg-zinc-950/40">
               <p className="text-[10px] uppercase font-bold tracking-widest text-clinical-muted mb-1">Escrow / Deposit</p>
               <h3 className="text-3xl font-mono font-bold tracking-tight text-foreground">
                  {formatCurrency(totalEscrow)}
               </h3>
            </Card>
          </div>


          {/* THE PANOPTICON: Ledger Stage */}
          <Card className="border border-border shadow-sm bg-white/5 overflow-hidden">
            <div className="p-0">
              <MercuryTable className="border-none rounded-none">
                  <THead>
                    <TR isHeader>
                      <TD isHeader className="w-32">Date</TD>
                      <TD isHeader className="w-24">Type</TD>
                      <TD isHeader>Description</TD>
                      <TD isHeader className="text-right w-32">Amount</TD>
                      <TD isHeader className="text-right w-32 pr-6">Balance</TD>
                      <TD isHeader className="w-12"> </TD>
                    </TR>
                  </THead>
                  <TBody>
                    {ledgerEntries.map((entry, idx) => {
                      // Calculate running balance for this specific row (simulated for high density)
                      let rowBalance = 0;
                      for(let i = ledgerEntries.length - 1; i >= idx; i--) {
                        const e = ledgerEntries[i];
                        const amt = Number(e.amount);
                        if (e.type === 'DEBIT') rowBalance += amt;
                        else if (e.type === 'CREDIT') rowBalance -= amt;
                      }

                      return (
                        <TR key={entry.id} className="hover:bg-white/[0.02]">
                          <TD variant="date" className="font-mono text-[11px]">
                            {new Date(entry.transactionDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                          </TD>
                          <TD>
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded",
                              entry.type === 'DEBIT' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            )}>
                              {entry.type}
                            </span>
                          </TD>
                          <TD className="truncate max-w-[200px] text-[12px]" title={entry.description}>
                            {entry.description}
                          </TD>
                          <TD className={cn(
                            "text-right font-mono text-[12px] font-semibold",
                            entry.type === 'CREDIT' ? "text-emerald-500" : "text-foreground"
                          )}>
                            {entry.type === 'CREDIT' ? '-' : ''}{formatCurrency(Number(entry.amount))}
                          </TD>
                          <TD className="text-right font-mono text-[12px] font-bold pr-6">
                            {formatCurrency(rowBalance)}
                          </TD>
                          <TD className="pr-4">
                            <button className="p-1 hover:bg-white/10 rounded transition-colors text-clinical-muted hover:text-foreground" onClick={() => handleVoidTransaction(entry.id, entry.description)}>
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </TD>
                        </TR>
                      )
                    })}
                    {ledgerEntries.length === 0 && (
                      <TR>
                        <TD colSpan={6} className="h-40 text-center text-clinical-muted italic">
                          No forensic financial records detected for this occupant.
                        </TD>
                      </TR>
                    )}
                  </TBody>
                </MercuryTable>
            </div>
          </Card>
        </main>
      </div>

      <PaymentDrawer 
        isOpen={isPaymentDrawerOpen} 
        onClose={() => setIsPaymentDrawerOpen(false)} 
        tenant={tenant as any}
        activeCharges={[]} // The drawer will fetch or handle via unified flow
        onSuccess={() => {
          setIsPaymentDrawerOpen(false);
          router.refresh();
        }}
      />

      <LogUtilityModal 
        isOpen={isUtilityModalOpen}
        onClose={() => setIsUtilityModalOpen(false)}
        tenantId={tenant.id}
        unitId={activeLeases[0]?.unitId || ''}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <AdjustLedgerModal 
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        tenantId={tenant.id}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <EditTenantModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tenant={tenant}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <ReverseTransactionModal 
        isOpen={!!reversalContext}
        onClose={() => setReversalContext(null)}
        entryId={reversalContext?.id || ''}
        description={reversalContext?.description || ''}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  )
}
