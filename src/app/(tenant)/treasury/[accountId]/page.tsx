import { notFound } from 'next/navigation';
import AccountTelemetryHud from './AccountTelemetryHud';
import TreasuryLedgerTable from './TreasuryLedgerTable';
import { getAccountLedger } from '@/actions/treasury.actions';

export function generateStaticParams() {
  return [
    { accountId: 'operating' },
    { accountId: 'deposits' },
    { accountId: 'receivables' }
  ];
}

export default async function TreasuryAccountPage(props: { params: Promise<{ accountId: string }> }) {
  const params = await props.params;
  const accountId = params.accountId;
  
  if (!['operating', 'deposits', 'receivables'].includes(accountId)) {
    notFound();
  }

  const result = await getAccountLedger(accountId);
  
  if (!result.success) {
    return <div className="text-destructive font-mono uppercase">System Interruption: Unable to resolve fiscal ledger limit.</div>;
  }

  const data = result.data || { balance: 0, entries: [] };

  return (
    <div className="w-full h-full animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-[28px] font-[400] text-white tracking-clinical font-sans">
            Treasury Gateway
          </h1>
          <p className="text-[13px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">
            Global Fiscal Segmentation
          </p>
        </div>
      </div>

      <AccountTelemetryHud accountId={accountId} balance={data.balance} />
      
      <div className="mt-8">
        <h2 className="text-[11px] text-gray-500 font-bold tracking-widest uppercase mb-4">
          [ FORENSIC LEDGER RECORD ]
        </h2>
        <TreasuryLedgerTable entries={data.entries} />
      </div>
    </div>
  );
}
