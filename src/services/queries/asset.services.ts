import { getSovereignClient } from "@/src/lib/db";

/**
 * ASSET QUERY SERVICE (SOVEREIGN AUTHORITY)
 * 
 * Provides high-performance visibility into the Property and Unit inventory.
 */

/* ── 1. UNIT INVENTORY QUERIES ─────────────────────────────────────────── */

/**
 * Retrieves all OPERATIONAL units that do not have an active lease.
 */
export async function getAvailableUnitsService(context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.operatorId);

  const units = await db.unit.findMany({
    where: {
      organizationId: context.organizationId,
      maintenanceStatus: 'OPERATIONAL',
      leases: {
        none: {
          isActive: true
        }
      }
    },
    include: {
      property: true
    },
    orderBy: {
      unitNumber: 'asc'
    }
  });

  return units.map((u: any) => ({
    ...u,
    marketRent: Number(u.marketRent)
  }));
}
