import { EntityList } from "@/components/admin/EntityList";
import { prisma } from "@/lib/prisma";

export default async function TenantsPage() {
  // Fetch active entities for the registry
  const entities = await prisma.organization.findMany({
    where: { deletedAt: null },
    include: {
      users: {
        where: { deletedAt: null },
        select: {
          id: true,
          email: true,
          role: true,
          accountStatus: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-12 pb-24">
      <header>
        <h2 className="text-4xl font-light tracking-tight text-white mb-2">Tenant Administration</h2>
        <p className="text-neutral-500 font-light">Global state overview and organizational orchestration.</p>
      </header>

      <EntityList entities={entities as any} />
    </div>
  );
}
