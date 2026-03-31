# AI EXECUTION & IMPLEMENTATION PLAN

**AGENT INSTRUCTION:** Do not move to the next phase until the current phase compiles successfully and passes strict type-checking (`tsc --noEmit`).

### Phase 1: Foundation & Data Layer
- [x] Initialize Next.js project with Tailwind and TypeScript.
- [x] Setup `lib/prisma.ts` singleton.
- [x] Translate PRD into `prisma/schema.prisma`.
- [x] Create strict TypeScript interfaces in `types/index.ts`.

### Phase 2: Core UI Shell & Authentication
- [x] Implement Next.js Middleware.
- [x] Build global layout (`app/layout.tsx`) with sidebar.
- [x] Implement RBAC utilities.

### Phase 3: The Treasury Engine
- [x] Implement Algorithm A (Payment Waterfall) Server Action.
- [x] Implement Algorithm B (Utility Reconciliation) logic.
- [x] Build `/onboarding` multi-step wizard and Day One transaction.

### Phase 4: Frontend Dashboards & CRM
- [x] Build `/treasury` dashboard using Recharts.
- [x] Build `/tenants/[tenantId]` profile page.
- [x] Implement `<PaymentDrawer />` with real-time preview.

### Phase 5: Export & Polish
- [x] Integrate PDF generation.
- [x] Run full project type-check and resolve ESLint warnings.
