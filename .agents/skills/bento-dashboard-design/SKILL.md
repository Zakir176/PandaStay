---
name: bento-dashboard-design
description: >-
  Applies the modern tactile Bento grid design system to web dashboards, SaaS apps, and admin portals.
  Use when designing, scaffolding, or refactoring application interfaces with asymmetrical bento cards,
  dark inverted hero cards, capsule pill buttons, architectural diagonal hatch patterns,
  collapsible rail navigation, and dynamic multi-industry color themes.
---

# Bento Grid Dashboard Design System

This skill provides a standardized architectural blueprint for building high-end, tactile **Bento Grid** dashboards and management portals.

The design philosophy creates an asymmetrical, physical feel inspired by architectural blueprints and modern productivity suites: high card-contrast, one dominant inverted hero card, capsule stadium pills, 45° diagonal hatch patterns for pending/empty states, and a collapsible rail navigation shell.

---

## 1. Domain Color Theme Generator

Adapt the 5 core palette roles based on your project's domain. Never use generic browser primaries; use deep, saturated anchors paired with soft canvas neutrals and electric micro-accents.

### Preset Palettes by Industry

| Role / Industry | Canvas (`--bg-canvas`) | Hero Anchor (`--hero-dark`) | Primary Brand (`--color-primary`) | Accent Highlight (`--color-accent`) | Card Surface |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Eco / Real Estate / Housing** | `#F2F4F3` | `#0C2B18` (Pine) | `#184E2D` (Forest) | `#3EBA6F` (Mint) | `#FFFFFF` |
| **Fintech / Banking / Payments** | `#F4F6F9` | `#0B192C` (Midnight Navy) | `#1E3E62` (Deep Sapphire) | `#00D26A` (Emerald / Lime) | `#FFFFFF` |
| **Healthcare / Bio / MedTech** | `#F0FDF4` | `#064E3B` (Teal Dark) | `#0D9488` (Teal 600) | `#14B8A6` (Cyan Mint) | `#FFFFFF` |
| **SaaS / Cloud / DevTools** | `#F8FAFC` | `#0F172A` (Slate 900) | `#3B82F6` (Electric Blue) | `#60A5FA` (Sky Blue) | `#FFFFFF` |
| **Crypto / Web3 / High-Tech** | `#0D0E12` | `#161922` (Onyx) | `#6366F1` (Indigo) | `#22C55E` (Cyber Mint) | `#161922` |
| **Creative / Studio / Media** | `#FAF5FF` | `#1E102F` (Deep Plum) | `#7E22CE` (Violet) | `#F43F5E` (Coral Rose) | `#FFFFFF` |
| **Logistics / Heavy Operations** | `#F5F5F4` | `#1C1917` (Charcoal) | `#C2410C` (Warm Amber) | `#EAB308` (Industrial Gold) | `#FFFFFF` |

### Custom Palette Formula
1. **Canvas**: High-light neutral (96–97% lightness) with 1–2% tint of brand tone.
2. **Hero Anchor**: Deep, 8–12% lightness tint of the brand color. Used for the inverted KPI card and docked status widgets.
3. **Primary**: Balanced 30–45% lightness brand tone for active tabs, primary buttons, and key typography.
4. **Accent**: High-energy saturated accent for pulsing live dots, badges, and progress rings.
5. **Card Surface**: Pure `#FFFFFF` (light mode) or `#161922` with subtle borders (`rgba(0,0,0,0.06)` or `border-outline-variant`).

---

## 2. Core CSS Utility Tokens (Tailwind v4 / CSS)

Include these foundational utilities in your project's main stylesheet (e.g., `src/style.css`):

```css
/* Bento Card Surfaces */
.card-bento {
  background-color: var(--color-surface, #ffffff);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-bento:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
}

/* Inverted Hero Card */
.card-bento-hero {
  background-color: var(--hero-dark, #0C2B18);
  color: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

/* Stadium / Capsule Buttons & Badges */
.btn-pill-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.125rem;
  border-radius: 9999px;
  background-color: var(--color-primary, #184E2D);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.btn-pill-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-0.5px);
}

.btn-pill-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.125rem;
  border-radius: 9999px;
  background-color: transparent;
  border: 1px solid rgba(0, 0, 0, 0.15);
  color: var(--color-on-surface, #1e293b);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.btn-pill-outline:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
}

/* 45° Architectural Hatch Pattern (Pending / Reserved / Draft Units) */
.bg-hatch-diagonal {
  background-color: rgba(0, 0, 0, 0.02);
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(0, 0, 0, 0.07),
    rgba(0, 0, 0, 0.07) 1.5px,
    transparent 1.5px,
    transparent 6px
  );
}

/* Topographic Contour Line Texture */
.bg-topo-dark {
  background-image: 
    radial-gradient(ellipse 80% 60% at 50% -20%, rgba(255, 255, 255, 0.12), transparent),
    radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.06), transparent);
}
```

---

## 3. Asymmetrical 3-Tier Bento Dashboard Layout

Structure the dashboard using an asymmetrical grid hierarchy that keeps visual focus grounded:

```text
+-----------------------------------------------------------------------------------+
| TIER 1: KPI ROW (4 Columns)                                                       |
| [ Hero Card: Main Metric ↗ ]  [ Metric 2: Rate ]  [ Metric 3: Alert ] [ Metric 4] |
+-----------------------------------------------------------------------------------+
| TIER 2: PRIMARY ACTION & VISUALIZATION (Grid: 2 : 1 : 1)                          |
| [                                    ]  [                      ]  [               ]
| [ Centerpiece Domain Artifact        ]  [ Spotlight Chaser     ]  [ Live Stream   ]
| [ (Floorplan / Matrix / Chart)       ]  [ (1-Click Action CTA) ]  [ (MoMo / Feed) ]
| [                                    ]  [                      ]  [               ]
+-----------------------------------------------------------------------------------+
| TIER 3: SECONDARY ROSTER & UTILITIES (Grid: 2 : 1 : 1)                            |
| [                                    ]  [                      ]  [               ]
| [ Primary Table / Entity Roster      ]  [ Radial Progress      ]  [ Live Terminal ]
| [ (Search, Capsule Badges, Actions)  ]  [ (Gauge / Quota Ring) ]  [ (Status/Clock)]
| [                                    ]  [                      ]  [               ]
+-----------------------------------------------------------------------------------+
```

### Tier Specifications:
1. **Tier 1 (Metric Row - 4 Cols)**:
   - Card 1: **Inverted Hero Card** with total revenue or primary KPI, white typography, and `↗` quick link.
   - Cards 2–4: Clean white Bento cards with stadium trend badges (`+12.4%`).
2. **Tier 2 (2 : 1 : 1)**:
   - **Col Span 2 (Centerpiece)**: The physical or core domain interactive widget (e.g. Bed-Space Floorplan, Node Topology, Visual Kanban, or Interactive Matrix).
   - **Col Span 1 (Spotlight Chaser)**: Most urgent pending operational item with direct 1-click CTA (e.g., WhatsApp rent nudge, Approval button).
   - **Col Span 1 (Live Activity Stream)**: Chronological micro-feed with timestamped transaction/event capsules.
3. **Tier 3 (2 : 1 : 1)**:
   - **Col Span 2 (Entity Roster Table)**: Tabular overview with rounded avatar capsules, status badge pills, and direct detail links.
   - **Col Span 1 (Progress Gauge)**: SVG semi-circle gauge or circular progress ring displaying quarterly progress, semester term, or storage capacity.
   - **Col Span 1 (Terminal / Gateway Widget)**: System uptime, payment gateway status with pulsing live indicator, and digital clock.

---

## 4. Collapsible Rail Navigation Shell

Always wrap the dashboard in a collapsible sidebar rail to maximize screen space for complex bento cards:

- **Desktop Expanded**: `w-[250px]` (shows brand logo, title, section headers, icon + text labels, docked bottom widget).
- **Desktop Collapsed**: `w-[72px]` (icon-only rail with floating hover tooltips).
- **Main Wrapper**: Smoothly toggles between `md:ml-[250px] md:w-[calc(100%-250px)]` and `md:ml-[72px] md:w-[calc(100%-72px)]` with `transition-all duration-300 ease-in-out`.
- **Keyboard Shortcut**: Implement `Ctrl+B` / `Cmd+B` listener to toggle collapse state, persisting preference in `localStorage`.
- **Top Bar**: Clean stadium search capsule (`⌘K`) + quick action pill button + user profile avatar capsule.

---

## 5. Kickoff Prompt Template (Copy-Pasteable for New Projects)

When starting a new project or redesigning an existing app, provide this prompt:

```text
Please build the UI for [PROJECT_NAME] using the Bento Grid Dashboard Design System.

Requirements:
1. DOMAIN & THEME:
   - Industry: [Fintech / Healthcare / Real Estate / SaaS / Logistics / Crypto]
   - Canvas: [e.g. #F4F6F9 neutral]
   - Inverted Hero Accent: [e.g. Deep Navy #0B192C / Pine #0C2B18 / Plum #1E102F]
   - Primary Brand Color: [e.g. #1E3E62 / #184E2D / #7E22CE]
   - Electric Accent: [e.g. Mint #3EBA6F / Emerald #00D26A / Cyan #38BDF8]

2. BENTO CARDS & TOKENS:
   - 16px radius cards (.card-bento) with subtle 1px border and soft diffuse shadow.
   - Inverted Hero Card (.card-bento-hero) for the top primary metric with subtle topographic lines.
   - Capsule stadium pills (.btn-pill-primary, .btn-pill-outline, .badge-pill).
   - 45° diagonal hatch pattern (.bg-hatch-diagonal) for pending, draft, or reserved states.

3. LAYOUT STRUCTURE:
   - Collapsible Sidebar Rail (250px expanded <-> 72px collapsed with tooltips and Ctrl+B shortcut).
   - Top Header with stadium search bar (⌘K), primary action pill, and profile capsule.
   - Tier 1: 4 KPI row with inverted Hero card.
   - Tier 2 (2:1:1): Domain Centerpiece widget (col-span-2) + Priority Spotlight (col-span-1) + Live Stream (col-span-1).
   - Tier 3 (2:1:1): Main Roster Table (col-span-2) + Circular Progress Gauge (col-span-1) + System Terminal Widget (col-span-1).
```
