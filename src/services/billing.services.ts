import { getSovereignClient } from "@/src/lib/db";
import { createBalancedTransaction } from "@/src/services/mutations/finance.services";
import { AccountCategory } from "@/src/schema/enums";
import React from 'react';
import { renderToStream } from "@react-pdf/renderer";
import { InvoiceTemplate } from "@/src/lib/InvoiceTemplate";

export async function calculateUtilityCharge(unitId: string, currentReading: number, type: 'ELECTRIC' | 'WATER', organizationId: string) {
  const db = getSovereignClient(organizationId);

  const previousReading = await db.meterReading.findFirst({
    where: { unitId, type },
    orderBy: { date: 'desc' }
  });

  const prevValue = previousReading ? previousReading.value : 0;
  const delta = Math.max(0, currentReading - prevValue);
  
  // configurable rates later, defaulting for now
  const rate = type === 'ELECTRIC' ? 15 : 5; 
  const totalCharge = delta * rate;

  await db.meterReading.create({
    data: {
      unitId,
      value: currentReading,
      type
    }
  });

  return totalCharge;
}

export async function generateRentAccrual(
  leaseId: string, 
  month: Date, 
  organizationId: string,
  charges?: { type: string, amount: number }[]
) {
  const db = getSovereignClient(organizationId);
  
  const lease = await db.lease.findUnique({
    where: { id: leaseId, organizationId },
    include: { tenant: true, unit: true }
  });

  if (!lease) throw new Error("Lease not found");

  const monthYear = `${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, '0')}`;
  const idempotencyKey = `RENT_ACCRUAL_${leaseId}_${monthYear}`;

  if (!charges) {
    charges = [{ type: 'RENTAL', amount: Number(lease.rentAmount) }];
  }

  // Ensure accounts exist
  let arAccount = await db.account.findFirst({
    where: { category: AccountCategory.ASSET, name: "ACCOUNTS_RECEIVABLE", organizationId }
  });
  if (!arAccount) {
    arAccount = await db.account.create({
      data: { name: "ACCOUNTS_RECEIVABLE", category: AccountCategory.ASSET, organizationId, isSystem: true }
    });
  }

  const entries: any[] = [];
  let totalDebit = 0;

  for (const charge of charges) {
    const accountName = `${charge.type}_INCOME`;
    let incomeAccount = await db.account.findFirst({
      where: { category: AccountCategory.INCOME, name: accountName, organizationId }
    });
    if (!incomeAccount) {
      incomeAccount = await db.account.create({
        data: { name: accountName, category: AccountCategory.INCOME, organizationId, isSystem: true }
      });
    }

    entries.push({
      accountId: incomeAccount.id,
      type: 'CREDIT',
      amount: charge.amount,
      tenantId: lease.tenantId,
      propertyId: lease.unit.propertyId
    });
    totalDebit += Number(charge.amount);
  }

  entries.push({
    accountId: arAccount.id,
    type: 'DEBIT',
    amount: totalDebit,
    tenantId: lease.tenantId,
    propertyId: lease.unit.propertyId
  });

  const description = `Accrual for Unit ${lease.unit.unitNumber} - ${monthYear}`;

  const transaction = await createBalancedTransaction({
    organizationId,
    description,
    idempotencyKey,
    date: month,
    entries
  });

  return transaction;
}

export async function generateInvoicePdf(transactionId: string, organizationId: string) {
  const db = getSovereignClient(organizationId);
  const transaction = await db.transaction.findUnique({
    where: { id: transactionId, organizationId },
    include: {
      entries: {
        include: { account: true, tenant: true, property: true }
      }
    }
  });

  if (!transaction) throw new Error("Transaction not found");

  const pdfStream = await renderToStream(React.createElement(InvoiceTemplate as any, { transaction }) as any);
  return pdfStream;
}
