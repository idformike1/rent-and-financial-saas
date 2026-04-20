import { getSovereignClient } from "@/src/lib/db";
import { MaintenanceStatus } from "@/src/schema/enums";
import { recordAuditLog } from "@/lib/audit-logger";

/**
 * ASSET MUTATION SERVICE (SOVEREIGN AUTHORITY)
 * 
 * Orchestrates all physical inventory commands: Properties and Units.
 * 
 * Mandate:
 * 1. Governance Enforcement (Entity-Locking).
 * 2. Non-repudiation (Surveillance Audit).
 * 3. Atomic Multi-Step Transactions.
 */

/* ── 1. PROPERTY LIFECYCLE ─────────────────────────────────────────────── */

export async function createPropertyService(
  payload: { name: string, address: string },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

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

export async function updatePropertyService(
  propertyId: string,
  payload: { name?: string, address?: string },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    const result = await tx.property.updateMany({
      where: { id: propertyId, organizationId: context.organizationId },
      data: {
        name: payload.name,
        address: payload.address
      }
    });

    if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Property not found or access denied.");

    await recordAuditLog({
      action: 'UPDATE',
      entityType: 'PROPERTY',
      entityId: propertyId,
      metadata: payload,
      tx: tx as any
    });

    return { id: propertyId, ...payload };
  });
}

export async function deletePropertyService(
  propertyId: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    const unitsCount = await tx.unit.count({ 
      where: { propertyId, organizationId: context.organizationId } 
    });

    if (unitsCount > 0) {
      throw new Error("ERR_ENTITY_LOCKED: Cannot vaporize property with active units registry.");
    }

    const result = await tx.property.deleteMany({
      where: { id: propertyId, organizationId: context.organizationId }
    });

    if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Property not found or access denied.");

    await recordAuditLog({
      action: 'DELETE',
      entityType: 'PROPERTY',
      entityId: propertyId,
      tx: tx as any
    });
  });
}

/* ── 2. UNIT LIFECYCLE ─────────────────────────────────────────────────── */

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
  const db = getSovereignClient(context.organizationId);

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

export async function updateUnitService(
  unitId: string,
  payload: { 
    maintenanceStatus?: MaintenanceStatus, 
    marketRent?: number, 
    propertyId?: string,
    unitNumber?: string,
    type?: string,
    category?: string
  },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    const result = await tx.unit.updateMany({
      where: { id: unitId, organizationId: context.organizationId },
      data: {
        maintenanceStatus: payload.maintenanceStatus,
        marketRent: payload.marketRent,
        unitNumber: payload.unitNumber,
        category: payload.category,
        type: payload.type
      }
    });

    if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Unit not found or access denied.");

    await recordAuditLog({
      action: 'UPDATE',
      entityType: 'UNIT',
      entityId: unitId,
      metadata: payload,
      tx: tx as any
    });

    return { id: unitId, ...payload };
  });
}
