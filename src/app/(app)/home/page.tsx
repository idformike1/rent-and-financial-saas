import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import HomeVisuals from './HomeVisuals'
import OperationalGrid from './OperationalGrid'
import CashFlowGrid from './CashFlowGrid'
import MasterTable from './MasterTable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui-finova'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* ── HEADER STRATUM ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 px-1">
        <div className="space-y-1">
          <h1 className="text-[28px] leading-[36px] font-[400] text-white tracking-tight font-sans">
            Home
          </h1>
          <p className="text-[15px] font-[400] text-white/40 tracking-tight font-sans">
            Portfolio-level macro analysis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/treasury/payables">
            <Button type="button" variant="secondary" size="sm" disabled={false} className="h-8 rounded-[var(--radius)] text-[15px] font-[400] border-white/5 bg-white/5 hover:bg-white/10 px-6">
              View activity
            </Button>
          </Link>
          <Link href="/treasury">
            <Button type="button" size="sm" disabled={false} className="bg-sidebar-primary hover:bg-sidebar-primary/90 h-8 px-6 rounded-[var(--radius)] text-[15px] font-[400] border-none">
              <Plus className="w-[14px] h-[14px] mr-2 shrink-0" /> Move money
            </Button>
          </Link>
        </div>
      </div>

      {/* ── CORE VISUALS ──────────────────────────────────────────────────── */}
      <HomeVisuals />
      <OperationalGrid />
      <CashFlowGrid />
      <MasterTable />

    </div>
  )
}
