import AppShell from '@/components/AppShell';
import UniversalCommandPalette from '@/src/components/Command/UniversalCommandPalette';
import { getUserOrganizations, getActiveWorkspaceId } from '@/src/actions/workspace.actions';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

import { requireLiveIdentity } from '@/src/lib/guards';

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Triple-Wire Security: Verify identity is still valid in the DB before rendering
  await requireLiveIdentity();

  const organizations = await getUserOrganizations();
  const activeId = await getActiveWorkspaceId();

  console.log("[FLOW MAP 7: TENANT_LAYOUT] Organizations Found:", organizations.length);
  console.log("[FLOW MAP 8: TENANT_LAYOUT] Active Workspace ID:", activeId);

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <ImpersonationBanner />
      <div className="flex flex-1 w-full overflow-hidden">
        <UniversalCommandPalette />
        <AppShell organizations={organizations} activeWorkspaceId={activeId || undefined}>
          {children}
        </AppShell>
      </div>
    </div>
  );
}
