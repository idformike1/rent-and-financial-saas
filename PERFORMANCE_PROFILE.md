# PERFORMANCE PROFILE: PROPERTY WING (ASSETS, TENANTS, TREASURY)

**Author:** Lead Performance Engineer  
**Status:** DRAFT / ANALYSIS COMPLETE  
**Latency Target:** < 200ms  
**Current Latency:** 3,000ms - 4,000ms  

---

## 1. THE QUERY BOTTLENECKS (N+1 & RELATIONAL OVERLOAD)

Our data access layer suffers from "Heavy Materialization" where large relational graphs are pulled into memory and processed in Node.js instead of being filtered at the database level.

### A. The "Big Select" Syndrome (Assets & Tenants)
In `src/services/asset.service.ts` and `src/services/tenant.service.ts`, we are executing massive nested queries that fetch thousands of rows across multiple tables.
- **`assetService.getPortfolioSummary` (L75-155):** Fetches ALL properties + ALL ledger entries (filtered by date) + ALL units + ALL active leases + ALL tenants. 
    - **Bottleneck:** Lines 105-143 perform manual `map` and `reduce` operations on this massive dataset. As the portfolio grows, this will scale linearly in latency.
- **`tenantService.getTenantsWithContext` (L27-57):** Fetches ALL tenants + active leases + units + properties + outstanding charges.
    - **Bottleneck:** This is used for the main registry. It does not implement pagination (`take`/`skip`), meaning every load pulls the entire tenant database.

### B. In-Memory Filtering (Treasury)
- **`treasuryService.getProfitAndLoss` (L76-95):** Fetches ALL ledger entries for a property and then uses `.filter()` in Javascript to separate Income from Expense.
    - **Bottleneck:** This bypasses SQL's aggregation power. This should be a `groupBy` or separate aggregate queries.

### C. Sequential Waterfall (Asset Pulse)
- **`assetService.getPropertyAssetPulse` (L340-356):** Executes 5 separate, sequential `await` calls to the database.
    - **Bottleneck:** Each call adds round-trip latency (~50-100ms per call). Total wait time is the sum of all 5 queries instead of the slowest one.

---

## 2. THE CACHING DEFICIT (DYNAMIC RENDERING OVERHEAD)

The "Property Wing" is currently 100% dynamic, meaning no result is ever reused. Every click triggers a full database re-computation.

- **Missing `unstable_cache`:** Read-heavy modules like `PortfolioSummary` and `DashboardKPIs` are calculated from scratch on every request. There is no usage of Next.js's data caching layer.
- **Missing ISR / Revalidation:** Dashboard pages (`/treasury`, `/assets`) do not use `export const revalidate = 60`. Since these pages depend on `searchParams`, they are opted into dynamic rendering by default, but even the static parts are not cached.
- **Serialization Overhead:** Throughout the app (e.g., `src/app/(tenant)/assets/page.tsx:L29`), we use `JSON.parse(JSON.stringify(properties))` to serialize Prisma Decimals. This deep-clone operation on large objects adds significant CPU overhead during the render phase.

---

## 3. UI MUTATION AUDIT (THE RESPONSIVENESS GAP)

The perceived latency is amplified by a "hard-blocked" UI strategy.

- **No `useTransition`:** When a user switches filters (e.g., `LedgerClient.tsx:L37` - INCOME to EXPENSE), the UI remains static while the server re-fetches the entire dataset. There is no visual feedback that a "pending" transition is happening other than the browser's native loading indicator.
- **No `useOptimistic`:** Mutations like `onToggleClear` or `onVoid` in `LedgerClient.tsx` wait for the server action to complete before updating the local state. This creates a "stutter" where the UI feels frozen for 500ms+ after a click.
- **Refresh Waterfall:** Many actions (like `AssetClient.tsx:L86`) call `router.refresh()`. This triggers a full re-fetch of all server components on the page, including the heavy "Big Select" queries described in Section 1.

---

## 4. REMEDIATION STRATEGY (ROADMAP TO < 200MS)

To achieve institutional-grade performance, we must move from "Materialize Everything" to "Stream & Cache".

### Phase 1: Database & Service Optimization (The "Thin" Query)
1. **Implement Pagination:** Add `take` and `skip` to all registry queries (`getTenantsWithContext`, `getMasterLedger`).
2. **Aggregations over Mapping:** Refactor `getPortfolioSummary` and `getProfitAndLoss` to use Prisma `groupBy` and `_sum` instead of in-memory Javascript reduction.
3. **Parallelize Pulse:** Wrap sequential queries in `Promise.all` within `getPropertyAssetPulse`.

### Phase 2: Caching Layer (The "Instant" Read)
1. **Memoized Services:** Wrap read-heavy service methods in `unstable_cache` with specific tags (e.g., `['org-1-portfolio']`).
2. **On-Demand Revalidation:** Use `revalidateTag` in Server Actions to purge the cache only when data actually changes, allowing 99% of requests to hit the cache.
3. **Serial Safe Layers:** Replace `JSON.parse(JSON.stringify)` with a dedicated serialization utility that only converts Decimals to Numbers once.

### Phase 3: UX & Perceived Performance (The "Fluid" UI)
1. **`useTransition` Integration:** Wrap `router.push` and `router.refresh` calls in `startTransition` to allow the UI to remain interactive and show a progress bar.
2. **Optimistic States:** Implement `useOptimistic` for transaction status toggles and asset registration to give the user immediate "success" feedback.
3. **Skeleton Refinement:** Use the `Suspense` boundaries more granularly so the header loads instantly while the "Big Select" data streams in behind a skeleton.
