import { getSovereignClient } from "@/src/lib/db";
import { Prisma } from "@prisma/client";
import { AccountCategory } from "@/src/schema/enums";
import { recordAuditLog } from "@/lib/audit-logger";

/**
 * FINANCE BILLING & ACCRUAL LOGIC
 * 
 * Manages recurring revenue cycles, waivers, and utility reconciliation.
 */

export async function runMonthlyBillingCycleService(
  targetDate: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);
  const targetTime = new Date(targetDate);
  const startOfMonth = new Date(targetTime.getFullYear(), targetTime.getMonth(), 1);
  const endOfMonth = new Date(targetTime.getFullYear(), targetTime.getMonth() + 1, 0);

  return await db.$transaction(async (tx: any) => {
    const activeLeases = await tx.lease.findMany({
      where: { isActive: true, organizationId: context.organizationId },
      include: { unit: true }
    });

    let generatedCount = 0;
    let bypassedCount = 0;
    const generatedIds: string[] = [];

    for (const lease of activeLeases) {
      if (lease.unit.maintenanceStatus === 'DECOMMISSIONED') {
        bypassedCount++;
        continue;
      }

      const existingCharge = await tx.charge.findFirst({
        where: {
          leaseId: lease.id,
          type: 'RENT',
          dueDate: { gte: startOfMonth, lte: endOfMonth },
          organizationId: context.organizationId
        }
      });

      if (!existingCharge) {
        const charge = await tx.charge.create({
          data: {
            organizationId: context.organizationId,
            tenantId: lease.tenantId,
            leaseId: lease.id,
            type: 'RENT',
            amount: lease.rentAmount,
            dueDate: startOfMonth,
            isFullyPaid: false
          }
        });
        generatedCount++;
        generatedIds.push(charge.id);
      }
    }

    if (generatedCount > 0) {
      await recordAuditLog({
        action: 'CREATE',
        entityType: 'CHARGE',
        entityId: `BILLING_CYCLE_${startOfMonth.toISOString()}`,
        metadata: { cycleStart: startOfMonth, generated: generatedCount, recordIds: generatedIds },
        tx: tx as any
      });
    }

    return { generated: generatedCount, bypassed: bypassedCount };
  });
}

export async function waiveChargeService(
  chargeId: string,
  reasonText: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    const charge = await tx.charge.findFirst({ where: { id: chargeId, organizationId: context.organizationId } });
    if (!charge) throw new Error("ERR_CHARGE_ABSENT");

    const balance = charge.amount.minus(charge.amountPaid);
    if (balance.lte(0)) throw new Error("ERR_FISCAL_CONFLICT: Charge already satisfied.");

    await tx.charge.updateMany({
      where: { id: chargeId, organizationId: context.organizationId },
      data: { amountPaid: charge.amount, isFullyPaid: true }
    });

    await recordAuditLog({
      action: 'UPDATE',
      entityType: 'CHARGE',
      entityId: chargeId,
      metadata: { action: 'WAIVE_OFF', balanceWaived: balance.toNumber(), reason: reasonText },
      tx: tx as any
    });

    return { success: true, waived: balance.toNumber() };
  });
}

export async function reconcileUtilitiesService(
  propertyId: string,
  dateRange: { start: Date, end: Date },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  const expenseAccounts = await db.account.findMany({
    where: { category: AccountCategory.EXPENSE, name: { contains: 'Master' }, organizationId: context.organizationId }
  });

  const incomeAccounts = await db.account.findMany({
    where: { category: AccountCategory.INCOME, name: { contains: 'Utility Recovery' }, organizationId: context.organizationId }
  });

  const expenseAgg = await db.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: {
      organizationId: context.organizationId,
      accountId: { in: expenseAccounts.map((a: { id: string }) => a.id) },
      date: { gte: dateRange.start, lte: dateRange.end },
      status: 'ACTIVE'
    }
  });

  const incomeAgg = await db.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: {
      organizationId: context.organizationId,
      accountId: { in: incomeAccounts.map((a: { id: string }) => a.id) },
      date: { gte: dateRange.start, lte: dateRange.end },
      status: 'ACTIVE'
    }
  });

  const totalExpense = expenseAgg._sum.amount ? new Prisma.Decimal(expenseAgg._sum.amount) : new Prisma.Decimal(0);
  const totalRecovery = incomeAgg._sum.amount ? new Prisma.Decimal(incomeAgg._sum.amount).abs() : new Prisma.Decimal(0);

  const delta = totalExpense.minus(totalRecovery);
  const rate = totalExpense.gt(0) ? totalRecovery.dividedBy(totalExpense).times(100) : new Prisma.Decimal(0);

  return {
    totalExpense: totalExpense.toNumber(),
    totalRecovery: totalRecovery.toNumber(),
    unrecoveredDelta: delta.toNumber(),
    recoveryRate: rate.toNumber()
  };
}
