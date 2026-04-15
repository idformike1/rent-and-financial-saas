import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { getSidebarPropertiesService } from '@/src/services/queries/assets.services'
import Link from 'next/link'
import { ReactNode } from 'react'

export default async function AssetsDeepRoutingLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const properties = await getSidebarPropertiesService({
    operatorId: session.userId,
    organizationId: session.organizationId
  });

  return (
    <div className="flex h-[calc(100vh-56px)] -mt-8 -mx-8 bg-background">
      
      {/* ── HYBRID DEEP ROUTING SIDEBAR ───────────────────────────────────── */}
      <aside className="w-[260px] border-r border-[#1F2937] bg-card/10 flex flex-col pt-8 shrink-0">
        <div className="px-6 mb-8 flex flex-col gap-6">
          <Link href="/assets" className="text-[13px] font-bold text-[#E5E7EB] hover:text-[#5D71F9] transition-colors uppercase tracking-[0.1em]">
            Portfolio Command
          </Link>
          
          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest opacity-60">
              Active Domains
            </h3>
            <Link 
              href="/properties?modal=add" 
              className="text-[11px] font-mono font-bold text-[#F9FAFB] opacity-80 hover:opacity-100 hover:text-[#5D71F9] transition-colors"
            >
              [ + NEW ASSET ]
            </Link>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto space-y-0.5">
          {properties.map((p) => (
            <Link 
              key={p.id} 
              href={`/assets/${p.id}`}
              className="block px-6 py-2.5 text-[12px] font-[380] text-[#E5E7EB] tracking-tight opacity-70 hover:opacity-100 hover:bg-white/[0.03] transition-colors"
            >
              {p.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── SOVEREIGN VIEWPORT CANVAS ─────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-8 pb-32 max-w-[1200px]">
          {children}
        </div>
      </main>

    </div>
  );
}
