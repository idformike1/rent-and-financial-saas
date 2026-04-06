import { getSovereignClient } from "@/src/lib/db";
import { recordAuditLog } from "@/lib/audit-logger";

/**
 * PROPERTY SERVICE (SOVEREIGN EDITION)
 * 
 * Orchestrates the creation and destruction of property assets within the registry.
 * 
 * Mandate:
 * 1. Governance Enforcement (Entity-Locking).
 * 2. Non-repudiation (Surveillance Audit).
 * 3. Atomic Multi-Step Transactions.
 */

/**
 * Materializes a new property asset.
 */
export async function createPropertyService(
  payload: { name: string, address: string },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    const property = await tx.property.create({
      data: {
        organizationId: context.organizationId,
        name: payload.name,
        address: payload.address
      }
    });

    await recordAuditLog({
      action: 'CREATE',
      entityType: 'PROPERTY',
      entityId: property.id,
      metadata: { name: payload.name },
      tx: tx as any
    });

    return property;
  });
}

/**
 * Executes a property vaporization if and only if no subordinate assets exist.
 */
export async function deletePropertyService(
  propertyId: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    const unitsCount = await tx.unit.count({ 
      where: { propertyId, organizationId: context.organizationId } 
    });

    if (unitsCount > 0) {
      throw new Error("ERR_ENTITY_LOCKED: Cannot vaporize property with active units registry.");
    }

    await tx.property.delete({
      where: { id: propertyId, organizationId: context.organizationId }
    });

    await recordAuditLog({
      action: 'DELETE',
      entityType: 'PROPERTY',
      entityId: propertyId,
      tx: tx as any
    });
  });
}
