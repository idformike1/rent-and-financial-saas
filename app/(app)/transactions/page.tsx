import { getMasterLedger } from "@/actions/analytics.actions";
import { auth } from "@/auth";
import TransactionFeedClient from "./TransactionFeedClient";
import { redirect } from "next/navigation";

/**
 * MERCURY TRANSACTION FEED (V.3.2)
 * High-density surface-level ledger entry point.
 */
export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const ledgerData = await getMasterLedger();

  // SERIALIZATION: Prisma.Decimal is not allowed in Client Components. 
  const serializedLedger = ledgerData.map((tx: any) => ({
    ...tx,
    amount: tx.amount ? Number(tx.amount) : 0
  }));

  return (
    <div className="w-full">
      <TransactionFeedClient initialData={serializedLedger as any} />
    </div>
  );
}
