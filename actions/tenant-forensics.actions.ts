'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function liquidateTenantDebt(tenantId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId, organizationId: session.organizationId },
        include: {
          charges: { orderBy: { dueDate: 'asc' } },
          ledgerEntries: { 
            where: { account: { category: 'INCOME' } } 
          }
        }
      });
      
      if (!tenant) throw new Error("TENANT_RECORD_ABSENT");

      // 1. DATA RECONCILIATION
      const totalCharges = tenant.charges.reduce((acc: number, c: any) => acc + Number(c.amount), 0);
      const totalIncome = tenant.ledgerEntries.reduce((acc: number, e: any) => acc + Math.abs(Number(e.amount)), 0);
      const netBalance = totalCharges - totalIncome;

      // If netBalance > 0, the tenant still owes more than they have ever paid (no surplus to redistribute)
      if (netBalance > 0) {
        throw new Error(`INSUFFICIENT_LIQUIDITY: $${netBalance.toFixed(2)} gap detected. Collect funds first.`);
      }

      // 2. FIFO CASCADE (REMAINING CREDIT TO DEBT)
      const outstandingCharges = tenant.charges.filter((c: any) => !c.isFullyPaid);
      const alreadyApplied = tenant.charges.reduce((acc: number, c: any) => acc + Number(c.amountPaid), 0);
      let remainingCredit = totalIncome - alreadyApplied;

      if (remainingCredit <= 0) {
        return { success: true, message: "NO_UNALLOCATED_CREDITS_FOUND" };
      }

      const operations: any[] = [];
      for (const charge of outstandingCharges) {
        if (remainingCredit <= 0) break;

        const amount = Number(charge.amount);
        const paid = Number(charge.amountPaid);
        const deficit = amount - paid;

        if (remainingCredit >= deficit) {
          operations.push(prisma.charge.update({
            where: { id: charge.id },
            data: { amountPaid: amount, isFullyPaid: true }
          }));
          remainingCredit -= deficit;
        } else {
          operations.push(prisma.charge.update({
            where: { id: charge.id },
            data: { amountPaid: paid + remainingCredit }
          }));
          remainingCredit = 0;
        }
      }

      if (operations.length > 0) {
        await prisma.$transaction(operations);
      }

      revalidatePath(`/tenants/${tenantId}`);
      return { success: true, message: "FIFO_RECONCILIATION_SUCCESS" };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function getTenantForensicDossier(tenantId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const tenant = await prisma.tenant.findFirst({
        where: { id: tenantId, organizationId: session.organizationId },
        include: {
          leases: { 
            include: { unit: true }, 
            orderBy: { startDate: 'desc' } 
          },
          charges: { 
            orderBy: { dueDate: 'desc' } 
          }
        }
      });

      if (!tenant) throw new Error("TENANT_RECORD_ABSENT");

      const ledgerEntries = await prisma.ledgerEntry.findMany({
        where: { 
          tenantId: tenantId,
          organizationId: session.organizationId,
          account: { category: 'INCOME' },
          amount: { lt: 0 }
        },
        orderBy: { transactionDate: 'desc' }
      });

      // DATA SANITIZATION (PRISMA DECIMAL -> NUMBER)
      const sanitizedCharges = tenant.charges.map((c: any) => ({
        id: c.id,
        tenantId: c.tenantId,
        leaseId: c.leaseId,
        type: c.type,
        amount: Number(c.amount),
        amountPaid: Number(c.amountPaid),
        dueDate: c.dueDate,
        isFullyPaid: c.isFullyPaid
      }));

      const sanitizedLedger = ledgerEntries.map((e: any) => ({
        id: e.id,
        amount: Math.abs(Number(e.amount)),
        transactionDate: e.transactionDate,
        description: e.description,
        paymentMode: e.paymentMode,
        referenceText: e.referenceText
      }));

      const sanitizedLeases = tenant.leases.map((l: any) => ({
        id: l.id,
        rentAmount: Number(l.rentAmount),
        depositAmount: Number(l.depositAmount),
        startDate: l.startDate,
        endDate: l.endDate,
        isActive: l.isActive,
        isPrimary: l.isPrimary,
        unit: {
          id: l.unit.id,
          unitNumber: l.unit.unitNumber,
          type: l.unit.type,
          marketRent: Number(l.unit.marketRent)
        }
      }));

      // INTEGRITY SCORE CALCULATION: V3.1 (RISK-ADJUSTED ALGORITHM)
      // Logic: Base 100 - (Avg Delay * 2) - (Unpaid Rent Count * 25)
      const paidRentCharges = sanitizedCharges.filter((c: any) => c.type === 'RENT' && c.isFullyPaid);
      const unpaidRentCharges = sanitizedCharges.filter((c: any) => c.type === 'RENT' && !c.isFullyPaid);
      
      let totalDelayDays = 0;
      paidRentCharges.forEach((c: any) => {
        const matchedEntry = ledgerEntries.find((e: any) => 
           Math.abs(new Date(e.transactionDate).getTime() - new Date(c.dueDate).getTime()) < 30 * 24 * 60 * 60 * 1000
        );

        if (matchedEntry) {
          const due = new Date(c.dueDate);
          const paid = new Date(matchedEntry.transactionDate);
          
          const diffTime = paid.getTime() - due.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 0) totalDelayDays += diffDays;
        }
      });

      const avgDelay = paidRentCharges.length > 0 ? totalDelayDays / paidRentCharges.length : 0;
      const historyPenalty = avgDelay * 2;
      const defaultPenalty = unpaidRentCharges.length * 25;

      const integrityScore = Math.max(0, 100 - historyPenalty - defaultPenalty);

      // STRIP-CHART GENERATION (LAST 12 MONTHS)
      const months = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        
        const monthCharge = sanitizedCharges.find((c: any) => 
          c.type === 'RENT' && 
          c.dueDate >= monthStart && 
          c.dueDate <= monthEnd
        );

        let status: 'GREEN' | 'YELLOW' | 'RED' | 'EMPTY' = 'EMPTY';
        if (monthCharge) {
          if (!monthCharge.isFullyPaid) {
            status = 'RED';
          } else {
            const payment = sanitizedLedger.find((p: any) => p.transactionDate >= monthStart && p.transactionDate <= monthEnd);
            const gracePeriod = new Date(monthStart);
            gracePeriod.setDate(5); // 5th of month grace period
            
            if (payment && payment.transactionDate <= gracePeriod) {
              status = 'GREEN';
            } else {
              status = 'YELLOW';
            }
          }
        }
        
        months.push({ 
          label: d.toLocaleString('default', { month: 'short' }), 
          status 
        });
      }

      return { 
        success: true, 
        data: JSON.parse(JSON.stringify({
          tenant: {
            id: tenant.id,
            name: tenant.name,
            email: tenant.email,
            phone: tenant.phone,
            nationalId: tenant.nationalId,
            isDeleted: tenant.isDeleted,
            leases: sanitizedLeases,
            charges: sanitizedCharges,
            ledgerEntries: sanitizedLedger
          },
          integrityScore: Math.round(integrityScore),
          stripChart: months
        }))
      };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}
