# SOVEREIGN OS: SYSTEM MANIFEST

## Unit Provisioning & Generation Engines
**Audit Conclusion**: All unit provisioning and generation workflows are fully intact and have been successfully migrated to the consolidated service layer.

- **Primary Provisioning Entry Point**: `src/components/modules/assets/PropertySovereignClient.tsx` (Trigger: "Provision Unit")
- **Unit Configuration Logic**: `src/components/modules/assets/UnitConfigForm.tsx` (Schema validation and commitment)
- **Lease/Occupant Flow**: `src/components/modules/assets/LeaseAssignmentForm.tsx`
- **Tenant Onboarding Wizard**: `src/app/(tenant)/tenant-register/page.tsx`
- **Backend Mutation Gatekeeper**: `actions/asset.actions.ts` -> `createUnit()`
- **Core Data Engine**: `src/services/asset.service.ts` -> `createUnit()` (Atomic database materialization)

---

## Active Routes (App Shell)
### Authentication & Onboarding
- `src/app/(auth)/login/page.tsx`
- `src/app/auth/setup-password/page.tsx`
- `src/app/onboarding/page.tsx`

### Core Tenant Operations
- `src/app/(tenant)/home/page.tsx` (Dashboard)
- `src/app/(tenant)/assets/page.tsx` (Portfolio Overview)
- `src/app/(tenant)/assets/[propertyId]/page.tsx` (Asset Detail/HUD)
- `src/app/(tenant)/tenants/page.tsx` (Occupant Registry)
- `src/app/(tenant)/tenants/[tenantId]/page.tsx` (Forensic Dossier)
- `src/app/(tenant)/tenant-register/page.tsx` (Onboarding Wizard)
- `src/app/(tenant)/intake/page.tsx`

### Treasury & Wealth
- `src/app/(tenant)/treasury/page.tsx`
- `src/app/(tenant)/treasury/command-center/page.tsx`
- `src/app/(tenant)/treasury/feed/page.tsx`
- `src/app/(tenant)/treasury/[accountId]/page.tsx`
- `src/app/(tenant)/wealth/page.tsx`
- `src/app/(tenant)/wealth/accounts/page.tsx`
- `src/app/(tenant)/wealth/cashflow/page.tsx`

### Analytics & Governance
- `src/app/(tenant)/reports/insights/page.tsx` (Advanced Telemetry)
- `src/app/(tenant)/governance/ledger/page.tsx`
- `src/app/(tenant)/settings/categories/page.tsx` (Taxonomy Control)
- `src/app/(tenant)/settings/team/page.tsx` (RBAC)
- `src/app/(tenant)/settings/audit/page.tsx`

---

## Active Modules (UI & Workflows)
### Asset Intelligence
- `src/components/modules/assets/AssetDashboardHud.tsx`
- `src/components/modules/assets/AssetGrid.tsx`
- `src/components/modules/assets/PropertySovereignClient.tsx`
- `src/components/modules/assets/UnitGrid.tsx`
- `src/components/modules/assets/UnitSideSheet.tsx`
- `src/components/modules/assets/UnitConfigForm.tsx`
- `src/components/modules/assets/LeaseAssignmentForm.tsx`

### Financial Intelligence (Treasury)
- `src/components/modules/treasury/TreasuryGrid.tsx`
- `src/components/modules/treasury/DashboardCharts.tsx`
- `src/components/modules/treasury/TransactionFeedClient.tsx`
- `src/components/modules/treasury/ExpenseFormClient.tsx`
- `src/components/modules/treasury/AccountTelemetryHud.tsx`

### Tenant Intelligence
- `src/components/modules/tenants/TenantGrid.tsx`
- `src/components/modules/tenants/TenantProfileView.tsx`
- `src/components/modules/tenants/LedgerTerminal.tsx`
- `src/components/modules/tenants/TenantChronologicalLedger.tsx`

### Analytical Insights
- `src/components/modules/insights/InsightsGrid.tsx`
- `src/components/modules/insights/KpiGrid.tsx`
- `src/components/modules/insights/Visualizer.tsx`
- `src/components/modules/insights/semanticGenerator.tsx`

---

## Active Backend Services & Actions
### Server Actions (Gatekeepers)
- `actions/asset.actions.ts` (Inventory Mutations)
- `actions/tenant.actions.ts` (Occupant Mutations)
- `actions/treasury.actions.ts` (Fiscal Mutations)
- `actions/analytics.actions.ts` (Telemetry Retrieval)
- `actions/system.actions.ts` (Taxonomy & Admin)
- `actions/team.actions.ts` (Identity Control)

### Domain Services (Data Engines)
- `src/services/asset.service.ts` (Property & Unit Management)
- `src/services/tenant.service.ts` (Tenant Lifecycle & Debt)
- `src/services/treasury.service.ts` (Ledger & P&L Aggregation)
- `src/services/system.service.ts` (Taxonomy Governance)
- `src/services/team.service.ts` (Organization & Identity)
- `src/services/finance/core.ts` (Double-Entry Ledger Logic)

---
**Lead Systems Auditor**: Antigravity  
**Audit Status**: VERIFIED // ALL CORE ENGINES ACCOUNTED FOR  
**Timestamp**: 2026-04-29T17:15:00Z
