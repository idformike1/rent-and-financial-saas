import { getCurrentSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { cookies } from "next/headers";
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
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const cookieStore = await cookies();
  const activeModule = (cookieStore.get('active_module_context')?.value as 'RENT' | 'WEALTH') || 'RENT';

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
       take: params.take ? parseInt(params.take) : 500, // Higher default for explorer
       scope: activeModule
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
          role={session.role}
        />
      </Suspense>
    </div>
  );
}
