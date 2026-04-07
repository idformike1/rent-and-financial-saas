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

  return (
    <div className="py-6 w-full px-6">
      <TransactionFeedClient initialData={ledgerData as any} />
    </div>
  );
}
