<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sovereign Dashboard Governance

### 1. Viewport Lockdown (Option 3 Protocol)
*   **Mobile/Tablet**: Units and Ledger cards must use a **`70vh`** hard-height baseline. This ensures high density (5+ entries) while allowing the card to naturally "overflow" the viewport.
*   **Desktop (XL)**: The dashboard must be **Strictly Viewport Locked** using `xl:h-[calc(100vh-480px)]` on the grid parent. No page scrolling is permitted on Desktop; only internal card scrolling.

### 2. Sliver Bug Prevention
*   **Prohibition**: Never use `flex-1` or `h-full` as the primary height driver for the Units or Ledger cards in stacked mode.
*   **Enforcement**: All adaptive modules must have an explicit `min-h` or `vh` floor to prevent browser-side flexbox collapse.

### 3. Branding & Naming
*   **The Operational Registry**: Must always be named **UNITS**.
*   **The Fiscal Ledger**: Must always be named **LEDGER**.
*   **Typography**: Titles must be **UPPERCASE BOLD**. Subtitles (node counts) must be **Title Case Medium** (`text-white/40`) to maintain clinical hierarchy.

### 4. Interactive Protocol
*   **Lift & Glow**: All interactive slabs must use the institutional hover effect: `hover:shadow-lg`, `hover:-translate-y-0.5`, and `transition-all`.
*   **Icon Pulse**: Module icons must scale to `110%` and glow on group hover.

# ASSET DOMAIN LOCK
> [!IMPORTANT]
> The Asset Detail page (`PropertySovereignClient.tsx`) is currently under **Hard Lockdown**. No structural or visual changes are permitted without explicit USER authorization.
