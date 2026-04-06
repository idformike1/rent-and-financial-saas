import { getSovereignClient } from "@/src/lib/db";

/**
 * UNIT QUERY SERVICE (SOVEREIGN EDITION)
 * 
 * Provides high-performance visibility into the property unit inventory.
 */

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
