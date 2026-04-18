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
      case 'operating': return <span className="text-[10px] font-bold text-mercury-green opacity-40">[B]</span>;
      case 'deposits': return <span className="text-[10px] font-bold text-amber-500 opacity-40">[S]</span>;
      case 'receivables': return <span className="text-[10px] font-bold text-destructive/80 opacity-40">[!]</span>;
      default: return <span className="text-[10px] font-bold text-brand opacity-40">[A]</span>;
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
    <div className="bg-muted/10 border border-border p-10 rounded-[var(--radius-sm)] mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl backdrop-blur-sm">
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {getIcon()}
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">{getLabel()}</span>
        </div>
        <div className="text-display font-weight-display text-foreground font-finance tabular-nums tracking-clinical leading-none text-4xl md:text-5xl">
          {formatter.format(balance)}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-right">
        <div className="flex justify-end gap-3 text-[10px] font-bold uppercase tracking-[0.15em]">
          <span className="text-foreground/20">Account:</span>
          <span className="text-foreground/60 tabular-nums">•••• 1038</span>
        </div>
        <div className="flex justify-end gap-3 text-[10px] font-bold uppercase tracking-[0.15em]">
          <span className="text-foreground/20">Routing:</span>
          <span className="text-foreground/60 tabular-nums">132456789</span>
        </div>
      </div>
      
    </div>
  );
}
