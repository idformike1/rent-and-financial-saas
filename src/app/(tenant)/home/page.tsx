import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDashboardKPIs } from "@/src/services/queries/dashboard";
import DashboardKPI from "@/src/components/finova/ui/DashboardKPI";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = session.user as any;
  const organizationId = user.organizationId;
  
  if (!organizationId) {
    // Fail-safe for users without organization context
    return (
      <div className="flex items-center justify-center h-96 border border-dashed border-white/10 rounded-2xl">
        <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">No Organization Context Detected</p>
      </div>
    );
  }

  // 1. Detect Active Context
  const cookieStore = await cookies();
  const canAccessRent = user.canAccessRent ?? true;
  const canAccessWealth = user.canAccessWealth ?? true;

  const activeModule = (cookieStore.get('active_module_context')?.value as 'RENT' | 'WEALTH') || 
                       (canAccessRent ? 'RENT' : 'WEALTH');

  // 2. Enforce Entitlements
  if (activeModule === 'RENT' && !canAccessRent && canAccessWealth) {
    return redirect('/home');
  }

  // 3. Hydrate Data (Phase 1: Rent Workspace)
  let rentData = { occupancy: 0, noi: 0, arrears: 0 };
  if (activeModule === 'RENT') {
    rentData = await getDashboardKPIs(organizationId);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-black">
          {activeModule === 'RENT' ? 'Operational Command' : 'Analytical Cockpit'}
        </h3>
        <h1 className="text-4xl font-light tracking-tight text-white">
          Welcome back, <span className="font-medium text-amber-500/80">{session.user.name?.split(' ')[0] || 'User'}</span>
        </h1>
        <p className="text-sm text-neutral-500 max-w-lg">
          {activeModule === 'RENT' 
            ? "Orchestrating high-density property assets and tenant lifecycle management."
            : "Synthesizing global wealth portfolio insights and fiscal performance matrix."}
        </p>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeModule === 'RENT' ? (
          <>
            <DashboardKPI 
              title="Portfolio Occupancy" 
              value={rentData.occupancy} 
              type="percentage" 
              trend={rentData.occupancy > 95 ? "High Yield" : undefined}
            />
            <DashboardKPI 
              title="Net Operating Income" 
              value={rentData.noi} 
              type="currency" 
            />
            <DashboardKPI 
              title="Portfolio Arrears" 
              value={rentData.arrears} 
              type="currency" 
              alert={rentData.arrears > 0}
              trend={rentData.arrears > 1000 ? "Risk Detected" : undefined}
            />
          </>
        ) : (
          /* Wealth placeholders remain for now */
          [1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-white/5 mx-auto mb-3 animate-pulse" />
                <div className="h-2 w-24 bg-white/5 rounded mx-auto" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


