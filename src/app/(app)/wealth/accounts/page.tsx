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
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500/60 mb-1">
          Analytical Intelligence
        </h1>
        <h2 className="text-display font-weight-display text-white leading-none">
          Accounts Matrix
        </h2>
      </header>

      <div className="max-w-6xl">
        <HoldingsMatrix />
      </div>
    </div>
  );
}
