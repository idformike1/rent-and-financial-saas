import { EntityList } from "@/components/admin/EntityList";
import { prisma } from "@/lib/prisma";
import { MigrationTrigger } from "@/components/admin/MigrationTrigger";

export default async function TenantsPage() {
  // Fetch active entities for the registry via the junction table
  const rawEntities = await prisma.organization.findMany({
    where: { deletedAt: null },
    include: {
      members: {
        where: { user: { deletedAt: null } },
        include: {
          user: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Map to unified structure for EntityList
  const entities = rawEntities.map(org => ({
    id: org.id,
    name: org.name,
    users: org.members.map(m => ({
      id: m.user.id,
      email: m.user.email,
      role: m.role, // Use role from membership
      accountStatus: m.user.accountStatus,
      canAccessRent: m.canAccessRent,
      canAccessWealth: m.canAccessWealth
    }))
  }));

  return (
    <div className="space-y-12 pb-24">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-2">Tenant Administration</h2>
          <p className="text-neutral-500 font-light">Global state overview and organizational orchestration.</p>
        </div>
        <MigrationTrigger />
      </header>

      <EntityList entities={entities as any} />
    </div>
  );
}

