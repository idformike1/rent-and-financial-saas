import { Prisma } from '@prisma/client';

/**
 * FINANCIAL CORE ALGORITHMS (AXIOM ENTERPRISE V3)
 * 
 * Stateless, deterministic functions for high-precision 
 * financial calculations and data normalization.
 * 
 * MANDATE: All financial math must use Prisma.Decimal to prevent 
 * floating-point rounding errors in aggregate ledgers.
 */

/**
 * GLOBAL FINANCIAL PERIODS (ONTOLOGY SYNC)
 * Ensures all dashboard metrics and registry views share the same 
 * temporal window for gross recognition.
 */
export const FINANCIAL_PERIODS = {
  REAL_TIME: 0,
  TRAILING_MONTH: 30,
  TRAILING_QUARTER: 90,
  FISCAL_YEAR: 365
};

/**
 * Validates if a transaction date falls within the defined period.
 */
export const isWithinPeriod = (date: Date, days: number): boolean => {
  if (days === 0) return true; // All-time
  const now = new Date();
  const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= periodStart && date <= now;
};

/**
 * Generates a Prisma-compatible date range fragment for the defined period.
 * (Trailing Days architecture)
 */
export const getTemporalFragment = (days: number): { transactionDate: { gte: Date, lte: Date } } | {} => {
  if (days === 0) return {}; // All-time
  const now = new Date();
  const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { transactionDate: { gte: periodStart, lte: now } };
};

/**
 * REVENUE FILTER CONTEXT (GOVERNANCE STANDARD)
 * Defines the criteria for 'Gross Recognition' to exclude non-operating noise.
 */
export const REVENUE_FILTER_CONTEXT = {
  NOT: [
    { description: { contains: 'TRANSFER', mode: 'insensitive' as const } },
    { description: { contains: 'INTERNAL', mode: 'insensitive' as const } },
    { description: { contains: 'REFUND', mode: 'insensitive' as const } }
  ]
};

/**
 * Ensures a value is represented as a negative outflow (Expense).
 */
export const toNegativeOutflow = (amount: Prisma.Decimal | number): Prisma.Decimal => {
  const d = new Prisma.Decimal(amount);
  return d.abs().negated();
};

/**
 * Calculates total volume across a record set.
 */
export const calculateTotalVolume = (records: { amount: Prisma.Decimal | number }[]): Prisma.Decimal => {
  return records.reduce((sum, r) => sum.plus(new Prisma.Decimal(r.amount).abs()), new Prisma.Decimal(0));
};

/**
 * ALGORITHM: PAYMENT WATERFALL (PRIORITY-BASED)
 * 
 * Distributes a payment amount across a set of outstanding charges.
 * Mandate: Prioritize high-risk debt (Fees/Utilities) before basic rent revenue.
 * 
 * Priority Hierarchy:
 * 1. LATE_FEE
 * 2. UTILITIES (WATER_SUBMETER, ELEC_SUBMETER)
 * 3. RENT
 * 4. OTHERS (SECURITY_DEPOSIT, etc.)
 */
export type ChargeDistro = {
  id: string;
  amountToApply: Prisma.Decimal;
  isFullyPaid: boolean;
};

export const calculateWaterfallDistribution = (
  paymentAmount: Prisma.Decimal | number,
  charges: any[] // Expects { id, amount, amountPaid, type, createdAt }
): { distributions: ChargeDistro[], remainingCredit: Prisma.Decimal } => {
  let amountRemaining = new Prisma.Decimal(paymentAmount);
  const distributions: ChargeDistro[] = [];

  // Define Priority Mapping
  const getPriority = (type: string) => {
    if (type === 'LATE_FEE') return 1;
    if (type === 'WATER_SUBMETER' || type === 'ELEC_SUBMETER') return 2;
    if (type === 'RENT') return 3;
    return 4; // Other charges (Deposit, etc.)
  };

  // Execute Strict Waterfall Sorting
  const sorted = [...charges].sort((a, b) => {
    const p1 = getPriority(a.type);
    const p2 = getPriority(b.type);
    
    if (p1 !== p2) return p1 - p2;
    
    // Fallback: FIFO based on fiscal due date
    const t1 = new Date(a.dueDate).getTime();
    const t2 = new Date(b.dueDate).getTime();
    return t1 - t2;
  });

  for (const charge of sorted) {
    if (amountRemaining.lte(0)) break;

    const owed = new Prisma.Decimal(charge.amount).minus(new Prisma.Decimal(charge.amountPaid));
    if (owed.lte(0)) continue;

    let apply = amountRemaining;
    let fullyPaid = false;

    if (amountRemaining.gte(owed)) {
      apply = owed;
      fullyPaid = true;
    }

    distributions.push({
      id: charge.id,
      amountToApply: apply,
      isFullyPaid: fullyPaid
    });

    amountRemaining = amountRemaining.minus(apply);
  }

  return { distributions, remainingCredit: amountRemaining };
};

/**
 * ALGORITHM: P&L AGGREGATOR
 */
export const calculatePLMetrics = (
  revenueEntries: { amount: Prisma.Decimal | number }[],
  expenseEntries: { amount: Prisma.Decimal | number }[]
) => {
  const totalRevenue = revenueEntries.reduce((sum, e) => sum.plus(new Prisma.Decimal(e.amount)), new Prisma.Decimal(0));
  const totalExpense = expenseEntries.reduce((sum, e) => sum.plus(new Prisma.Decimal(e.amount)), new Prisma.Decimal(0));
  
  const noi = totalRevenue.minus(totalExpense);
  const oer = totalRevenue.gt(0) ? totalExpense.dividedBy(totalRevenue).times(100) : new Prisma.Decimal(0);

  return {
    totalRevenue,
    totalExpense,
    noi,
    oer
  };
};
