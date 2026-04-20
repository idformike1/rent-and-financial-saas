import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getMasterLedger, getLedgerFilterMetadata } from "@/actions/analytics.actions";
import LedgerExplorerClient from "./LedgerExplorerClient";

/**
 * GOVERNANCE LEDGER EXPLORER (V.4.0)
 * Universal forensic entry point for all organizational cash flows.
 */
export default async function LedgerExplorerPage({ 
  searchParams 
}: { 
  searchParams: { 
    q?: string; 
    cat?: string; 
    from?: string; 
    to?: string;
    pid?: string;
    tid?: string;
    aid?: string;
    cid?: string;
    min?: string;
    max?: string;
    skip?: string;
    take?: string;
  } 
}) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [ledgerData, metadata] = await Promise.all([
     getMasterLedger({
       query: params.q,
       category: params.cat,
       startDate: params.from,
       endDate: params.to,
       propertyId: params.pid,
       tenantId: params.tid,
       accountId: params.aid,
       categoryId: params.cid,
       minAmount: params.min ? parseFloat(params.min) : undefined,
       maxAmount: params.max ? parseFloat(params.max) : undefined,
       skip: params.skip ? parseInt(params.skip) : 0,
       take: params.take ? parseInt(params.take) : 500 // Higher default for explorer
     }),
     getLedgerFilterMetadata()
  ]);

  const rawLedger = Array.isArray(ledgerData) ? ledgerData : [];
  
  const serializedLedger = rawLedger.map((tx: any) => ({
    id: tx.id,
    description: tx.description,
    amount: tx.amount ? Number(tx.amount) : 0,
    transactionDate: tx.transactionDate instanceof Date ? tx.transactionDate.toISOString() : tx.transactionDate,
    account: { 
        id: tx.accountId, 
        name: tx.account?.name, 
        category: tx.account?.category 
    },
    expenseCategory: { 
        id: tx.expenseCategoryId, 
        name: tx.expenseCategory?.name 
    },
    property: tx.property ? { id: tx.propertyId, name: tx.property.name } : null,
    tenant: tx.tenant ? { id: tx.tenantId, name: tx.tenant.name } : null,
    payee: tx.payee,
    paymentMode: tx.paymentMode,
    referenceText: tx.referenceText,
    status: tx.status
  }));

  return (
    <div className="w-full">
      <Suspense fallback={<div className="h-screen flex items-center justify-center text-clinical-muted uppercase tracking-widest text-[11px] animate-pulse bg-background">Initiating Universal Scan...</div>}>
        <LedgerExplorerClient 
          initialData={serializedLedger as any} 
          metadata={metadata as any}
          role={session.user.role}
        />
      </Suspense>
    </div>
  );
}
