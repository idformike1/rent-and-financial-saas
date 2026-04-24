import { EntityList } from "@/components/admin/EntityList";
import ProvisionVaultModal from "@/components/admin/ProvisionVaultModal";
import { prisma } from "@/lib/prisma";

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
    isSuspended: org.isSuspended,
    users: org.members.map(m => ({
      id: m.user.id,
      email: m.user.email,
      role: m.role,
      accountStatus: m.user.accountStatus,
      canAccessRent: m.canAccessRent,
      canAccessWealth: m.canAccessWealth
    }))
  }));

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-2">Vault Registry</h2>
          <p className="text-neutral-500 font-light uppercase tracking-widest text-[10px]">Orchestrate global organizational silos and identity access.</p>
        </div>
        
        <ProvisionVaultModal />
      </header>

      <EntityList entities={entities as any} />
    </div>
  );
}


