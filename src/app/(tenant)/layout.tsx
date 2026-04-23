import AppShell from '@/components/AppShell';
import UniversalCommandPalette from '@/src/components/Command/UniversalCommandPalette';
import { getUserOrganizations, getActiveWorkspaceId } from '@/src/actions/workspace.actions';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizations = await getUserOrganizations();
  const activeId = await getActiveWorkspaceId();

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
