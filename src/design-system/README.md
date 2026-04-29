# Axiom 2026 Design System Rules

### 1. Token-Driven Layouts
All spacing, colors, and border radii MUST use the predefined CSS variables. 
- Use `p-[var(--space-6)]` instead of `p-6`.
- Use `rounded-[var(--radius-md)]` instead of `rounded-xl`.
- Use `bg-[var(--color-surface)]` instead of `bg-card`.

### 2. Typography Standard
Use semantic text classes for all data presentation:
- `.text-label`: Metadata and captions (12px, muted).
- `.text-value`: Primary data points (28px, semi-bold, tabular).
- `.text-body`: Standard content (15px, primary).
- `.text-muted`: Secondary content (13px, muted).

### 3. Data Visualization
Semantic colors must be used for status and trends:
- `.data-positive`: Success, growth, income (#22C55E).
- `.data-negative`: Error, loss, expense (#EF4444).
- `.data-warning`: Caution, pending (#F59E0B).

### 4. Component Composition
- **Cards**: All sections must be wrapped in the `Card` component.
- **Grids**: Use a standard gap of `var(--space-6)` for layout grids.
- **Tables**: Use `DataTable` for all high-density information displays.
