# Mercury Alpha: Ghost Session Patch
**Role:** Senior Security Architect  
**Status:** Real-Time Session Revocation ACTIVE

## 1. Identity Synchronization
The stateless JWT barrier has been reinforced with a stateful persistence check.

- **Auth Lifecycle:** Updated `auth.ts` with a database lookup in the `session` callback.
- **Revocation Logic:** If a user is flagged as `isActive: false` in the database, the server-side session immediately returns a `SUSPENDED` role, triggering UI lockouts.

## 2. Structural Mutation Hardening
The server action layer now executes a mandatory "Heartbeat Check" before any data-modifying operation.

- **Live Gate:** `runSecureServerAction` refactored to perform a `prisma.user.findUnique` check.
- **Fail-Closed:** If the database check fails or the user is suspended, a `SECURITY_CRITICAL` error is thrown, and the operation is aborted before hitting the service layer.
- **Latency Optimization:** The check is integrated into the existing security wrapper to minimize round-trip overhead.

## 3. Policy Enforcement
- **Revocation Speed:** Near real-time (on precisely the next server-side interaction).
- **Graceful Termination:** Suspended users are flagged in the session, allowing the frontend to handle redirects to the login or restricted page gracefully.

## 4. Verification
- **Build Status:** `SUCCESS` (Verified via production build).
- **Type Safety:** Extended `Session` types to include `isActive` for full end-to-end type safety.

---
*Architectural vulnerabilities neutralized by Antigravity security engineering.*
