import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import HomeVisuals from './HomeVisuals'
import OperationalGrid from './OperationalGrid'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui-finova'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  return (
    <div className="pt-10 pb-12 max-w-7xl mx-auto animate-in fade-in duration-700">
      
      {/* ── HEADER STRATUM ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 px-1">
        <div className="space-y-1">
          <h1 className="text-[32px] font-display text-foreground leading-none tracking-[-0.025em]">
            Home
          </h1>
          <p className="text-[15px] font-[400] text-muted-foreground/60 tracking-tight">
            Portfolio-level macro analysis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/expenses">
            <Button variant="secondary" size="sm" className="h-8 rounded-full text-[13px] border-white/5 bg-white/5 hover:bg-white/10 px-4">
              View Activity
            </Button>
          </Link>
          <Link href="/treasury">
            <Button size="sm" className="bg-[#5266EB] hover:bg-[#5266EB]/90 h-8 px-4 rounded-full text-[13px] border-none">
              <Plus className="w-[14px] h-[14px] mr-2 shrink-0" /> Move Money
            </Button>
          </Link>
        </div>
      </div>

      {/* ── CORE VISUALS ──────────────────────────────────────────────────── */}
      <HomeVisuals />
      <OperationalGrid />

    </div>
  )
}
