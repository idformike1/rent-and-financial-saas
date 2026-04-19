import { prisma } from "@/lib/prisma";
import LedgerClient from "./LedgerClient";

export default async function TreasuryGrid() {
  const entries = await prisma.ledgerEntry.findMany({
    include: {
      expenseCategory: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return <LedgerClient initialData={JSON.parse(JSON.stringify(entries))} />;
}
