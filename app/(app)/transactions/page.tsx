import { auth } from "@/auth";
import TransactionFeedClient from "./TransactionFeedClient";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getMasterLedger, getLedgerFilterMetadata } from "@/actions/analytics.actions";

/**
 * MERCURY TRANSACTION FEED (V.3.2)
 * High-density surface-level ledger entry point.
 */
export default async function TransactionsPage({ 
  searchParams 
}: { 
  searchParams: { 
    q?: string; 
    cat?: string; 
    start?: string; 
    end?: string;
    tab?: string;
    pid?: string;
    tid?: string;
    min?: string;
    max?: string;
    skip?: string;
    take?: string;
  } 
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [ledgerData, metadata] = await Promise.all([
     getMasterLedger({
       query: searchParams.q,
       category: searchParams.cat,
       startDate: searchParams.start,
       endDate: searchParams.end,
       propertyId: searchParams.pid,
       tenantId: searchParams.tid,
       minAmount: searchParams.min ? parseFloat(searchParams.min) : undefined,
       maxAmount: searchParams.max ? parseFloat(searchParams.max) : undefined,
       skip: searchParams.skip ? parseInt(searchParams.skip) : 0,
       take: searchParams.take ? parseInt(searchParams.take) : 100
     }),
     getLedgerFilterMetadata()
  ]);

  // SERIALIZATION: Prisma.Decimal is not allowed in Client Components. 
  const serializedLedger = (ledgerData || []).map((tx: any) => ({
    ...tx,
    amount: tx.amount ? Number(tx.amount) : 0,
    transactionDate: tx.transactionDate instanceof Date ? tx.transactionDate.toISOString() : tx.transactionDate
  }));

  return (
    <div className="w-full">
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-[#9D9DA8] uppercase tracking-widest text-[11px] animate-pulse">Materializing Ledger...</div>}>
        <TransactionFeedClient 
          initialData={serializedLedger as any} 
          properties={metadata.properties || []}
          tenants={metadata.tenants || []}
        />
      </Suspense>
    </div>
  );
}
