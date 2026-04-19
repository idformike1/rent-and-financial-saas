# Governance & Security: Current State Audit

## 1. Audit Sentinel UI & Logic
Inspection of the current auditing infrastructure reveals a functional foundation with significant opportunities for analytical refinement.

*   **Location**: `src/app/(app)/settings/audit/page.tsx`
*   **Infrastructure**:
    *   **Data Source**: Real-time database sourcing from the `AuditLog` table using Prisma.
    *   **UI Standard**: High-density, workstation-grade table implementation using "Mercury Clinical" aesthetic.
    *   **Data Points**: Captures `Timestamp`, `Operator` (User info), `Action` (CRUD type), `Target` (Entity type/ID), and a JSON `Metadata` explorer.
    *   **Backend Support**: `lib/audit-logger.ts` provides a `recordAuditLog` utility with support for transactions (`tx`) and "System Recovery" mode for orphaned identities.
*   **Gaps Identified**:
    *   **Zero Filtering**: No UI-level or API-level filtering by date, operator, or action type exists.
    *   **Pagination**: Hardcoded to `take: 100` records; no navigation controls for historical archive traversal.
    *   **Metadata Explorer**: Simple line-clamping layout; lacks a dedicated modal or side-sheet for deep inspection of complex payloads.

## 2. Role-Based Access Control (RBAC)
The current security posture utilizes a high-level hierarchy but lacks granular permission mapping.

*   **Logic Location**: `lib/auth-utils.ts` and `auth.config.ts`.
*   **Role Definition**:
    *   Hardcoded enum-style hierarchy: `OWNER (1)` > `MANAGER (2)` > `ADMIN (3)`.
    *   Stored as a `String` column in the `User` and `Invitation` models (`prisma/schema.prisma`).
*   **Access Enforcement**:
    *   **Route Blocking**: Performed manually at the page level (e.g., `if (role !== 'OWNER') redirect`). **No centralized `middleware.ts` currently exists** for path-based protection.
    *   **Mutation Protection**: `runSecureServerAction` wrapper enforces role hierarchy for all backend mutations.
    *   **Navigation**: `AppShell.tsx` filters navigation sections based on session role (e.g., `MANAGER` cannot see 'Governance control').
*   **Gaps Identified**:
    *   **No Middleware**: The system is vulnerable to direct URL navigation if a page developer forgets to include a session/role check.
    *   **Lack of Granularity**: No relational mapping for specific permissions (e.g., `CAN_VIEW_TREASURY`). Users are bucketed into broad roles.
    *   **Static Defaults**: `canEdit` is a binary boolean in the User table rather than a scoped permission set.

## 3. Recommended Security Hardening (Institutional Phase)
*   **Centralization**: Move all route-level protection to a standardized `middleware.ts`.
*   **Audit Sentinel**: Implement Server Side Search & Filter logic (`where` clauses based on URL params).
*   **RBAC Transition**: Move from Role Hierarchy to Permission-Based Access Control (PBAC) by introducing a `Permission` model in Prisma.
