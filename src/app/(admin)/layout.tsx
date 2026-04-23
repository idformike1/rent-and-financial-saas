import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function SovereignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Root Admin Protection: Only isSystemAdmin can enter the Command Center
  if (!(session?.user as any)?.isSystemAdmin) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500/30 flex flex-col">
      {/* Lightweight Horizontal Navigation */}
      <header className="w-full border-b border-white/5 bg-black/20 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              S
            </div>
            <span className="text-sm font-medium tracking-tight uppercase text-neutral-400">Sovereign</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-xs font-medium tracking-wide text-neutral-400 hover:text-white transition-colors">
              Cockpit
            </Link>
            <Link href="/admin/tenants" className="text-xs font-medium tracking-wide text-neutral-400 hover:text-white transition-colors">
              Tenants
            </Link>
            <Link href="/admin/provisioning" className="text-xs font-medium tracking-wide text-neutral-400 hover:text-white transition-colors">
              Provisioning
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Secure</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 relative w-full">
        {/* Subtle background glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[0%] right-[0%] w-[50%] h-[50%] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-[0%] left-[0%] w-[40%] h-[40%] bg-blue-500/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-8 py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
