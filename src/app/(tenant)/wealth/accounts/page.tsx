import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/src/actions/workspace.actions'
import HoldingsMatrix from '@/src/components/Cockpit/HoldingsMatrix'

export default async function AccountsMatrixPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const activeId = await getActiveWorkspaceId();
  // Authorization check (Sovereign Principle)
  if (!activeId) redirect('/home');

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-700">
      <h1 className="text-4xl font-light text-amber-500 tracking-tight">Wealth Accounts Matrix</h1>
      <p className="text-clinical-muted uppercase tracking-widest text-[11px]">Personal Wealth Module: Analytical Scaffolding Active.</p>
      <div className="h-[1px] w-full bg-amber-500/10" />
      <div className="text-neutral-500 text-sm">Wealth Engine Component pending materialization.</div>
    </div>
  );
}
