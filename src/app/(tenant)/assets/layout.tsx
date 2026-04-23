import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function AssetsDeepRoutingLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-[calc(100vh-56px)] -mt-8 -mx-8 bg-background">
      {/* ── SOVEREIGN VIEWPORT CANVAS ─────────────────────────────────────── */}
      <main className="w-full">
        <div className="p-8 pb-32 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
