import { cn } from '@/lib/utils';

interface LedgerEntry {
  id: string;
  date: string;
  payee: string;
  description: string;
  amount: number;
}

interface TreasuryLedgerTableProps {
  entries: LedgerEntry[];
}

const formatCurrency = (val: number) => {
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absVal);
  
  return isNegative ? `( ${formatted} )` : formatted;
};

export default function TreasuryLedgerTable({ entries }: TreasuryLedgerTableProps) {
  return (
    <div className="w-full bg-[#171721] border border-[#1F2937] rounded-[var(--radius-sm)] overflow-hidden">
      <table className="w-full border-collapse text-[13px]">
        <colgroup>
          <col className="w-[15%]" />
          <col className="w-[20%]" />
          <col className="w-[45%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead>
          <tr className="bg-[#1A1A24] border-b border-[#1F2937]">
            <th className="text-left px-6 py-4 font-bold text-[#E5E7EB] uppercase tracking-wider">Date</th>
            <th className="text-left px-6 py-4 font-bold text-[#E5E7EB] uppercase tracking-wider">Counterparty</th>
            <th className="text-left px-6 py-4 font-bold text-[#E5E7EB] uppercase tracking-wider">Description</th>
            <th className="text-right px-6 py-4 font-bold text-[#E5E7EB] uppercase tracking-wider tabular-nums">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1F2937]">
          {entries.map((entry) => (
            <tr 
              key={entry.id}
              className="group transition-all duration-200 bg-transparent hover:bg-white/5 hover:-translate-y-[1px] hover:relative hover:z-10"
            >
              <td className="px-6 py-4">
                <span className="font-mono text-[#9CA3AF] tracking-clinical">{entry.date}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-[#E5E7EB] tracking-wider uppercase font-medium">{entry.payee}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-500">{entry.description}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className={cn(
                  "font-mono tracking-clinical tabular-nums block",
                  entry.amount < 0 ? "text-destructive" : "text-[#E5E7EB]"
                )}>
                  {formatCurrency(entry.amount)}
                </span>
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-[#9CA3AF] uppercase tracking-widest text-[11px]">
                No transactional history detected.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
