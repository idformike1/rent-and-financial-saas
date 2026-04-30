import AppShell from '@/src/components/finova/AppShell';
import UniversalCommandPalette from '@/src/components/Command/UniversalCommandPalette';
import { ImpersonationBanner } from '@/src/components/finova/admin/ImpersonationBanner';
import { WorkspaceSwitcher } from '@/src/components/finova/tenant/WorkspaceSwitcher';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/prisma';

import { requireLiveIdentity } from '@/src/lib/guards';

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Triple-Wire Security: Verify identity is still valid in the DB before rendering
  await requireLiveIdentity();

  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) return null;

  // 1. Vault Lockdown Firewall
  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { isSuspended: true }
  });

  if (org?.isSuspended) {
    return (
      <div className="h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 animate-pulse">
           <div className="w-12 h-12 rounded-full bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]" />
        </div>
        <h1 className="text-4xl font-light tracking-tight text-white mb-4 uppercase italic">Access Suspended</h1>
        <p className="text-sm text-neutral-500 max-w-md leading-relaxed uppercase tracking-widest font-mono">
          VAULT_STATE: LOCKED. This organization has been quarantined by root administrative protocol. Please contact your system administrator to restore access.
        </p>
      </div>
    );
  }
  
  // 2. Detect Active Module Context
  const cookieStore = await cookies();
  const canAccessRent = (session?.user as any)?.canAccessRent ?? true;
  const activeModule = (cookieStore.get('active_module_context')?.value as 'RENT' | 'WEALTH') || 
                       (canAccessRent ? 'RENT' : 'WEALTH');

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <ImpersonationBanner />
      <div className="flex flex-1 w-full overflow-hidden">
        <UniversalCommandPalette />
        <AppShell 
          workspaceSwitcher={<WorkspaceSwitcher />} 
          activeWorkspaceId={session?.user?.organizationId || undefined}
          activeModule={activeModule}
        >
          {children}
        </AppShell>
      </div>
    </div>
  );
}



