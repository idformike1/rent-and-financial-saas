'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  Building2, 
  Users, 
  Database, 
  BarChart3, 
  Settings, 
  LogOut,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

function NavLink({ 
  href, 
  label, 
  icon: Icon, 
  variant = 'primary' 
}: { 
  href: string, 
  label: string, 
  icon: any, 
  variant?: 'primary' | 'legacy' 
}) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 h-9 rounded-[6px] transition-all duration-200 group",
        isActive 
          ? "bg-zinc-800/40 text-zinc-100" 
          : variant === 'legacy' ? "text-zinc-600 hover:text-zinc-400" : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/20"
      )}
    >
      <Icon className={cn(
        "w-3.5 h-3.5 transition-colors",
        isActive ? "text-zinc-100" : variant === 'legacy' ? "text-zinc-600" : "text-zinc-500 group-hover:text-zinc-100"
      )} />
      <span className={cn(
        "text-[11px] uppercase tracking-[0.1em] font-medium leading-none",
        isActive ? "text-zinc-100" : ""
      )}>
        {label}
      </span>
    </Link>
  );
}

export default function SovereignShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isAuthPage) {
    return <main className="flex-1 overflow-y-auto">{children}</main>;
  }

  const userName = session?.user?.name || 'Sovereign Auditor';

  return (
    <>
      {/* ── AXIOM SIDEBAR (Task 1.2) ────────────────────────────────────────── */}
      <aside className="w-64 border-r border-[#1E1E20] bg-[#0A0A0A] flex flex-col shrink-0 h-screen sticky top-0">
        
        {/* BRANDING */}
        <div className="h-16 flex items-center px-8 border-b border-[#1E1E20]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-[6px] bg-zinc-100" />
            <span className="font-mono text-[10px] font-bold tracking-[0.4em] text-zinc-100 uppercase">
              AXIOM 2026
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col pt-8 px-4 gap-8">
          {/* CATEGORY: COMMAND */}
          <section className="space-y-3">
            <h3 className="px-4 text-[9px] uppercase tracking-[0.2em] text-zinc-700 font-bold">
              Command
            </h3>
            <div className="space-y-1">
              <NavLink href="/assets" label="Properties" icon={Building2} />
              <NavLink href="/tenants" label="Occupants" icon={Users} />
              <NavLink href="/treasury" label="Ledger" icon={Database} />
              <NavLink href="/reports" label="Analytics" icon={BarChart3} />
              <NavLink href="/settings" label="Governance" icon={Settings} />
            </div>
          </section>

          {/* CATEGORY: LEGACY */}
          <section className="space-y-3">
            <h3 className="px-4 text-[9px] uppercase tracking-[0.2em] text-zinc-700 font-bold">
              Legacy
            </h3>
            <div className="space-y-1">
              <NavLink href="/insights" label="Legacy Insights" icon={Zap} variant="legacy" />
              <NavLink href="/transactions" label="Old Transactions" icon={Clock} variant="legacy" />
            </div>
          </section>
        </div>

        {/* PROFILE SECTION */}
        <div className="p-4 border-t border-[#1E1E20]">
          <div className="flex items-center justify-between bg-zinc-900/20 p-3 rounded-[6px] border border-[#1E1E20]/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[6px] bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <ShieldCheck className="w-4 h-4 text-zinc-100" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-100 truncate w-24">
                  {userName}
                </span>
                <span className="text-[9px] text-zinc-700 uppercase tracking-widest font-bold">
                  Sovereign
                </span>
              </div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 text-zinc-700 hover:text-zinc-100 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* CORE VIEWPORT */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#0A0A0A]">
        {children}
      </main>
    </>
  );
}
