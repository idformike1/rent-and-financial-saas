# SOVEREIGN OS: UI DEAD-WIRE AUDIT REPORT (V.2.2)

**Forensic Audit of Interactive UI Integrity**
**Author:** Lead QA Code Analyzer
**Scope:** `src/components/modules/`

---

## 1. EXECUTIVE SUMMARY
A deep static analysis was performed on 40+ Client Components within the Sovereign OS modules. While core provisioning and financial mutation engines are successfully wired to Server Actions, several auxiliary telemetry controls, export protocols, and secondary action buttons remain "dead" (bound to no handler) or are limited to placeholder toast notifications.

## 2. DEAD BUTTONS (NO HANDLERS)
These elements are present in the DOM but lack any `onClick`, `href`, or `type="submit"` logic.

| Component | File Path | Button Label | Line # | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **TransactionFeedClient** | `src/components/modules/treasury/TransactionFeedClient.tsx` | Load Forensic History | 477 | Low - Visual only |
| **TransactionFilterBar** | `src/components/modules/treasury/TransactionFilterBar.tsx` | Apply Parameters | 283 | **High** - Filter state cannot be committed |
| **KpiGrid** | `src/components/modules/insights/KpiGrid.tsx` | Aggregation Selector (`{aggregation}`) | 172 | Med - Visual trigger only (menu works on hover) |

## 3. PLACEHOLDER WIRES (TOAST/ALERT ONLY)
These buttons are bound to handlers, but the handlers do not execute logic beyond a diagnostic toast/alert.

| Component | File Path | Button Label | Logic Type | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **PropertySovereignClient** | `src/components/modules/assets/PropertySovereignClient.tsx` | Remediate | Toast Placeholder | Med - Remediation unreachable |
| **PropertySovereignClient** | `src/components/modules/assets/PropertySovereignClient.tsx` | Log Transaction | Toast Placeholder | **High** - Ledger mutation blocked |
| **PropertySovereignClient** | `src/components/modules/assets/PropertySovereignClient.tsx` | Export | Toast Placeholder | Med - Data extraction blocked |
| **TransactionDetailDrawer** | `src/components/modules/insights/TransactionDetailDrawer.tsx` | Export Forensic Log | Alert Placeholder | Med - Audit log export blocked |

## 4. FORM INTEGRITY STATUS
Most forms are correctly wired to their respective gateways. No broken forms (forms without targets) were identified.

| Module | Form Component | Status | Target Action |
| :--- | :--- | :--- | :--- |
| Assets | `UnitConfigForm` | **Wired** | `updateUnit` |
| Assets | `LedgerInjectionForm` | **Wired** | `logExpense` |
| Assets | `LeaseAssignmentForm` | **Wired** | `submitOnboarding` |
| Assets | `PropertySovereignClient` (Provision) | **Wired** | `createUnit` |
| Treasury | `ExpenseFormClient` | **Wired** | `logExpense` |
| Tenants | `EditTenantModal` | **Wired** | `updateTenant` |
| Tenants | `LogUtilityModal` | **Wired** | `logUtility` |

## 5. UI REACHABILITY (SIDE SHEETS & MODALS)
The following interactive containers have been verified as reachable via existing triggers.

- [x] **UnitSideSheet**: Reachable via `UnitGrid` row clicks (URL state).
- [x] **EditAssetModal**: Reachable via Header "Edit" button.
- [x] **ArchiveAssetModal**: Reachable via Header Trash icon.
- [x] **AddUnitModal**: Reachable via Header "Provision Unit" button.
- [x] **PaymentDrawer**: Reachable via `TenantClient` & `TenantProfileView` payment buttons.
- [x] **Forensic Modals**: (Utility, Adjustment, Reversal) Reachable via `TenantProfileView` sidebar/ledger.

## 6. RECOMMENDATIONS
1.  **Immediate Priority**: Wire `TransactionFilterBar` "Apply Parameters" to the state commitment function.
2.  **Module Interconnectivity**: Bind the "Log Transaction" placeholder in `PropertySovereignClient` to a simplified instance of the `ExpenseFormClient` SideSheet.
3.  **Audit Integrity**: Implement the CSV/PDF generation protocols for the identified Export placeholders.
