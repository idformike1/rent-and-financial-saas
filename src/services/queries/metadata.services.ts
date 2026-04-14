import { getSovereignClient } from "@/src/lib/db";

/**
 * METADATA QUERY SERVICE (SOVEREIGN AUTHORITY)
 * 
 * Provides structural metadata (Properties, Tenants) specifically for
 * populating high-density filter bars and selection interfaces.
 */

export async function getLedgerFilterMetadataService(context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.operatorId);

  const [properties, tenants] = await Promise.all([
    db.property.findMany({
      where: { organizationId: context.organizationId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    db.tenant.findMany({
      where: { organizationId: context.organizationId, isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return { properties, tenants };
}
