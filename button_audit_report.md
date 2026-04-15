# 🔴 AXIOM BUTTON AUDIT REPORT

> **Generated:** 2026-04-15T02:20:44.765Z  
> **Scanner:** `scripts/audit-buttons.mjs`  
> **Mode:** Read-Only Static Analysis — No mutations  
> **Files Scanned:** 84  
> **Total Violations:** **180**  

---

## Violation Legend

| Code | Violation Description |
|------|-----------------------|
| V1   | Native `<button>` used instead of Axiom `<Button>` component |
| V2   | `<Button>` missing explicit `type` prop (`"button"` or `"submit"`) |
| V3   | `<Button>` missing `disabled` / `pending` / `isLoading` state mapping |
| V4   | Inline `<svg>` literal — zero-icon directive violation |
| V4b  | Icon library component rendered in button context |

---

## Findings

| File Path | Line | Violation Type | Component |
|-----------|-----:|----------------|----------:|
| `app/(app)/dashboard/DashboardClientGrid.tsx` | 14 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `UpArrow` |
| `app/(app)/dashboard/DashboardClientGrid.tsx` | 20 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `DownArrow` |
| `app/(app)/dashboard/DashboardClientGrid.tsx` | 66 | V4b — Icon library component in use (zero-icon directive) | `CARDS` |
| `app/(app)/dashboard/page.tsx` | 52 | V1 — Native `<button>` instead of Axiom `<Button>` | `FinovaDashboard` |
| `app/(app)/dashboard/page.tsx` | 52 | V2 — `<Button>` missing explicit `type` prop | `FinovaDashboard` |
| `app/(app)/dashboard/page.tsx` | 52 | V3 — `<Button>` missing disabled/pending/isLoading state | `FinovaDashboard` |
| `app/(app)/dashboard/page.tsx` | 55 | V1 — Native `<button>` instead of Axiom `<Button>` | `FinovaDashboard` |
| `app/(app)/dashboard/page.tsx` | 55 | V2 — `<Button>` missing explicit `type` prop | `FinovaDashboard` |
| `app/(app)/dashboard/page.tsx` | 55 | V3 — `<Button>` missing disabled/pending/isLoading state | `FinovaDashboard` |
| `app/(app)/dashboard/page.tsx` | 58 | V1 — Native `<button>` instead of Axiom `<Button>` | `FinovaDashboard` |
| `app/(app)/dashboard/page.tsx` | 58 | V2 — `<Button>` missing explicit `type` prop | `FinovaDashboard` |
| `app/(app)/dashboard/page.tsx` | 58 | V3 — `<Button>` missing disabled/pending/isLoading state | `FinovaDashboard` |
| `app/(app)/dashboard/page.tsx` | 61 | V1 — Native `<button>` instead of Axiom `<Button>` | `FinovaDashboard` |
| `app/(app)/dashboard/page.tsx` | 61 | V2 — `<Button>` missing explicit `type` prop | `FinovaDashboard` |
| `app/(app)/dashboard/page.tsx` | 61 | V3 — `<Button>` missing disabled/pending/isLoading state | `FinovaDashboard` |
| `app/(app)/expenses/page.tsx` | 74 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/expenses/page.tsx` | 74 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/expenses/page.tsx` | 74 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/home/CashFlowGrid.tsx` | 37 | V1 — Native `<button>` instead of Axiom `<Button>` | `CashFlowGrid` |
| `app/(app)/home/CashFlowGrid.tsx` | 39 | V1 — Native `<button>` instead of Axiom `<Button>` | `CashFlowGrid` |
| `app/(app)/home/CashFlowGrid.tsx` | 73 | V4b — Icon library component in use (zero-icon directive) | `CashFlowGrid` |
| `app/(app)/home/CashFlowGrid.tsx` | 118 | V4b — Icon library component in use (zero-icon directive) | `(unknown)` |
| `app/(app)/home/HomeVisuals.tsx` | 25 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `Zap` |
| `app/(app)/home/HomeVisuals.tsx` | 60 | V4b — Icon library component in use (zero-icon directive) | `HomeVisuals` |
| `app/(app)/home/HomeVisuals.tsx` | 101 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/home/HomeVisuals.tsx` | 104 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/home/HomeVisuals.tsx` | 130 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/home/MasterTable.tsx` | 18 | V1 — Native `<button>` instead of Axiom `<Button>` | `MasterTable` |
| `app/(app)/home/MasterTable.tsx` | 25 | V1 — Native `<button>` instead of Axiom `<Button>` | `MasterTable` |
| `app/(app)/home/MasterTable.tsx` | 28 | V1 — Native `<button>` instead of Axiom `<Button>` | `MasterTable` |
| `app/(app)/home/MasterTable.tsx` | 31 | V1 — Native `<button>` instead of Axiom `<Button>` | `MasterTable` |
| `app/(app)/home/OperationalGrid.tsx` | 12 | V1 — Native `<button>` instead of Axiom `<Button>` | `OperationalGrid` |
| `app/(app)/home/OperationalGrid.tsx` | 14 | V1 — Native `<button>` instead of Axiom `<Button>` | `OperationalGrid` |
| `app/(app)/home/OperationalGrid.tsx` | 37 | V1 — Native `<button>` instead of Axiom `<Button>` | `OperationalGrid` |
| `app/(app)/home/OperationalGrid.tsx` | 75 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/home/OperationalGrid.tsx` | 86 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/home/OperationalGrid.tsx` | 87 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/home/OperationalGrid.tsx` | 108 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/home/OperationalGrid.tsx` | 119 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/home/OperationalGrid.tsx` | 120 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/home/OperationalGrid.tsx` | 143 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/home/page.tsx` | 31 | V1 — Native `<button>` instead of Axiom `<Button>` | `HomePage` |
| `app/(app)/home/page.tsx` | 31 | V2 — `<Button>` missing explicit `type` prop | `HomePage` |
| `app/(app)/home/page.tsx` | 31 | V3 — `<Button>` missing disabled/pending/isLoading state | `HomePage` |
| `app/(app)/home/page.tsx` | 36 | V1 — Native `<button>` instead of Axiom `<Button>` | `HomePage` |
| `app/(app)/home/page.tsx` | 36 | V2 — `<Button>` missing explicit `type` prop | `HomePage` |
| `app/(app)/home/page.tsx` | 36 | V3 — `<Button>` missing disabled/pending/isLoading state | `HomePage` |
| `app/(app)/insights/InsightsClient.tsx` | 305 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/insights/InsightsClient.tsx` | 306 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `(unknown)` |
| `app/(app)/insights/InsightsClient.tsx` | 312 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/insights/InsightsClient.tsx` | 313 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `(unknown)` |
| `app/(app)/insights/InsightsClient.tsx` | 419 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/insights/InsightsClient.tsx` | 445 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/insights/InsightsClient.tsx` | 446 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `(unknown)` |
| `app/(app)/insights/InsightsClient.tsx` | 448 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/insights/InsightsClient.tsx` | 449 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `(unknown)` |
| `app/(app)/insights/InsightsClient.tsx` | 466 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `(unknown)` |
| `app/(app)/insights/InsightsClient.tsx` | 472 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `(unknown)` |
| `app/(app)/insights/InsightsClient.tsx` | 478 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `(unknown)` |
| `app/(app)/onboarding/page.tsx` | 150 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/onboarding/page.tsx` | 150 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/onboarding/page.tsx` | 150 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/onboarding/page.tsx` | 264 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/onboarding/page.tsx` | 268 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/onboarding/page.tsx` | 268 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/onboarding/page.tsx` | 270 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/properties/[propertyId]/page.tsx` | 58 | V4b — Icon library component in use (zero-icon directive) | `PropertyUnitsPage` |
| `app/(app)/properties/[propertyId]/PropertyPulseTerminal.tsx` | 242 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/properties/[propertyId]/PropertyPulseTerminal.tsx` | 242 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/properties/[propertyId]/PropertyPulseTerminal.tsx` | 242 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/properties/[propertyId]/PropertyPulseTerminal.tsx` | 355 | V4b — Icon library component in use (zero-icon directive) | `(unknown)` |
| `app/(app)/properties/[propertyId]/PropertyPulseTerminal.tsx` | 374 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `(unknown)` |
| `app/(app)/properties/[propertyId]/PropertyPulseTerminal.tsx` | 528 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/properties/[propertyId]/PropertyPulseTerminal.tsx` | 528 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/properties/[propertyId]/PropertyPulseTerminal.tsx` | 528 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/properties/[propertyId]/PropertyPulseTerminal.tsx` | 568 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/properties/[propertyId]/PropertyPulseTerminal.tsx` | 568 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/properties/[propertyId]/PropertyPulseTerminal.tsx` | 609 | V4b — Icon library component in use (zero-icon directive) | `(unknown)` |
| `app/(app)/properties/[propertyId]/UnitManagementClient.tsx` | 172 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/properties/[propertyId]/UnitManagementClient.tsx` | 194 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/properties/[propertyId]/UnitManagementClient.tsx` | 211 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/properties/PropertyDashboardClient.tsx` | 110 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/reports/financial-connections/page.tsx` | 101 | V4b — Icon library component in use (zero-icon directive) | `FinanceTranslationHub` |
| `app/(app)/reports/financial-connections/page.tsx` | 109 | V4b — Icon library component in use (zero-icon directive) | `FinanceTranslationHub` |
| `app/(app)/reports/ledger-waterfall/page.tsx` | 127 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/reports/ledger-waterfall/page.tsx` | 127 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/reports/ledger-waterfall/page.tsx` | 127 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/reports/ledger-waterfall/page.tsx` | 145 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `(unknown)` |
| `app/(app)/reports/ledger-waterfall/page.tsx` | 187 | V4b — Icon library component in use (zero-icon directive) | `(unknown)` |
| `app/(app)/reports/page.tsx` | 28 | V4b — Icon library component in use (zero-icon directive) | `ReportsPage` |
| `app/(app)/reports/page.tsx` | 50 | V1 — Native `<button>` instead of Axiom `<Button>` | `ReportsPage` |
| `app/(app)/reports/page.tsx` | 50 | V2 — `<Button>` missing explicit `type` prop | `ReportsPage` |
| `app/(app)/reports/page.tsx` | 50 | V3 — `<Button>` missing disabled/pending/isLoading state | `ReportsPage` |
| `app/(app)/reports/ReportHubClient.tsx` | 199 | V1 — Native `<button>` instead of Axiom `<Button>` | `ReportViewer` |
| `app/(app)/reports/ReportHubClient.tsx` | 199 | V2 — `<Button>` missing explicit `type` prop | `ReportViewer` |
| `app/(app)/reports/ReportHubClient.tsx` | 203 | V1 — Native `<button>` instead of Axiom `<Button>` | `ReportViewer` |
| `app/(app)/reports/ReportHubClient.tsx` | 203 | V2 — `<Button>` missing explicit `type` prop | `ReportViewer` |
| `app/(app)/reports/ReportHubClient.tsx` | 203 | V3 — `<Button>` missing disabled/pending/isLoading state | `ReportViewer` |
| `app/(app)/reports/ReportHubClient.tsx` | 230 | V4b — Icon library component in use (zero-icon directive) | `ReportViewer` |
| `app/(app)/reports/ReportHubClient.tsx` | 324 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 192 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 220 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 220 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 237 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 259 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 259 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 312 | V1 — Native `<button>` instead of Axiom `<Button>` | `Icon` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 366 | V1 — Native `<button>` instead of Axiom `<Button>` | `RecursiveAccountNode` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 390 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 391 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 395 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/settings/categories/GovernanceRegistryClient.tsx` | 396 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/settings/ingestion/MassIngestionClient.tsx` | 95 | V4b — Icon library component in use (zero-icon directive) | `(unknown)` |
| `app/(app)/settings/ontology/page.tsx` | 185 | V4b — Icon library component in use (zero-icon directive) | `TreeNode` |
| `app/(app)/settings/page.tsx` | 60 | V1 — Native `<button>` instead of Axiom `<Button>` | `SettingsPage` |
| `app/(app)/settings/page.tsx` | 60 | V2 — `<Button>` missing explicit `type` prop | `SettingsPage` |
| `app/(app)/settings/page.tsx` | 84 | V4b — Icon library component in use (zero-icon directive) | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 213 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 213 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 216 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 216 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 216 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 219 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 219 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 219 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 287 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 342 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 368 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 379 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 402 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 422 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 425 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 446 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/[tenantId]/TenantProfileView.tsx` | 449 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/tenants/page.tsx` | 53 | V1 — Native `<button>` instead of Axiom `<Button>` | `TenantsPage` |
| `app/(app)/tenants/page.tsx` | 53 | V2 — `<Button>` missing explicit `type` prop | `TenantsPage` |
| `app/(app)/tenants/page.tsx` | 53 | V3 — `<Button>` missing disabled/pending/isLoading state | `TenantsPage` |
| `app/(app)/tenants/TenantRegistryClient.tsx` | 35 | V4b — Icon library component in use (zero-icon directive) | `TenantRegistryClient` |
| `app/(app)/tenants/TenantRegistryClient.tsx` | 45 | V1 — Native `<button>` instead of Axiom `<Button>` | `TenantRegistryClient` |
| `app/(app)/tenants/TenantRegistryClient.tsx` | 45 | V2 — `<Button>` missing explicit `type` prop | `TenantRegistryClient` |
| `app/(app)/tenants/TenantRegistryClient.tsx` | 45 | V3 — `<Button>` missing disabled/pending/isLoading state | `TenantRegistryClient` |
| `app/(app)/transactions/TransactionDetailSheet.tsx` | 77 | V4b — Icon library component in use (zero-icon directive) | `TransactionDetailSheet` |
| `app/(app)/transactions/TransactionDetailSheet.tsx` | 162 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/transactions/TransactionDetailSheet.tsx` | 190 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/transactions/TransactionDetailSheet.tsx` | 190 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/transactions/TransactionDetailSheet.tsx` | 190 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/transactions/TransactionFeedClient.tsx` | 489 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 74 | V1 — Native `<button>` instead of Axiom `<Button>` | `TransactionFilterBar` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 74 | V2 — `<Button>` missing explicit `type` prop | `TransactionFilterBar` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 74 | V3 — `<Button>` missing disabled/pending/isLoading state | `TransactionFilterBar` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 265 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 265 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 265 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 266 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 266 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 266 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 280 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 280 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 280 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 290 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 320 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 320 | V2 — `<Button>` missing explicit `type` prop | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 320 | V3 — `<Button>` missing disabled/pending/isLoading state | `(unknown)` |
| `app/(app)/transactions/TransactionFilterBar.tsx` | 334 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `app/(auth)/login/page.tsx` | 47 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `LoginPage` |
| `app/(auth)/login/page.tsx` | 116 | V4b — Icon library component in use (zero-icon directive) | `(unknown)` |
| `components/AppShell.tsx` | 17 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `Icons` |
| `components/AppShell.tsx` | 22 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `Icons` |
| `components/AppShell.tsx` | 27 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `Icons` |
| `components/AppShell.tsx` | 32 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `Icons` |
| `components/AppShell.tsx` | 110 | V4 — Inline `<svg>` literal (zero-icon directive violation) | `AppShell` |
| `components/insights/InsightsDatePicker.tsx` | 76 | V4b — Icon library component in use (zero-icon directive) | `InsightsDatePicker` |
| `components/PaymentDrawer.tsx` | 110 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `components/reports/DrillDownDrawer.tsx` | 46 | V1 — Native `<button>` instead of Axiom `<Button>` | `DrillDownDrawer` |
| `components/reports/DrillDownDrawer.tsx` | 85 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `components/team/AccessControlTable.tsx` | 138 | V4b — Icon library component in use (zero-icon directive) | `(unknown)` |
| `components/tenants/OccupantDirectory.tsx` | 92 | V1 — Native `<button>` instead of Axiom `<Button>` | `(unknown)` |
| `components/ui/calendar.tsx` | 150 | V4b — Icon library component in use (zero-icon directive) | `(unknown)` |
| `components/ui/calendar.tsx` | 156 | V4b — Icon library component in use (zero-icon directive) | `(unknown)` |
| `components/ui/calendar.tsx` | 161 | V4b — Icon library component in use (zero-icon directive) | `(unknown)` |

---

## Summary by Violation Type

| Violation | Count |
|-----------|------:|
| V4 | 18 |
| V4b | 23 |
| V1 | 86 |
| V2 | 27 |
| V3 | 26 |

---

> ### TOTAL DUMB BUTTONS DETECTED: 180
