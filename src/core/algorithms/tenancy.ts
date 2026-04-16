import { Prisma } from '@prisma/client';

/**
 * TENANCY CORE ALGORITHMS (AXIOM ENTERPRISE V3)
 * 
 * Stateless, deterministic functions for high-fidelity 
 * tenant lifecycle and forensic profiling.
 */

/**
 * ALGORITHM: FIFO CREDIT ALLOCATION
 * 
 * Allocates unallocated income/credits to outstanding charges in FIFO order.
 * Returns the necessary charge updates and the remaining credit balance.
 */
export type ChargeUpdate = {
  id: string;
  amountToApply: Prisma.Decimal;
  isFullyPaid: boolean;
};

export const calculateFIFOCreditAllocation = (
  unallocatedCredit: Prisma.Decimal | number,
  outstandingCharges: any[] // Expects { id, amount, amountPaid } sorted by Due Date (ASC)
): { updates: ChargeUpdate[], remainingCredit: Prisma.Decimal } => {
  let remaining = new Prisma.Decimal(unallocatedCredit);
  const updates: ChargeUpdate[] = [];

  for (const charge of outstandingCharges) {
    if (remaining.lte(0)) break;

    const amount = new Prisma.Decimal(charge.amount);
    const paid = new Prisma.Decimal(charge.amountPaid);
    const deficit = amount.minus(paid);

    if (deficit.lte(0)) continue;

    let apply = remaining;
    let fullyPaid = false;

    if (remaining.gte(deficit)) {
      apply = deficit;
      fullyPaid = true;
    }

    updates.push({
      id: charge.id,
      amountToApply: apply,
      isFullyPaid: fullyPaid
    });

    remaining = remaining.minus(apply);
  }

  return { updates, remainingCredit: remaining };
};

/**
 * ALGORITHM: TENANCY INTEGRITY SCORE (V3.1)
 * 
 * Calculates a risk-adjusted integrity score based on payment delays and defaults.
 * Model: Base 100 - (Avg Delay * 2) - (Unpaid Rent Count * 25)
 */
export const calculateTenancyIntegrityScore = (
  charges: { type: string, isFullyPaid: boolean, dueDate: Date }[],
  ledgerEntries: { amount: Prisma.Decimal, transactionDate: Date }[]
): number => {
  const rentCharges = charges.filter(c => c.type === 'RENT');
  const paidRent = rentCharges.filter(c => c.isFullyPaid);
  const unpaidRent = rentCharges.filter(c => !c.isFullyPaid);

  let totalDelayDays = 0;
  paidRent.forEach(c => {
    // Attempt to find a matching entry within roughly 30 days of the due date
    const matched = ledgerEntries.find(e => 
      Math.abs(new Date(e.transactionDate).getTime() - new Date(c.dueDate).getTime()) < 30 * 24 * 60 * 60 * 1000
    );

    if (matched) {
      const due = new Date(c.dueDate);
      const paid = new Date(matched.transactionDate);
      const diffDays = Math.ceil((paid.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) totalDelayDays += diffDays;
    }
  });

  const avgDelay = paidRent.length > 0 ? totalDelayDays / paidRent.length : 0;
  const score = 100 - (avgDelay * 2) - (unpaidRent.length * 25);
  
  return Math.max(0, Math.round(score));
};

/**
 * ALGORITHM: TENANCY STRIP-CHART GENERATOR
 */
export type StripStatus = 'GREEN' | 'YELLOW' | 'RED' | 'EMPTY';

export const generateTenancyStripChart = (
  charges: { type: string, isFullyPaid: boolean, dueDate: Date }[],
  ledgerEntries: { transactionDate: Date }[],
  lookbackMonths: number = 12
): { label: string, status: StripStatus }[] => {
  const strip = [];
  const now = new Date();
  
  for (let i = lookbackMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthCharge = charges.find(c => {
      const dueDate = new Date(c.dueDate);
      return c.type === 'RENT' && dueDate >= start && dueDate <= end;
    });

    let status: StripStatus = 'EMPTY';
    if (monthCharge) {
      if (!monthCharge.isFullyPaid) {
        status = 'RED';
      } else {
        const payment = ledgerEntries.find(e => 
          new Date(e.transactionDate) >= start && new Date(e.transactionDate) <= end
        );
        const grace = new Date(start);
        grace.setDate(5); // 5th grace period
        
        if (payment && new Date(payment.transactionDate) <= grace) {
          status = 'GREEN';
        } else {
          status = 'YELLOW';
        }
      }
    }
    
    strip.push({ 
      label: d.toLocaleString('default', { month: 'short' }), 
      status 
    });
  }
  
  return strip;
};

/**
 * ALGORITHM: PRORATED RENT CALCULATOR
 */
export const calculateProratedRent = (
  monthlyRent: Prisma.Decimal | number,
  moveInDate: Date
): Prisma.Decimal => {
  const rent = new Prisma.Decimal(monthlyRent);
  const d = new Date(moveInDate);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  
  const endOfMonth = new Date(Date.UTC(year, month + 1, 0));
  const daysInMonth = endOfMonth.getUTCDate();
  const currentDay = d.getUTCDate();
  const remainingDays = daysInMonth - currentDay + 1;
  
  const prorated = rent.dividedBy(daysInMonth).times(remainingDays);
  return prorated.toDecimalPlaces(2);
};
