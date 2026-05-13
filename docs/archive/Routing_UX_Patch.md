# Mercury Alpha: Routing & RBAC Refinement Patch
**Role:** Lead DevSecOps Engineer  
**Status:** Protocol Granularity & Operational Visibility Hardened

## 1. Action Granularity (Read vs. Write)
The `VIEWER` role has been refactored from a global "Deny All" state to a "Read-Only Dashboard" state.

- **Infrastructure:** Updated `runSecureServerAction` in `lib/auth-utils.ts` to include an `isMutation` flag.
- **Whitelisted Queries:** Set `isMutation: false` for mission-critical queries:
    - **Treasury:** `getAccountLedger` (Transactions/Balance feeds).
    - **Assets:** `getAvailableUnits`, `getUnitLedgerFeed`.
    - **Team:** `fetchTeamMembers`.
- **Enforcement:** The mutation lock remains strictly active for all state-changing operations (Create, Update, Delete).

## 2. Standardized Clearance Protocol
The system now handles unauthorized routing with a uniform, high-density clinical response.

- **Fallback Route:** Established `/restricted` as the primary 403 landing page.
- **Edge Firewall:** Updated `proxy.ts` to replace inconsistent redirects with a unified pivot to the `/restricted` route for all RBAC violations.

## 3. Navigational Sanitization
Sidebar navigation has been refined to eliminate all restricted entry points for viewers.

- **Items Hidden:** Tenant Registry (PII protection), Expense Registry (Fiscal control), and the entire Governance Control pillar.
- **Sync:** Confirmed that navigation filtering matches the edge firewall's boundary rules.

## 4. Verification
- **Build Status:** `SUCCESS` (Verified via production build).
- **Service Stability:** All restored treasury and asset logic confirmed functional and type-safe.

---
*Operational boundaries hardened by Antigravity DevSecOps.*
