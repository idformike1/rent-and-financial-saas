import { Suspense } from 'react';
import { getCurrentSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import TrendChart from '@/src/components/Cockpit/TrendChart';

interface PageProps {
  params: Promise<{ accountId: string }>;
}

// Mock IsolatedLedgerTable (Placeholder for Step 2)
function IsolatedLedgerTable({ accountId }: { accountId: string }) {
  return (
    <div className="p-8 border border-white/5 bg-white/5 rounded-2xl">
      <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4">Isolated Ledger: {accountId}</h3>
      <div className="h-64 flex items-center justify-center text-white/20 border border-dashed border-white/10 rounded-xl">
        Ledger entries for this specific account context will render here in a future phase.
      </div>
    </div>
  );
}

export default async function AccountDetailPage({ params }: PageProps) {
  const { accountId } = await params;
  const session = await getCurrentSession();
  
  if (!session) redirect('/login');

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto py-8">
      <header>
        <h1 className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500 mb-2">
          Sovereign Account Analysis
        </h1>
        <div className="flex items-baseline gap-4">
            <h2 className="text-5xl font-weight-display text-white tracking-tighter">
            Account Details
            </h2>
            <span className="text-clinical-muted font-mono text-sm uppercase opacity-50">/ {accountId}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {/* Step 2 Requirement: TrendChart Placeholder */}
        <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Historical Trajectory</h3>
            <TrendChart 
                data={[
                    { date: 'JAN', value: 10000 },
                    { date: 'FEB', value: 15000 },
                    { date: 'MAR', value: 12000 },
                    { date: 'APR', value: 18000 },
                ]} 
                title="Sovereign Balance Trend" 
            />
        </section>

        {/* Step 2 Requirement: IsolatedLedgerTable Placeholder */}
        <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Transaction Isolation</h3>
            <IsolatedLedgerTable accountId={accountId} />
        </section>
      </div>
    </div>
  );
}
