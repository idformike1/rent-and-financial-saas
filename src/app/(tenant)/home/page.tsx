import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  // 1. Detect Active Context
  const cookieStore = await cookies();
  const canAccessRent = (session.user as any).canAccessRent ?? true;
  const canAccessWealth = (session.user as any).canAccessWealth ?? true;

  const activeModule = (cookieStore.get('active_module_context')?.value as 'RENT' | 'WEALTH') || 
                       (canAccessRent ? 'RENT' : 'WEALTH');

  // 2. Enforce Entitlements (Redirect to permitted module if current is forbidden)
  if (activeModule === 'RENT' && !canAccessRent && canAccessWealth) {
    // Force switch to Wealth if Rent is forbidden
    return redirect('/home'); // The cookie logic in next run will pick Wealth
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-black">
          {activeModule === 'RENT' ? 'Operational Command' : 'Analytical Cockpit'}
        </h3>
        <h1 className="text-4xl font-light tracking-tight text-white">
          Welcome back, <span className="font-medium text-amber-500/80">{session.user.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-sm text-neutral-500 max-w-lg">
          {activeModule === 'RENT' 
            ? "Orchestrating high-density property assets and tenant lifecycle management."
            : "Synthesizing global wealth portfolio insights and fiscal performance matrix."}
        </p>
      </div>

      {/* DASHBOARD GRID PLACEHOLDER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-white/5 mx-auto mb-3 animate-pulse" />
              <div className="h-2 w-24 bg-white/5 rounded mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

