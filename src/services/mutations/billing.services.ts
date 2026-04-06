import { getSovereignClient } from "@/src/lib/db";
import { Prisma } from "@prisma/client";
import { recordAuditLog } from "@/lib/audit-logger";

/**
 * BILLING AUTOMATION SERVICE (SOVEREIGN EDITION)
 * 
 * Orchestrates broad-spectrum financial events like monthly rent generation.
 * 
 * Mandate:
 * 1. Zero-Loss Idempotency (Prevents duplicate charges).
 * 2. Governance (Skips decommissioned assets).
 * 3. Atomic Batch Operations.
 */

/**
 * Executes a full billing cycle for the organization for a given target month.
 */
export async function runMonthlyBillingCycleService(
  targetDate: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);
  
  const targetTime = new Date(targetDate);
  const startOfMonth = new Date(targetTime.getFullYear(), targetTime.getMonth(), 1);
  const endOfMonth = new Date(targetTime.getFullYear(), targetTime.getMonth() + 1, 0);

  return await db.$transaction(async (tx: any) => {
    // 1. Fetch Active Leases for the tenant organization
    const activeLeases = await tx.lease.findMany({
      where: { 
        isActive: true, 
        organizationId: context.organizationId 
      },
      include: { unit: true }
    });

    let generatedCount = 0;
    let bypassedCount = 0;
    const generatedIds: string[] = [];

    for (const lease of activeLeases) {
      // GOVERNANCE: Skip decommissioned units
      if (lease.unit.maintenanceStatus === 'DECOMMISSIONED') {
        bypassedCount++;
        continue;
      }

      // IDEMPOTENCY: Check for existing RENT charge in the period
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

    // 2. Aggregate Audit Surveillance
    if (generatedCount > 0) {
      await recordAuditLog({
        action: 'CREATE',
        entityType: 'CHARGE',
        entityId: `BILLING_CYCLE_${startOfMonth.toISOString()}`,
        metadata: { 
          cycleStart: startOfMonth, 
          generated: generatedCount, 
          bypassed: bypassedCount,
          recordIds: generatedIds 
        },
        tx: tx as any
      });
    }

    return { 
      generated: generatedCount, 
      bypassed: bypassedCount 
    };
  });
}
