# Mercury Alpha: Read-Only Role Patch (VIEWER)
**Role:** Lead DevSecOps Engineer  
**Status:** RBAC Hardened & Mathematically Locked

## 1. Role Definition & Hierarchy
The `VIEWER` (Auditor) role has been introduced as the most restricted tier in the Mercury Alpha ecosystem.

- **Hierarchy Level:** 4 (Highest restriction)
- **Permissions:** Global Read-Only access to primary dashboards.
- **Constraints:** Mathematically barred from all mutation protocols.

## 2. Security Enforcement: The Mutation Lock
A "blanket ban" has been implemented at the core data-access layer in `lib/auth-utils.ts`.

> [!IMPORTANT]
> **Zero-Mutation Enforcement:** All server actions wrapped in `runSecureServerAction` now check the caller's role. If the role is `VIEWER`, the process is terminated with an `UNAUTHORIZED: Read-Only Access` error before any database logic is parsed.

## 3. Edge Firewall Hardening
The application middleware (`src/proxy.ts`) now explicitly monitors the `VIEWER` role for perimeter violations.

- **Access Granted:** `/home`, `/treasury`, `/assets`, `/tenants`, `/api/reports`.
- **Access Denied:** `/settings/*`, `/governance/*`, `/treasury/payables/*`.
- **Violation Protocol:** Redirect to `/home?unauthorized=read_only_restriction` with a security warning.

## 4. UI Graceful Degradation
To prevent user frustration, all high-privilege action buttons are sequestered when a `VIEWER` session is active.

| Component | Hidden Action |
| :--- | :--- |
| **Asset Registry** | "Deploy New Asset" button |
| **Property Detail** | "Mutation" (Edit), "Purge" (Delete), "Provision Node" buttons |
| **Forensic Ledger** | "Void Activity" button |
| **Tenant Registry** | "Initialize Payment" (DollarSign) button |

## 5. Verification Status
- **Build Integrity:** `SUCCESS` (Verified via Turbopack production build).
- **Type Safety:** All server actions and client components updated to handle the `VIEWER` optional state.

---
*Patch enforced by Antigravity DevSecOps.*
