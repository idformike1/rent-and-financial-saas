import { getSystemSettings } from '@/actions/management.actions'
import SettingsForm from '@/src/components/Admin/SettingsForm'
import { ChevronRight, Settings } from 'lucide-react'

export const metadata = {
  title: 'Configuration Registry | Sovereign OS',
  description: 'Manage organizational fiscal parameters and billing protocols.',
}

export default async function SettingsPage() {
  const settings = await getSystemSettings();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center text-clinical-muted text-xs gap-2 mb-2">
            <span>Administration</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Registry</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-950 border border-white/[0.08] rounded-xl shadow-inner">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">System Configuration</h1>
              <p className="text-clinical-muted text-sm mt-0.5">Control organization-wide fiscal parameters and operational thresholds.</p>
            </div>
          </div>
        </div>
      </header>

      {/* FORM STAGE */}
      <main>
        <SettingsForm initialData={settings} />
      </main>

      {/* FOOTER ADVISORY */}
      <footer className="pt-10 border-t border-white/[0.05]">
        <div className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
          <p className="text-xs text-clinical-muted leading-relaxed">
            <span className="text-foreground font-bold">Architectural Note:</span> These parameters govern the logic of the Receivables Engine and Consumption-Based Utility Engine. Any mutations here will be recorded in the forensic audit log and applied to all future billing cycles.
          </p>
        </div>
      </footer>
    </div>
  )
}
