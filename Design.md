# PandaStays Design System Specification
## Tactile Bento Grid System for Zambian PropTech

**Design System Version:** 2.0.0 (Production Bento Release)  
**Target Brand:** PandaStays — Student Housing & Boarding PropTech  
**Design Philosophy:** Tactile Bento Information Architecture, High Contrast Utility & Visual Excellence  

---

## 1. Design Principles & Brand Identity

The PandaStays design system combines the structured density of modern **Bento Grids** with architectural tactile signatures tailored for high-frequency Zambian student boarding house operations:

1. **The Bed-Space as the Central Visual Motif:** The individual bed silhouette — not abstract bar charts or generic avatars — is the core visual identifier across all floorplans and occupancy widgets.
2. **High-Contrast Hero Inversion:** Tactical use of rich, inverted dark cards (`#0B2416` with `#34A864` electric accents) to anchor primary executive KPIs (Total Revenue, Lenco Terminal) against clean, organic light surfaces (`#F4F6F4`).
3. **Capsule Pill Geometry:** Compact rounded-full pills for high-density badges, status chips, and action buttons to establish clean visual hierarchy over boxy cards.
4. **Architectural Tactile Textures:** Functional diagonal hatch patterns (`bg-hatch-diagonal`) and topographic contour waves (`bg-topo-dark`) symbolizing architectural floorplans and terrain without decorative clutter.
5. **Fluid Micro-Interactions & Motion:** Decelerated cubic-bezier entrance animations (`bentoFadeUp`) and 60fps/120fps ease-out number counters that bring live metrics to life without causing layout shifts.

---

## 2. Color Tokens & Theme Palettes

### 2.1 Refined Core Palette (CSS Custom Properties in `style.css`)

```css
@theme {
  /* PandaStays Refined Bento Palette */
  --color-primary: #144D2F;                 /* Deep Forest Emerald */
  --color-primary-hover: #0F3D24;
  --color-primary-accent: #34A864;          /* Electric Mint Accent */
  --color-primary-container: #E6F3EB;       /* Soft Mint Container */
  --color-on-primary: #FFFFFF;
  --color-on-primary-container: #082515;

  --color-hero-dark: #0B2416;               /* Inverted Hero Card Background */
  --color-hero-topo: #183C28;

  --color-secondary: #4A5160;               /* Warm Charcoal Navy */
  --color-secondary-container: #EAECEF;
  --color-on-secondary: #FFFFFF;
  --color-on-secondary-container: #22262E;

  --color-tertiary: #B47818;                /* Warm Ochre (Partial/Pending) */
  --color-tertiary-container: #FDF4E6;
  --color-tertiary-accent: #D99528;
  --color-on-tertiary: #FFFFFF;
  --color-on-tertiary-container: #492E08;

  --color-error: #C43242;                   /* Brick Red (Overdue/Urgent) */
  --color-error-container: #FDECEE;
  --color-on-error: #FFFFFF;
  --color-on-error-container: #4E1810;

  /* Clean Organic Bento Surface Tokens */
  --color-background: #F4F6F4;              /* Soft Warm Canvas */
  --color-surface: #FFFFFF;                 /* Clean White Card Surface */
  --color-surface-dim: #EDF1ED;
  --color-surface-container: #F4F6F4;
  --color-surface-container-low: #F8FAF8;
  --color-surface-container-high: #E6ECE6;
  --color-border-card: #E2E7E2;             /* Subtle Bento Outline */
  --color-outline: #D0D8D0;

  --color-on-surface: #0C1A12;              /* Near-Black Text */
  --color-on-surface-variant: #5C6A61;      /* Secondary Label Text */
  --color-on-surface-muted: #9AA79F;        /* Data Table Caps Text */
}
```

### 2.2 Curated Color Themes (`src/lib/theme.js`)
PandaStays provides 6 dynamic HSL-tuned accent schemes that adjust primary, hover, and container variables at runtime:

| Theme Name | Primary Hex | Description |
| :--- | :--- | :--- |
| **Forest** (Default) | `#144D2F` | Deep Zambian forest emerald with electric mint accents. |
| **Savanna** | `#855300` | Warm golden ochre inspired by the African savanna. |
| **Midnight** | `#1A365D` | Executive slate navy tailored for corporate landlords. |
| **Kafue** | `#006874` | Deep river teal symbolizing the Kafue basin. |
| **Copper** | `#9C4124` | Rich copper terracotta celebrating Zambia's copper heritage. |
| **Jacaranda** | `#5B3E8C` | Royal violet reflecting blooming Lusaka jacarandas. |

---

## 3. Typography System

The typography pairs an authoritative, human-centered grotesque with a dedicated high-precision monospace for financial figures:

| Role | Font Family | Usage |
| :--- | :--- | :--- |
| **Headings & Body UI** | `IBM Plex Sans`, -apple-system, sans-serif | Page titles, navigation labels, tenant names, body text. |
| **Tabular Numbers & Data**| `JetBrains Mono`, monospace | Kwacha currency figures, receipt numbers, clock displays, NRC IDs. |

### Typography Scale
- **Display Overview (`text-3xl font-bold font-data-mono`):** `30px / 36px` — Primary KPI cards (`K12,700`, `90%`).
- **Section Headline (`text-2xl font-bold tracking-tight`):** `24px / 32px` — Property headers, page titles.
- **Card Title (`text-base font-bold text-on-surface`):** `16px / 24px` — Bento module headers (`Active Tenant Roster`).
- **Data Subtext (`text-xs sm:text-sm text-on-surface-variant`):** `12px / 16px` — Descriptive secondary copy.
- **Metric Overline (`text-xs font-bold uppercase tracking-wider`):** `12px / 16px` — Card category chips (`TOTAL REVENUE`).

---

## 4. Bento Component Geometry & Surface Rules

### 4.1 Standard Bento Card (`.card-bento`)
- **Border Radius:** `1rem` (16px) continuous curves.
- **Surface:** `#FFFFFF` background with `1px solid #E2E7E2`.
- **Shadow:** `0 2px 10px rgba(12, 26, 18, 0.03)` (subtle tactile elevation).
- **Hover State:** Border transitions to `#D1D9D2` with shadow `0 6px 18px rgba(12, 26, 18, 0.06)`.

### 4.2 Inverted Hero Card (`.card-bento-hero`)
- **Surface:** Deep hero green (`#0B2416`) with a 1px border `rgba(255, 255, 255, 0.12)`.
- **Contrast:** High-contrast white typography with `#34A864` electric accents and glowing status indicators.

### 4.3 Capsule Buttons & Badges
- **Primary Pill (`.btn-pill-primary`):** Full capsule radius (`9999px`), `#144D2F` background, white text, 600 semi-bold weight.
- **Outline Pill (`.btn-pill-outline`):** Full capsule radius, white surface, `#E2E7E2` border, dark text.
- **Status Pill (`.badge-pill`):** Compact capsule with `0.25rem 0.625rem` padding, pairing container tints with high-contrast foreground text.

### 4.4 Tactile Architectural Textures
- **Diagonal Architectural Hatch (`.bg-hatch-diagonal`):** Repeating 45-degree semi-transparent hatch pattern used for upcoming terms and reserved bed spaces.
- **Topographic Wave Lines (`.bg-topo-dark`):** Subtle radial contour rings integrated into the Lenco terminal card background.

---

## 5. Motion, Physics & Micro-Animations

### 5.1 Bento Cascade Entrance (`.animate-bento-in`)
- **Keyframe:** `@keyframes bentoFadeUp`
- **Translation:** `translateY(16px)` with scale transition from `0.985` to `1.0`.
- **Timing Function:** Executive cubic deceleration `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Stagger Delays:** Cascading delays (`.animate-delay-1` to `.animate-delay-7` in 60ms intervals) so cards slide smoothly into place on landing.

### 5.2 Animated Number Engine (`<AnimatedNumber>`)
- **Framerate:** 60fps / 120fps hardware-synchronized via `requestAnimationFrame`.
- **Deceleration:** Ease-out cubic curve:
  $$f(t) = 1 - (1 - t)^3$$
- **Layout Shift Prevention:** Employs CSS `tabular-nums` so numbers expand without jittering adjacent elements.
- **Lifecycle Safety:** Instant cancellation via `cancelAnimationFrame` in `onUnmounted` lifecycle hooks.

### 5.3 Radial Gauge Sweep (`.gauge-progress-arc`)
- Smooth `stroke-dashoffset` transitions over `1.4s` using `cubic-bezier(0.16, 1, 0.3, 1)` for academic term progress visualization.