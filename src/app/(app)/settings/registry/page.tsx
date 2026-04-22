import { getWealthAccounts, getExpenseCategories, getIncomeSources, getFinancialLedgers } from '@/src/actions/registry.actions'
import { getActiveWorkspaceId } from '@/src/actions/workspace.actions'
import RegistryCockpitClient from './RegistryCockpitClient'

export default async function RegistryCockpitPage() {
  const [accounts, categories, sources, ledgers] = await Promise.all([
    getWealthAccounts(),
    getExpenseCategories(),
    getIncomeSources(),
    getFinancialLedgers()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-1">
          System Configuration
        </h1>
        <h2 className="text-4xl font-weight-display text-white leading-none tracking-tighter">
          Financial Taxonomy
        </h2>
      </header>

      <RegistryCockpitClient 
        key={await getActiveWorkspaceId() || 'registry-root'}
        accounts={accounts as any} 
        categories={categories as any} 
        sources={sources as any} 
        ledgers={ledgers as any} 
      />
    </div>
  )
}
