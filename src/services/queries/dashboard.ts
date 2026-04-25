import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * DASHBOARD KPI SERVICE (PHASE 1: RENT WORKSPACE)
 * 
 * Hydrates the operational command center with real-time financial 
 * and occupancy metrics. 
 */
export async function getDashboardKPIs(orgId: string) {
  const [totalUnits, unitsWithActiveLeases, ledgerSummaries, arrearsSummary] = await Promise.all([
    // 1. Total Unit Count
    prisma.unit.count({
      where: { organizationId: orgId, deletedAt: null }
    }),
    
    // 2. Units with Active Leases
    prisma.unit.count({
      where: {
        organizationId: orgId,
        deletedAt: null,
        leases: {
          some: {
            isActive: true,
            deletedAt: null
          }
        }
      }
    }),

    // 3. Ledger Summaries (NOI Calculation)
    prisma.ledgerEntry.groupBy({
      by: ['type'],
      where: { 
        organizationId: orgId,
        status: 'ACTIVE',
        deletedAt: null,
        NOT: [
          { description: { contains: 'TRANSFER', mode: 'insensitive' } },
          { description: { contains: 'INTERNAL', mode: 'insensitive' } },
          { description: { contains: 'REFUND', mode: 'insensitive' } }
        ]
      },
      _sum: {
        amount: true
      }
    }),

    // 4. Arrears Summary (Unpaid Charges)
    prisma.charge.aggregate({
      where: {
        organizationId: orgId,
        isFullyPaid: false,
        deletedAt: null
      },
      _sum: {
        amount: true,
        amountPaid: true
      }
    })
  ]);

  // Occupancy Math
  const occupancy = totalUnits > 0 
    ? (unitsWithActiveLeases / totalUnits) * 100 
    : 0;

  // NOI Math (Payments - Expenses)
  let payments = new Prisma.Decimal(0);
  let expenses = new Prisma.Decimal(0);

  ledgerSummaries.forEach(s => {
    const amount = s._sum.amount || new Prisma.Decimal(0);
    if (s.type === 'CREDIT') {
      payments = payments.plus(amount);
    } else if (s.type === 'DEBIT') {
      expenses = expenses.plus(amount);
    }
  });

  const noi = payments.minus(expenses);

  // Arrears Math (Owed - Paid)
  const totalCharged = arrearsSummary._sum.amount || new Prisma.Decimal(0);
  const totalPaid = arrearsSummary._sum.amountPaid || new Prisma.Decimal(0);
  const arrears = totalCharged.minus(totalPaid);

  return {
    occupancy: Number(occupancy.toFixed(2)),
    noi: Number(noi.toFixed(2)),
    arrears: Number(arrears.toFixed(2))
  };
}
