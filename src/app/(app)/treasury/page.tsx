import { prisma } from "@/lib/prisma";
import LedgerClient from "./LedgerClient";

export default async function TreasuryMasterPage() {
  const entries = await prisma.ledgerEntry.findMany({
    include: {
      expenseCategory: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6 w-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-[11px] uppercase tracking-widest text-[#9CA3AF] font-semibold mb-1">
            Treasury Management
          </h1>
          <h2 className="text-2xl text-white font-medium tracking-tight">
            Master Ledger
          </h2>
        </div>
        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          Tx_Count: {entries.length}
        </div>
      </header>

      <LedgerClient initialData={JSON.parse(JSON.stringify(entries))} />
    </div>
  );
}
