import { getSovereignClient } from "@/src/lib/db";
import { rankSearchResults } from "@/src/core/algorithms/governance";

/**
 * SYSTEM QUERY SERVICES (SOVEREIGN AUTHORITY)
 *
 * Provides high-performance, cross-domain search visibility into the registry.
 */

/**
 * Executes a Deep Scan across all primary entity types with strict tenant isolation.
 */
export async function deepScanSystemService(
  query: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  if (!query || query.length < 2) return [];

  const [tenants, properties, categories, units] = await Promise.all([
    db.tenant.findMany({
      where: {
        organizationId: context.organizationId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 5
    }),
    db.property.findMany({
      where: {
        organizationId: context.organizationId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 5
    }),
    db.expenseCategory.findMany({
      where: {
        organizationId: context.organizationId,
        name: { contains: query, mode: 'insensitive' }
      },
      take: 3
    }),
    db.unit.findMany({
      where: {
        organizationId: context.organizationId,
        unitNumber: { contains: query, mode: 'insensitive' }
      },
      take: 3
    })
  ]);

  const rawResults = [
    ...tenants.map((t: any) => ({ id: t.id, title: t.name, type: 'TENANT', href: `/tenants/${t.id}`, description: t.email })),
    ...properties.map((p: any) => ({ id: p.id, title: p.name, type: 'ASSET', href: `/properties/${p.id}`, description: p.address || 'Property' })),
    ...categories.map((c: any) => ({ id: c.id, title: c.name, type: 'GOVERNANCE', href: '/settings/categories', description: 'Expense Category' })),
    ...units.map((u: any) => ({ id: u.id, title: `Unit ${u.unitNumber}`, type: 'ASSET', href: '/properties', description: u.type })),
  ];

  return rankSearchResults(rawResults, query);
}
