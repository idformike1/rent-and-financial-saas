# GLOBAL PURITY AND GARBAGE REPORT (EXECUTED)

Generated at: 2026-04-30
Status: PURGED (27 files removed, 2 restored)

## 1. The Boneyard (Dead / Orphaned Files)
> [!IMPORTANT]
> The following files have been deleted. Empty parent directories were also removed.
> Note: `src/lib/validations/user.schema.ts` and `src/components/modules/insights/index.tsx` were RESTORED after verification.
> Files identified in `components/`, `hooks/`, or `lib/` that have zero active imports across the codebase.

- `src/components/Cockpit/CategoryBreakdown.tsx`
- `src/components/Cockpit/ExpenseLogger.tsx`
- `src/components/Cockpit/TransferEngine.tsx`
- `src/components/Cockpit/WealthOverview.tsx`
- `src/components/CommandCenter/index.tsx`
- `src/components/Intelligence/BalanceSheetWidget.tsx`
- `src/components/Intelligence/RunwayRadarWidget.tsx`
- `src/components/finova/ExportControls.tsx`
- `src/components/finova/admin/MigrationTrigger.tsx`
- `src/components/finova/admin/ProvisioningForm.tsx`
- `src/components/finova/charts/PropertyWaterfall.tsx`
- `src/components/finova/reports/DrillDownDrawer.tsx`
- `src/components/finova/reports/IncomeStatementChart.tsx`
- `src/components/finova/team/AccessControlTable.tsx`
- `src/components/finova/tenants/OccupantDirectory.tsx`
- `src/components/finova/ui/TenantForensicLedger.tsx`
- `src/components/finova/ui/sheet.tsx`
- `src/components/finova/ui/skeleton.tsx`
- `src/components/modules/assets/AssetDashboardHud.tsx`
- `src/components/modules/insights/index.tsx`
- `src/components/modules/tenants/LedgerTerminal.tsx`
- `src/components/modules/tenants/TenantChronologicalLedger.tsx`
- `src/components/modules/tenants/TenantProfileClient.tsx`
- `src/components/modules/treasury/DashboardCharts.tsx`
- `src/components/modules/treasury/ExpensesChartClient.tsx`
- `src/components/patterns/KPISection.tsx`
- `src/components/system/SectionHeader.tsx`
- `src/components/visualization/ProgressBar.tsx`
- `src/lib/validations/user.schema.ts`

## 2. Architectural Bleeds (Cross-Domain Imports)
> Instances where a business module directly imports from another business module (violating domain isolation).

_No architectural bleeds detected._

## 3. Purity Violations (Dumb UI with Logic)
> System UI components (Axiom V2) found to be importing data actions or services.

_No purity violations detected._
