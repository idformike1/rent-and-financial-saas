# Architectural Blueprint: Sovereign Financial OS

## Core Architecture
- **Isolation Principle:** No data query is ever allowed to run without an `organizationId` filter. 
- **Modularization:** All features reside in `src/components/Domain` or `src/services/Domain`. 
- **Navigation:** Context-aware (Swaps sidebar and views based on active workspace).

## Workspace Domains

### 1. Operational Command (Property)
- **Goal:** Maximizing Asset ROI and minimizing vacancy/compliance risk.
- **Key Services:** `finance.services.ts`, `tenant.services.ts`.
- **Key UI:** `Dashboard`, `Ledger`, `TenancyRegistry`.

### 2. Analytical Cockpit (Wealth)
- **Goal:** Maximizing Personal Net Worth and Cash Flow health.
- **Key Services:** `analytics.services.ts` (extended), `account.services.ts` (new).
- **Key UI:** `WealthDashboard`, `HoldingsGrid`, `CashFlowCharts`.

## Implementation Rules
1. Never add a feature to the root folder; place it in a domain-specific folder.
2. Every page must fetch data using the `useWorkspaceData` hook.
3. Every UI component must pass a11y contrast checks (WCAG AA).

## Phase 7 Roadmap
- **Cycle 1:** Workspace Registry implementation.
- **Cycle 2:** Navigation Adapter (Sidebar switch).
- **Cycle 3:** Wealth Cockpit Shell construction.
