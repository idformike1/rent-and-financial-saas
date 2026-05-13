import { prisma } from '@/src/lib/prisma';
import { EntityList } from '@/src/components/finova/admin/EntityList';
import ProvisionVaultModal from '@/src/components/finova/admin/ProvisionVaultModal';
import { Shield, Layers, Users } from 'lucide-react';

export default async function SystemRegistryPage() {
  // 1. Fetch the entire organizational landscape
  const rawEntities = await prisma.organization.findMany({
    where: { deletedAt: null },
    include: {
      users: {
        where: { deletedAt: null },
        select: {
          id: true,
          email: true,
          role: true,
          accountStatus: true,
          memberships: {
            select: {
              organizationId: true,
              canAccessRent: true,
              canAccessWealth: true
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  // 2. Map entitlements from memberships to the flat structure expected by EntityList
  const entities = rawEntities.map(org => ({
    ...org,
    users: org.users.map(user => {
      const membership = user.memberships.find(m => m.organizationId === org.id);
      return {
        ...user,
        canAccessRent: membership?.canAccessRent ?? true,
        canAccessWealth: membership?.canAccessWealth ?? true
      };
    })
  }));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-light tracking-tight text-white">System Registry</h2>
          </div>
          <p className="text-neutral-500 font-light uppercase tracking-widest text-[10px] max-w-lg leading-relaxed">
            Global Infrastructure Management • Authorized for ROOT_ADMIN only. Orchestrate organizational vaults and manage administrative identities across the Sovereign Mesh.
          </p>
        </div>

        <div className="flex items-center gap-4">
           {/* Global Stats Counter */}
           <div className="hidden lg:flex items-center gap-6 mr-4 px-6 border-r border-white/5">
              <div className="text-right">
                <span className="block text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Total Vaults</span>
                <span className="text-lg font-mono text-white">{entities.length}</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Active Identities</span>
                <span className="text-lg font-mono text-white">{entities.reduce((acc, curr) => acc + curr.users.length, 0)}</span>
              </div>
           </div>
           
           <ProvisionVaultModal />
        </div>
      </header>

      {/* REGISTRY ENGINE */}
      <div className="h-[calc(100vh-280px)] min-h-[600px]">
        <EntityList entities={entities as any} />
      </div>

      <footer className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <Layers size={12} className="text-neutral-600" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-600">Siloed Architecture</span>
           </div>
           <div className="flex items-center gap-2">
              <Users size={12} className="text-neutral-600" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-600">Unified Identity Protocol</span>
           </div>
        </div>
        <span className="text-[9px] uppercase tracking-[0.3em] text-neutral-700 font-mono">
          Registry Revision: 4.2.0-Alpha
        </span>
      </footer>
    </div>
  );
}
