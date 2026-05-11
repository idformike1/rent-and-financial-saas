import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function AssetsDeepRoutingLayout({ 
  children,
  modal 
}: { 
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  return (
    <div className="h-[calc(100vh-56px)] overflow-hidden flex flex-col -mt-8 -mx-8 bg-background">
      {/* ── SOVEREIGN VIEWPORT CANVAS ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-0 w-full">
        <div className="p-8 flex-1 flex flex-col min-h-0 max-w-[1440px] mx-auto w-full">
          {children}
          {modal}
        </div>
      </main>
    </div>
  );
}
