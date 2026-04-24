import AppShell from '@/components/AppShell';
import UniversalCommandPalette from '@/src/components/Command/UniversalCommandPalette';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';
import { WorkspaceSwitcher } from '@/components/tenant/WorkspaceSwitcher';
import { auth } from '@/auth';
import { cookies } from 'next/headers';

import { requireLiveIdentity } from '@/src/lib/guards';

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Triple-Wire Security: Verify identity is still valid in the DB before rendering
  await requireLiveIdentity();

  const session = await auth();
  
  // Detect Active Module Context
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


