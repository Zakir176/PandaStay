---
name: PandaStays Terminal
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#855300'
  on-tertiary: '#ffffff'
  tertiary-container: '#e29100'
  on-tertiary-container: '#523200'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 1rem
  sidebar-width: 260px
  stack-compact: 0.5rem
  stack-default: 1.5rem
  page-margin-mb: 1rem
  page-margin-dt: 2rem
---

## Brand & Style
The design system focuses on **Professional Trust and Operational Efficiency**. It is tailored for the Zambian real estate market, specifically for high-frequency boarding house management where clarity regarding payment status is paramount.

The design style is **Corporate Modern with a Functional Edge**. It prioritizes legibility and information density over decorative flair. The interface utilizes a "Utility-First" approach: heavy whitespace is replaced by systematic padding to allow more data on screen, while high-contrast status indicators ensure landlords can identify arrears or partial payments at a glance. The emotional response should be one of control, reliability, and precision.

## Colors
The palette is rooted in fiscal stability and clarity:
- **Primary (Emerald Green):** Reserved for "Paid" statuses, primary action buttons, and growth indicators. It symbolizes financial health.
- **Secondary (Slate Navy):** Used for all structural elements including sidebars, top navigation, and primary headings. It provides a grounded, authoritative frame.
- **Accent (Yellow):** A critical functional color for "Partial" payments and "Pending" alerts. It commands attention without the alarm of red.
- **Neutral (Slate):** Used for secondary text, icons, and borders to maintain a clean, organized hierarchy.
- **Background:** A very light slate tint (#f8fafc) is used to reduce screen glare during long sessions of data entry.

## Typography
This design system employs **Inter** for its neutral, highly legible grotesque characteristics, making it ideal for dense dashboards. **JetBrains Mono** is introduced specifically for financial figures and unit numbers to ensure character alignment in data grids (tabular lining).

- **Hierarchy:** Use `display-lg` for dashboard overviews (e.g., Total Revenue).
- **Data Grids:** Use `body-sm` for table rows to maximize information density.
- **Financials:** All currency values (ZMW) should use `data-mono` for better scannability when stacked vertically.
- **Labels:** Use `label-caps` for table headers and section overlines.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains fixed at 260px, while the main content area utilizes a fluid 12-column grid.

- **Grid:** 16px (1rem) gutters between columns.
- **Density:** The system uses a "Compact" rhythm for data-heavy views. Vertical padding in tables is set to 12px to allow more rows per fold.
- **Responsive Behavior:** 
  - **Desktop:** 12 columns, 32px margins. 
  - **Tablet:** 6 columns, 24px margins, sidebar collapses to icons.
  - **Mobile:** 4 columns, 16px margins, sidebar moves to a bottom navigation bar or hamburger menu.
- **Slide-overs:** Interaction panels emerge from the right, occupying 400px of the screen width, overlaying content with a 40% opacity Slate Navy backdrop.

## Elevation & Depth
To maintain a high-trust, professional look, the design system avoids heavy shadows in favor of **Tonal Layering and Low-Contrast Outlines**.

- **Level 0 (Background):** #f8fafc.
- **Level 1 (Cards/Surface):** White (#ffffff) with a 1px solid border (#e2e8f0). No shadow.
- **Level 2 (Dropdowns/Modals):** White with a soft, 15% opacity Slate Navy shadow (0px 10px 15px -3px) to indicate temporary overlay.
- **Level 3 (Active Slide-overs):** White with a 1px border and a wide 20% opacity shadow to create a distinct separation from the dashboard behind it.
- **Interactive States:** Buttons use a subtle inner-shadow on 'press' to simulate a physical click, reinforcing a tactile, "built-to-last" software feel.

## Shapes
The shape language is **Soft and Precise**. 
- **Standard Elements:** Buttons, input fields, and cards use a 0.25rem (4px) radius. This provides a modern feel without looking overly casual or "bubbly."
- **Status Badges:** Use a slightly higher radius (rounded-lg / 8px) to distinguish them from interactive buttons.
- **Search Bars:** Utilize a fully rounded (pill-shaped) profile to differentiate global navigation tools from data-entry fields.

## Components
- **Summary Cards:** Top-of-page metrics. Must include a `data-mono` value, a `label-caps` title, and a small trend indicator (Emerald for up, Red for down).
- **Status Badges:** 
  - *Paid:* Primary Green background (10% opacity) with Primary Green text.
  - *Partial:* Yellow background (10% opacity) with Dark Yellow text.
  - *Overdue:* Red background (10% opacity) with Red text.
- **Data Grids:** Rows must have a subtle hover state (#f1f5f9). Use 1px Slate Navy outlines for the primary action button within a row.
- **Slide-over Panels:** Used for "Tenant Details" or "Add Payment." Must include a sticky header with a "Close" icon and a sticky footer containing primary/secondary actions.
- **Input Fields:** Use 1px Slate borders. On focus, the border transitions to Primary Emerald with a 2px outer glow of 10% opacity Emerald.
- **Dense List Items:** For room-by-room views, use a vertical stack with condensed `body-sm` text and a right-aligned chevron for drill-down.