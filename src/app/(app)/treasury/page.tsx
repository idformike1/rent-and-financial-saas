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
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8 w-full">
      <header className="flex justify-between items-end border-b border-border pb-8">
        <div>
          <h1 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 mb-3">
             Treasury Governance
          </h1>
          <h2 className="text-display font-weight-display text-foreground leading-none">
            Sovereign Master Ledger
          </h2>
        </div>
        <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.15em]">
          Total_Nodes: {entries.length}
        </div>
      </header>

      <LedgerClient initialData={JSON.parse(JSON.stringify(entries))} />
    </div>
  );
}
