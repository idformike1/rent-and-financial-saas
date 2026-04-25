import { getSovereignClient } from "@/src/lib/db";
import { 
  calculateFIFOCreditAllocation, 
  calculateTenancyIntegrityScore, 
  generateTenancyStripChart 
} from "@/src/core/algorithms/tenancy";
import { Prisma } from "@prisma/client";
import { recordAuditLog } from "@/lib/audit-logger";

/**
 * TENANT SERVICE (SOVEREIGN EDITION)
 * 
 * Orchestrates tenant lifecycle, debt materialization, and forensic risk profiling.
 * 
 * Mandate:
 * 1. Decimal-Safe Math (Prisma.Decimal).
 * 2. Automated Surveillance via Shielded Client.
 * 3. Atomic Multi-Step Transactions.
 */

/**
 * Normalizes and materializes the Tenant Forensic Dossier.
 */
export async function getTenantForensicDossierService(
  tenantId: string, 
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  const [tenant, ledgerEntries] = await Promise.all([
    db.tenant.findFirst({
      where: { id: tenantId, organizationId: context.organizationId },
      include: {
        leases: { include: { unit: true }, orderBy: { startDate: 'desc' } },
        charges: { orderBy: { dueDate: 'desc' } }
      }
    }),
    db.ledgerEntry.findMany({
      where: { 
        tenantId: tenantId,
        organizationId: context.organizationId
      },
      orderBy: { transactionDate: 'desc' }
    })
  ]);

  if (!tenant) throw new Error("ERR_TENANT_RECORD_ABSENT");

  // Algorithm Delegation: Integrity Score & Strip Chart
  const integrityScore = calculateTenancyIntegrityScore(tenant.charges, ledgerEntries);
  const stripChart = generateTenancyStripChart(tenant.charges, ledgerEntries);

  // 2. LEDGER UNIFICATION (Truth Feed Source)
  // We merge Charges and LedgerEntries into a unified array and force 
  // the client to consume this as the single source of truth.
  const unifiedLedger = [
    ...tenant.charges.map(c => ({
      id: c.id,
      transactionDate: c.dueDate,
      description: `${c.type.replace('_', ' ')} Obligation`,
      type: 'DEBIT',
      amount: Number(c.amount)
    })),
    ...ledgerEntries.map(e => ({
      id: e.id,
      transactionDate: e.transactionDate,
      description: e.description,
      type: 'CREDIT',
      amount: Number(e.amount)
    }))
  ].sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

  return {
    tenant: {
      ...tenant,
      ledgerEntries: unifiedLedger,
      integrityScore,
      stripChart
    }
  };
}

/**
 * Executes a FIFO liquidation of unallocated tenant credits to resolve outstanding debt.
 */
export async function liquidateTenantDebtService(
  tenantId: string, 
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    const tenant = await tx.tenant.findFirst({
      where: { id: tenantId, organizationId: context.organizationId },
      include: {
        charges: { 
          where: { isFullyPaid: false, amount: { gt: 0 }, organizationId: context.organizationId },
          orderBy: { dueDate: 'asc' } 
        },
        ledgerEntries: { 
          where: { account: { category: 'INCOME' }, organizationId: context.organizationId } 
        }
      }
    });

    if (!tenant) throw new Error("ERR_TENANT_RECORD_ABSENT");

    // Logic Trace: Calculate total Charges vs total Payments
    const totalCharges = tenant.charges.reduce((acc: Prisma.Decimal, c: { amount: Prisma.Decimal }) => acc.plus(c.amount), new Prisma.Decimal(0));
    const totalPayments = tenant.ledgerEntries.reduce((acc: Prisma.Decimal, e: { amount: Prisma.Decimal }) => acc.plus(e.amount.abs()), new Prisma.Decimal(0));
    
    // Check for actual liquidity gap
    const alreadyApplied = tenant.charges.reduce((acc: Prisma.Decimal, c: { amountPaid: Prisma.Decimal }) => acc.plus(c.amountPaid), new Prisma.Decimal(0));
    const unallocatedCredit = totalPayments.minus(alreadyApplied);

    if (unallocatedCredit.lte(0)) throw new Error("ERR_FISCAL_CONFLICT: No unallocated credits detected for liquidation.");

    // Algorithm Delegation: FIFO Waterfall
    const { updates, remainingCredit } = calculateFIFOCreditAllocation(
      unallocatedCredit,
      tenant.charges
    );

    // Commit Redistribution: Parallelized to avoid sequential N+1 round-trips
    await Promise.all(updates.map(update => 
      tx.charge.updateMany({
        where: { id: update.id, organizationId: context.organizationId },
        data: {
          amountPaid: { increment: update.amountToApply },
          isFullyPaid: update.isFullyPaid
        }
      })
    ));

    await recordAuditLog({
      action: 'UPDATE',
      entityType: 'TENANT',
      entityId: tenantId,
      metadata: { action: 'DEBT_LIQUIDATION', applied: unallocatedCredit.toNumber(), remaining: remainingCredit.toNumber() },
      tx: tx as any
    });

    return { success: true, processed: unallocatedCredit.toNumber() };
  });
}

/**
 * Standardizes the Move-Out protocol, archiving leases and identifying decommissioned units.
 */
export async function processMoveOutService(
  payload: { tenantId: string, leaseId: string, unitId: string },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    // 1. Archive Lease
    await tx.lease.updateMany({
      where: { id: payload.leaseId, organizationId: context.organizationId },
      data: { isActive: false, endDate: new Date() }
    });

    // 2. Unit Maintenance Reset
    await tx.unit.updateMany({
      where: { id: payload.unitId, organizationId: context.organizationId },
      data: { maintenanceStatus: 'OPERATIONAL' }
    });

    // 3. Purge Unsatisfied Charges
    await tx.charge.deleteMany({
       where: { 
         tenantId: payload.tenantId, 
         leaseId: payload.leaseId, 
         isFullyPaid: false, 
         organizationId: context.organizationId 
       }
    });

    await recordAuditLog({
      action: 'MOVE_OUT',
      entityType: 'TENANT',
      entityId: payload.tenantId,
      metadata: { unitId: payload.unitId, leaseId: payload.leaseId },
      tx: tx as any
    });

    return { success: true };
  });
}

/**
 * STRATEGIC ONBOARDING PROTOCOL (V3.1)
 * 
 * Orchestrates the materialization of a new Tenant, Lease, and initial Charges 
 * (Security Deposit + Prorated Rent) in a single atomic transaction.
 */
export async function submitOnboardingService(
  payload: {
    tenantName: string;
    email?: string;
    phone?: string;
    nationalId?: string;
    unitId: string;
    baseRent: number;
    securityDeposit: number;
    moveInDate: string;
  },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);
  const { calculateProratedRent } = await import("@/src/core/algorithms/tenancy");

  return await db.$transaction(async (tx: any) => {
    // 1. DEDUPLICATION (Sovereign Context)
    if (payload.email || payload.phone) {
      const existing = await tx.tenant.findFirst({
        where: {
          organizationId: context.organizationId,
          OR: [
            ...(payload.email ? [{ email: payload.email }] : []),
            ...(payload.phone ? [{ phone: payload.phone }] : [])
          ],
          isDeleted: false
        }
      });

      if (existing) throw new Error(`ERR_PROTOCOL_VIOLATION: Tenant already registered (${existing.name}).`);
    }

    const unit = await tx.unit.findFirst({ 
      where: { id: payload.unitId, organizationId: context.organizationId },
      include: { leases: { where: { isActive: true } } }
    });

    if (!unit) throw new Error("ERR_UNIT_ABSENT");
    if (unit.leases.length > 0) throw new Error("ERR_PROTOCOL_VIOLATION: Unit currently occupied.");
    if (unit.maintenanceStatus === 'DECOMMISSIONED') throw new Error("ERR_PROTOCOL_VIOLATION: Unit decommissioned.");

    const moveIn = new Date(payload.moveInDate);
    const proratedRent = calculateProratedRent(payload.baseRent, moveIn);
    const secDep = new Prisma.Decimal(payload.securityDeposit);

    /**
     * PRO-RATA FISCAL MATH (CALENDAR-PRECISION)
     * 1. Determine total days in move-in month.
     * 2. Calculate daily rate (Monthly Rent / Days in Month).
     * 3. Calculate remaining days (Days in Month - MoveIn Date + 1).
     * 4. Pro-Rata Amount = Daily Rate * Remaining Days.
     */

    // 2. MATERIALIZATION: TENANT
    const tenant = await tx.tenant.create({
      data: { 
        organizationId: context.organizationId,
        name: payload.tenantName,
        email: payload.email,
        phone: payload.phone,
        nationalId: payload.nationalId,
        isDeleted: false
      }
    });

    // 3. MATERIALIZATION: LEASE
    const endDate = new Date(moveIn);
    endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);

    const lease = await tx.lease.create({
      data: {
        organizationId: context.organizationId,
        tenantId: tenant.id,
        unitId: payload.unitId,
        isPrimary: true,
        rentAmount: new Prisma.Decimal(payload.baseRent),
        depositAmount: secDep,
        startDate: moveIn,
        endDate,
        isActive: true
      }
    });

    // 4. FINANCIAL INITIALIZATION (ESCROW ISOLATION + PRO-RATA REVENUE)
    // We explicitly isolate the Security Deposit as a liability/escrow charge.
    await tx.charge.createMany({
      data: [
        {
          organizationId: context.organizationId,
          tenantId: tenant.id,
          leaseId: lease.id,
          type: 'SECURITY_DEPOSIT', 
          amount: secDep,
          amountPaid: 0,
          dueDate: moveIn,
          isFullyPaid: false,
        },
        {
          organizationId: context.organizationId,
          tenantId: tenant.id,
          leaseId: lease.id,
          type: 'RENT', 
          amount: proratedRent,
          amountPaid: 0,
          dueDate: moveIn,
          isFullyPaid: false,
        }
      ]
    });

    await tx.unit.updateMany({
      where: { id: payload.unitId, organizationId: context.organizationId },
      data: { maintenanceStatus: 'OPERATIONAL' }
    });

    await recordAuditLog({
      action: 'CREATE',
      entityType: 'TENANT',
      entityId: tenant.id,
      metadata: { action: 'ONBOARDING', leaseId: lease.id },
      tx: tx as any
    });

    return { tenantId: tenant.id, leaseId: lease.id };
  });
}

/**
 * IDENTITY PROTOCOL: PRE-MISSION VALIDATION (SERVICE)
 */
export async function checkTenantExistenceService(
  query: { name: string, email?: string, phone?: string },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  const nameMatch = await db.tenant.findFirst({
    where: { organizationId: context.organizationId, name: { equals: query.name, mode: 'insensitive' }, isDeleted: false }
  });
  if (nameMatch) return { exists: true, message: `Identity Conflict: Tenant '${nameMatch.name}' already registered.` };

  if (query.email) {
    const emailMatch = await db.tenant.findFirst({
      where: { organizationId: context.organizationId, email: { equals: query.email, mode: 'insensitive' }, isDeleted: false }
    });
    if (emailMatch) return { exists: true, message: `Identity Conflict: Email '${query.email}' already associated with '${emailMatch.name}'.` };
  }

  return { exists: false };
}

/**
 * Recalibrates tenant metadata with audit trail.
 */
export async function updateTenantDetailsService(
  tenantId: string, 
  data: { name: string, email?: string, phone?: string, nationalId?: string },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    const result = await tx.tenant.updateMany({
      where: { id: tenantId, organizationId: context.organizationId },
      data: { 
        name: data.name,
        email: data.email,
        phone: data.phone,
        nationalId: data.nationalId
      }
    });

    if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Tenant not found or access denied.");

    await recordAuditLog({
      action: 'UPDATE',
      entityType: 'TENANT',
      entityId: tenantId,
      metadata: { name: data.name, email: data.email },
      tx: tx as any
    });

    return { id: tenantId, ...data };
  });
}

/**
 * Executes a definitive tenant soft-deletion and lease archiving protocol.
 */
export async function softDeleteTenantService(
  tenantId: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    // 1. ARCHIVE IDENTITY
    await tx.tenant.updateMany({
      where: { id: tenantId, organizationId: context.organizationId },
      data: { isDeleted: true }
    });

    // 2. ARCHIVE ACTIVE LEASES
    await tx.lease.updateMany({
       where: { tenantId, isActive: true, organizationId: context.organizationId },
       data: { isActive: false, endDate: new Date() }
    });

    await recordAuditLog({
       action: 'DELETE',
       entityType: 'TENANT',
       entityId: tenantId,
       metadata: { archiveDate: new Date() },
       tx: tx as any
    });
  });
}

/**
 * Materializes an additional lease for multi-unit tenancy scenarios.
 */
export async function addAdditionalLeaseService(
  data: { 
    tenantId: string, 
    unitId: string, 
    rentAmount: number, 
    depositAmount: number,
    startDate: string 
  },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    const unit = await tx.unit.findFirst({ 
      where: { id: data.unitId, organizationId: context.organizationId } 
    });
    
    if (!unit) throw new Error("ERR_UNIT_ABSENT");
    if (unit.maintenanceStatus === 'DECOMMISSIONED') {
      throw new Error("ERR_PROTOCOL_VIOLATION: Unit is currently DECOMMISSIONED.");
    }

    const moveIn = new Date(data.startDate);
    const endDate = new Date(moveIn);
    endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);

    const lease = await tx.lease.create({
      data: {
        organizationId: context.organizationId,
        tenantId: data.tenantId,
        unitId: data.unitId,
        isPrimary: false,
        rentAmount: new Prisma.Decimal(data.rentAmount),
        depositAmount: new Prisma.Decimal(data.depositAmount),
        startDate: moveIn,
        endDate,
        isActive: true
      }
    });

    await tx.unit.updateMany({
      where: { id: data.unitId, organizationId: context.organizationId },
      data: { maintenanceStatus: 'OPERATIONAL' }
    });

    await recordAuditLog({
      action: 'CREATE',
      entityType: 'LEASE',
      entityId: lease.id,
      metadata: { tenantId: data.tenantId, unitId: data.unitId },
      tx: tx as any
    });

    return lease;
  });
}
