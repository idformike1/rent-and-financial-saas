import { getCurrentSession } from "@/lib/auth-utils";
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
  const params = await searchParams;
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const [ledgerData, metadata] = await Promise.all([
     getMasterLedger({
       query: params.q,
       category: params.cat,
       startDate: params.start,
       endDate: params.end,
       propertyId: params.pid,
       tenantId: params.tid,
       minAmount: params.min ? parseFloat(params.min) : undefined,
       maxAmount: params.max ? parseFloat(params.max) : undefined,
       skip: params.skip ? parseInt(params.skip) : 0,
       take: params.take ? parseInt(params.take) : 100
     }),
     getLedgerFilterMetadata()
  ]);

  // Strictly pick only the required fields to prevent Prisma metadata from crashing RSC transport
  const rawLedger = Array.isArray(ledgerData) ? ledgerData : [];
  
  const serializedLedger = rawLedger.map((tx: any) => ({
    id: tx.id,
    description: tx.description,
    amount: tx.amount ? Number(tx.amount) : 0,
    transactionDate: tx.transactionDate instanceof Date ? tx.transactionDate.toISOString() : tx.transactionDate,
    account: { name: tx.account?.name, category: tx.account?.category },
    expenseCategory: { name: tx.expenseCategory?.name },
    payee: tx.payee,
    paymentMode: tx.paymentMode,
    referenceText: tx.referenceText,
    propertyId: tx.propertyId,
    tenantId: tx.tenantId,
    status: tx.status
  }));

  return (
    <div className="w-full theme-sharp">
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-clinical-muted uppercase tracking-widest text-[11px] animate-pulse">Materializing Ledger...</div>}>
        <TransactionFeedClient 
          initialData={serializedLedger as any} 
          properties={metadata.properties || []}
          tenants={metadata.tenants || []}
        />
      </Suspense>
    </div>
  );
}
