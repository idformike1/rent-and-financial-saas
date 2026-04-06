import { getSovereignClient } from "@/src/lib/db";
import { Prisma } from "@prisma/client";
import { MaintenanceStatus } from "@/src/schema/enums";
import { recordAuditLog } from "@/lib/audit-logger";

/**
 * UNIT SERVICE (SOVEREIGN EDITION)
 * 
 * Orchestrates the creation and maintenance lifecycle of property units.
 * 
 * Mandate:
 * 1. Decimal-Safe Math (Prisma.Decimal).
 * 2. Automated Surveillance via Shielded Client.
 * 3. Atomic Multi-Step Transactions.
 */

/**
 * Materializes a new unit within a property registry.
 */
export async function createUnitService(
  payload: { 
    unitNumber: string, 
    type: string, 
    category: string, 
    propertyId: string, 
    marketRent?: number 
  },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    const unit = await tx.unit.create({
      data: {
        organizationId: context.organizationId,
        unitNumber: payload.unitNumber,
        type: payload.type,
        category: payload.category,
        propertyId: payload.propertyId,
        marketRent: payload.marketRent || 0,
        maintenanceStatus: 'OPERATIONAL'
      }
    });

    await recordAuditLog({
      action: 'CREATE',
      entityType: 'UNIT',
      entityId: unit.id,
      metadata: { unitNumber: payload.unitNumber, propertyId: payload.propertyId },
      tx: tx as any
    });

    return unit;
  });
}

/**
 * Updates an existing unit's maintenance status or market rent.
 */
export async function updateUnitService(
  unitId: string,
  payload: { 
    maintenanceStatus?: MaintenanceStatus, 
    marketRent?: number, 
    propertyId?: string 
  },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    const unit = await tx.unit.update({
      where: { id: unitId, organizationId: context.organizationId },
      data: {
        maintenanceStatus: payload.maintenanceStatus,
        marketRent: payload.marketRent
      }
    });

    await recordAuditLog({
      action: 'UPDATE',
      entityType: 'UNIT',
      entityId: unitId,
      metadata: payload,
      tx: tx as any
    });

    return unit;
  });
}
