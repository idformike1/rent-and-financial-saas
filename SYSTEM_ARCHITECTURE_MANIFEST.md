# SYSTEM ARCHITECTURE MANIFEST (SOVEREIGN OS)
**Author:** Principal Enterprise Architect  
**Status:** ACTIVE - SYSTEM BASELINE  
**Last Scan:** 2026-04-30  

---

[ACTIVE FOCUS]:Current Active Sprint: Auditing the Tenants & Leases Module.

## 1. System Engines & Infrastructure
The underlying machinery powering the Sovereign OS financial ecosystem.

- **Authentication Engine (`lib/auth-utils.ts`)**: 
  - NextAuth-based authority with multi-role support (OWNER, ADMIN, MANAGER, VIEWER).
  - Implements `runSecureServerAction` for transaction-level authorization.
- **Database Engine (`src/lib/db.ts` / `prisma/`)**: 
  - PostgreSQL backing via Prisma ORM.
  - Multi-tenant isolation enforced via `organizationId` at the query level (Sovereign Client pattern).
- **UI System (`src/components/finova/ui/` / `src/components/system/`)**: 
  - **Axiom V2**: Clinical finance design system using Tailwind CSS, Radix UI, and Lucide.
  - Key Patterns: High-density DataTables, MetricBlocks, and SovereignSkeletons.
- **Telemetry & Analytics (`src/services/analytics.service.ts`)**: 
  - Real-time aggregation of ledger entries for NOI, occupancy, and portfolio health.
- **Audit Engine (`lib/audit-logger.ts`)**: 
  - Systematic tracking of state changes across all domain models.

---

## 2. Domain Status Matrix
Current implementation state of the primary business modules.

| Domain Module | Status Tag | Integration State |
| :--- | :--- | :--- |
| **Assets** | `[[YELLOW - PENDING E2E AUDIT]` | Fully wired to `Property` & `Unit` models. Functional CRUD & Unit Config. |
| **Tenants** | `[YELLOW - PENDING E2E AUDIT]` | Integrated with `Tenant` registry and `Lease` management logic. |
| **Treasury** | `[YELLOW - PENDING E2E AUDIT]` | Real-time `LedgerEntry` processing. Master Ledger visibility active. |
| **Insights** | `[YELLOW - PENDING E2E AUDIT]` | Telemetry hydrated via `treasuryService`. Interactive chart matrix. |
| **Governance** | `[YELLOW - PENDING E2E AUDIT]` | Universal Forensic Ledger Explorer active with multi-parameter filtering. |
| **Wealth** | `[YELLOW - PENDING E2E AUDIT]` | DB Models & Actions exist, but UI pages are currently analytical scaffolding. |
| **Settings** | `[YELLOW - PENDING E2E AUDIT]` | System-level configurations (tariffs, grace periods) wired to DB. |
| **Onboarding** | `[YELLOW - PENDING E2E AUDIT]` | End-to-end organization provisioning and member invitation flow. |

---

## 3. Routing Tree
Exposed system surface and navigational architecture.

```text
/ (Root)
├── auth/
│   └── login (Authentication Entry)
├── onboarding (Provisioning Flow)
├── home (Main Command Center - Context Switching RENT/WEALTH)
├── assets/ (Property Portfolio Intelligence)
│   └── [propertyId] (Asset Deep Dive)
├── tenants/ (Occupant Registry)
│   └── [tenantId] (Tenant Behavioral Dossier)
├── treasury/ (Fiscal Control Hub)
│   └── feed (Real-time Transaction Stream)
├── wealth/ (Personal Wealth Module)
│   ├── accounts (Holdings Matrix)
│   ├── cashflow (Personal Fiscal Flow)
│   └── transfers (Internal Ledger Movements)
├── reports/ (Financial Insights)
│   └── insights (Telemetry Dashboard)
├── governance/ (Forensic Oversight)
│   └── ledger (Universal Entry Explorer)
└── settings/ (System Configuration)
```

---

## 4. Data Topology
The Prisma model hierarchy and relational integrity maps.

- **The Sovereign Root**: `Organization` acts as the root boundary. No data cross-pollination occurs between organizations.
- **Operational Stack**: 
  - `Property` -> `Unit` -> `Lease` -> `Tenant`.
  - Captures physical and legal occupancy states.
- **Financial Stack (Double-Entry Ledger)**:
  - `Transaction` (Parent) -> `LedgerEntry` (Child).
  - `LedgerEntry` links to: `Account`, `WealthAccount`, `IncomeSource`, or `ExpenseCategory`.
  - Supports both Commercial (Rent) and Personal (Wealth) fiscal records.
- **System Layer**:
  - `User` & `OrganizationMember` (Access & Entitlements).
  - `AuditLog` (Traceability).
  - `ReportSnapshot` (Point-in-time financial state capture).
