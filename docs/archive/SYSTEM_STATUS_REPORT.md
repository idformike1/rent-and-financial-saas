# SYSTEM STATUS REPORT: Post-Reset Forensic Scan

**Timestamp:** 2026-04-29T13:15:00Z  
**Role:** Lead System Architect  
**Status:** READ-ONLY Reconnaissance Complete

---

## 1. Active Design Tokens
The current base layer is governed by Tailwind v4 and unified CSS variables.

| Token | Value | Semantic Usage |
| :--- | :--- | :--- |
| `--background` | `#161821` | Global body background |
| `--card` | `#1E1E2A` | Component surfaces & cards |
| `--brand` | `#5D71F9` | Electric Indigo (Primary Action) |
| `--radius-md` | `12px` | Primary container rounding |
| `--radius-sm` | `8px` | Button & input rounding |
| `--shadow-elevation`| `0 8px 30px rgba(0,0,0,0.4)` | Depth/Elevation layer |

**Typography Standards:**
- **Font Sans:** Arcadia Text / Display
- **Font Mono:** IBM Plex Mono (Strictly for tabular/financial data)
- **Label Caps:** `12px` | `500` Weight | `0.04em` Tracking (Normalized)

---

## 2. Component Inventory
Audit of `src/components/` taxonomy reveals the following primitive landscape:

### Tables (Fragmentation: High)
- **DataTable.tsx** (`@/src/components/system/`): Unified institutional-grade primitive. Includes `MercuryTable` alias.
- **AssetLedgerTable.tsx** (`@/src/components/modules/assets/`): Domain-specific ledger.
- **TreasuryLedgerTable.tsx** (`@/src/components/modules/treasury/`): Domain-specific ledger.
- **UserTable / AccessControlTable**: Legacy artifacts in `finova/team`.

### Surfaces & Overlays (Fragmentation: Extreme)
- **SideSheet.tsx** (`@/src/components/system/`): Current system-standard for side-panels.
- **UnitSideSheet / TransactionDetailSheet**: Domain-specific implementations using system tokens.
- **Drawers**: `DrillDownDrawer`, `PaymentDrawer`, `TransactionDetailDrawer` (Redundant with SideSheet logic).
- **Modals**: 8+ distinct modal types (e.g., `AddUserModal`, `EditTenantModal`) using local state instead of centralized overlay primitives.

### Cards & Containers (Fragmentation: Low)
- **Card.tsx** (`@/src/components/system/`): Primary primitive. Uses `mercury-card` CSS class for shadow/radius sync.
- **BreakdownCard / SummaryCard**: Wrapped implementations in `finova/insights`.

---

## 3. Module Architecture
Mapping of routing pages to module implementation:

- **Assets Module:** `src/app/(tenant)/assets/` 🟢 **STABLE**
  - Imports from `src/components/modules/assets/`.
  - Architecture: Dumb Routing -> Smart Module Client.
- **Treasury Module:** `src/app/(tenant)/treasury/` 🟢 **STABLE**
  - Imports from `src/components/modules/treasury/`.
  - Architecture: Dumb Routing -> Smart Module Client.
- **Tenants Module:** `src/app/(tenant)/tenants/` 🔴 **FRAGILE**
  - Still utilizes local `TenantGrid.tsx` and `TenantClient.tsx` within the routing directory.
- **Insights Module:** `src/app/(tenant)/reports/insights/` 🔴 **FRAGILE**
  - Utilizes local `InsightsGrid.tsx`.
  - Enforces local `theme-sharp` CSS override (Legacy).

---

## 4. Current System Friction

1. **Directory Duality:** The Tenants and Insights modules have not been migrated to `src/components/modules/`, leading to cognitive load when locating domain logic.
2. **Overlay Collision:** Mixing `Drawer` (shadcn-ish) and `SideSheet` (custom system) results in inconsistent backdrop behaviors and scroll-lock conflicts.
3. **Ghost Tokens:** `globals.css` contains `theme-sharp` (6px radius) which is still manually triggered on the Insights page, causing a visual "sharpness" clash with the rest of the 12px "Axiom V2" UI.
4. **Input Redundancy:** `ui-finova.tsx` contains a `Button` and `Input` implementation that overlaps with older files in `finova/ui/`.

---
**END OF REPORT**
