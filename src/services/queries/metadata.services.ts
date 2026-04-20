import { getSovereignClient } from "@/src/lib/db";

/**
 * METADATA QUERY SERVICE (SOVEREIGN AUTHORITY)
 * 
 * Provides structural metadata (Properties, Tenants) specifically for
 * populating high-density filter bars and selection interfaces.
 */

export async function getLedgerFilterMetadataService(context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.organizationId);

  const [properties, tenants, accounts, categories] = await Promise.all([
    db.property.findMany({
      where: { organizationId: context.organizationId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    db.tenant.findMany({
      where: { organizationId: context.organizationId, isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    db.account.findMany({
      where: { organizationId: context.organizationId },
      select: { id: true, name: true, category: true },
      orderBy: { name: 'asc' }
    }),
    db.expenseCategory.findMany({
      where: { organizationId: context.organizationId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return { properties, tenants, accounts, categories };
}
