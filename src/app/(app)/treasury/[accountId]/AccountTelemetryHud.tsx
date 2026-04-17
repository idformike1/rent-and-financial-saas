import { ReactNode } from 'react';
import { cn } from '@/lib/utils';


interface AccountTelemetryHudProps {
  accountId: string;
  balance: number;
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export default function AccountTelemetryHud({ accountId, balance }: AccountTelemetryHudProps) {
  const getIcon = () => {
    switch (accountId) {
      case 'operating': return <span className="text-[12px] font-bold opacity-60 text-emerald-400">[B]</span>;
      case 'deposits': return <span className="text-[12px] font-bold opacity-60 text-amber-400">[S]</span>;
      case 'receivables': return <span className="text-[12px] font-bold opacity-60 text-destructive">[!]</span>;
      default: return <span className="text-[12px] font-bold opacity-60 text-brand">[A]</span>;
    }
  };

  const getLabel = () => {
    switch (accountId) {
      case 'operating': return 'Operating Account';
      case 'deposits': return 'Security Deposits';
      case 'receivables': return 'Arrears & Receivables';
      default: return 'Virtual Account';
    }
  };

  return (
    <div className="bg-card border border-[#1F2937] p-8 rounded-[6px] mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-500">
          {getIcon()}
          <span className="text-[11px] font-medium uppercase tracking-wider">{getLabel()}</span>
        </div>
        <div className="font-mono text-[48px] text-[#F9FAFB] tabular-nums tracking-tight leading-none">
          {formatter.format(balance)}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-right">
        <div className="flex justify-end gap-2 text-[11px] font-mono">
          <span className="text-gray-500 uppercase tracking-widest block">Account:</span>
          <span className="text-[#E5E7EB] font-bold block">•••• 1038</span>
        </div>
        <div className="flex justify-end gap-2 text-[11px] font-mono">
          <span className="text-gray-500 uppercase tracking-widest block">Routing:</span>
          <span className="text-[#E5E7EB] font-bold block">132456789</span>
        </div>
      </div>
      
    </div>
  );
}
