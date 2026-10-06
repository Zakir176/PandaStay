# 🐼 PandaStays — Student Housing & Boarding Management Platform

> **Modern PropTech engineered for Zambian student boarding houses, private hostels, and property landlords.**  
> Built with Vue 3, Vite, Tailwind CSS, Express, and Supabase. Powered by Mobile Money (MTN MoMo, Airtel Money, Zamtel Kwacha) through Lenco payment rails.

---

## 🏛️ System Architecture & Dual Portal Design

PandaStays enforces strict architectural role separation and data integrity between **Property Landlords** and **Student Residents**:

```
                                      ┌────────────────────────┐
                                      │   Public Landing (/)   │
                                      └───────────┬────────────┘
                                                  │
                         ┌────────────────────────┴────────────────────────┐
                         ▼                                                 ▼
        ┌───────────────────────────────────┐             ┌──────────────────────────────────┐
        │  Landlord Operations Portal (/app)│             │  Student Resident Portal (/tenant│
        │      [Layout: AppLayout.vue]      │             │     [Layout: TenantLayout.vue]   │
        └─────────────────┬─────────────────┘             └────────────────┬─────────────────┘
                          │                                                │
         ├── /app (Dashboard & KPI Bento)                  ├── /tenant/portal (Bed Silhouette & Room)
         ├── /app/rooms (Floorplans & Bed CRUD)            ├── /tenant/payments (Receipts & History)
         ├── /app/financials (Ledger & MoMo)               ├── /tenant/maintenance (Ticket Tracker)
         ├── /app/tenants (Roster & NRC Records)           ├── /tenant/lease (Digital Contract & Escrow)
         └── /app/maintenance, /app/leases, etc.          └── /tenant/checkout (MoMo Push Payment)
```

### 🔒 Data Integrity & Security Boundary
- **Role Isolation**: Route navigation guards (`router.beforeEach`) intercept and prevent tenants from accessing `/app/*` administrative routes.
- **Tenant Scope**: Students can only view their own allocated bed-space silhouette, their verified receipts, their submitted tickets, and their tenancy agreement. Aggregated landlord revenues, bank account details, and other students' NRC IDs are strictly protected.
- **Deduplication Safeguards**: Database ingestion and synchronization logic automatically prevents orphan or duplicate tenant profiles.

---

## 📁 Repository Structure & Directory Map

```
PandaStay/
├── pandastays-web/                  # Primary Web Application & Backend Service
│   ├── public/                      # Static assets & favicon
│   ├── scripts/                     # Integration test suites & CLI diagnostics
│   │   ├── test-supabase.js         # Supabase connection & table health check
│   │   ├── test-rls.js              # Row-Level Security policy validation
│   │   └── test-payments.js         # Lenco payment rail integration test
│   ├── server/                      # Dedicated Express Backend API Gateway (Port 3001)
│   │   ├── config/                  # Server configuration & Supabase service client
│   │   │   └── supabase.js
│   │   ├── middleware/              # Authentication & role validation middlewares
│   │   │   └── auth.js              # requireLandlord Bearer token validator
│   │   ├── routes/                  # Express domain route controllers
│   │   │   ├── payments.js          # /api/payments (MoMo push & verified manual records)
│   │   │   ├── tenants.js           # /api/tenants (Auth profile linking)
│   │   │   └── webhooks.js          # /api/webhooks (Lenco HMAC webhook listener)
│   │   ├── services/                # External integration adapters
│   │   │   └── lenco.js             # Lenco API client & HMAC-SHA512 verification
│   │   └── index.js                 # Server entry point & global error middleware
│   ├── src/                         # Vue 3 Frontend Single Page Application
│   │   ├── components/              # Reusable UI Components & Modals
│   │   │   ├── AddRoomModal.vue     # Room & bed-space provisioning modal
│   │   │   ├── EditRoomModal.vue    # Room credentials & capacity editor
│   │   │   ├── AssignTenantModal.vue# Tenant onboarding & bed reservation modal
│   │   │   ├── AuthModal.vue        # Dual-role Supabase auth modal
│   │   │   ├── BedGrid.vue          # Architectural Bento bed-space floorplan grid
│   │   │   ├── BedIcon.vue          # Top-down silhouette bed visualizer
│   │   │   ├── RecordPaymentModal.vue # Landlord manual collection logger
│   │   │   ├── ReceiptVoucherModal.vue# Printable digital receipt voucher
│   │   │   ├── LogMaintenanceModal.vue# Repair ticket logger
│   │   │   └── index.js             # Component library barrel export
│   │   ├── constants/               # Standardized enumerations & domain constants
│   │   │   └── index.js             # Roles, Bed statuses, Payment methods, Categories
│   │   ├── layouts/                 # Root application layouts
│   │   │   ├── AppLayout.vue        # Collapsible Bento sidebar shell for landlords
│   │   │   └── TenantLayout.vue     # Top-tabbed resident portal shell for students
│   │   ├── lib/                     # Global state, auth, and styling stores
│   │   │   ├── auth.js              # Supabase session, role management, and demo switcher
│   │   │   ├── store.js             # Reactive state coordinator & live metrics computeds
│   │   │   ├── supabaseClient.js    # Browser Supabase client
│   │   │   └── theme.js             # Dynamic color scheme & design tokens
│   │   ├── router/                  # Vue Router navigation & role guards
│   │   │   └── index.js
│   │   ├── services/                # Frontend API and data access services
│   │   │   ├── propertyService.js   # Property, room, and bed space data access
│   │   │   ├── tenantService.js     # Tenant, tenancy, and reservation data access
│   │   │   ├── paymentService.js    # Payment records & MoMo trigger integration
│   │   │   ├── reportService.js     # Maintenance ticket filing & ranking
│   │   │   └── index.js             # Services barrel export
│   │   ├── utils/                   # Shared formatting & helper utilities
│   │   │   └── formatters.js        # Kwacha currency, dates, NRC, phone, initials
│   │   ├── views/                   # Full-page route views
│   │   │   ├── LandingPage.vue      # Public marketing landing with dual portal launch
│   │   │   ├── Dashboard.vue        # Landlord KPI command center
│   │   │   ├── Rooms.vue            # Room inventory & bed cluster CRUD
│   │   │   ├── Financials.vue       # Financial ledger & revenue analytics
│   │   │   ├── Maintenance.vue      # Prioritized maintenance ticket queue
│   │   │   ├── Leases.vue           # Academic semester lease transitions
│   │   │   ├── Deposits.vue         # Refundable security deposit escrow
│   │   │   ├── Tenants.vue          # Active student resident directory
│   │   │   ├── TenantProfile.vue    # Detailed individual student dossier
│   │   │   ├── Settings.vue         # Landlord profile & gateway preferences
│   │   │   ├── TenantPortal.vue     # Student resident bed & room overview
│   │   │   ├── TenantPayments.vue   # Personal payment receipts & transactions
│   │   │   ├── TenantMaintenance.vue# Student ticket submission & tracker
│   │   │   ├── TenantLease.vue      # Digital tenancy agreement & house rules
│   │   │   ├── TenantCheckout.vue   # Mobile money checkout gateway
│   │   │   └── index.js             # Views barrel export
│   │   ├── App.vue                  # Root Vue component
│   │   ├── main.js                  # Application bootstrapper
│   │   └── style.css                # Bento design system & Tailwind v4 token theme
│   ├── supabase/                    # Database definitions & seeds
│   │   ├── schema.sql               # PostgreSQL DDL schema & Row-Level Security policies
│   │   └── seed.sql                 # Seed fixtures for Mukuba House & demo data
│   ├── package.json                 # Dependency manifests & NPM scripts
│   └── vite.config.js               # Vite bundler configuration
└── Docs/                            # Product requirements & design references
```

---

## ⚡ Tech Stack

| Domain | Technology | Notes |
| :--- | :--- | :--- |
| **Frontend Framework** | **Vue 3 (Composition API)** | `<script setup>`, reactive composables, custom SVG visualizers |
| **Build & Tooling** | **Vite 8** | High-speed ESM dev server & optimized Rollup bundles |
| **Styling & Design** | **Tailwind CSS v4 + Vanilla CSS** | Tactile Bento grid, capsule pills, diagonal hatches, dynamic HSL themes |
| **Backend API Gateway** | **Node.js + Express 5** | Port `3001` service-role API gateway (bypasses RLS safely) |
| **Database & Auth** | **Supabase (PostgreSQL 15)** | Real-time DB, Row-Level Security, Auth session management |
| **Payments** | **Lenco API v2** | MTN MoMo, Airtel Money, Zamtel Kwacha STK Push & Webhook Verification |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- Supabase project or local Supabase CLI

### 2. Environment Configuration
Navigate to `pandastays-web/` and copy the example environment file:
```bash
cd pandastays-web
cp .env.example .env
```

Configure your environment variables:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
LENCO_SECRET_KEY=your-lenco-api-secret
PORT=3001
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Servers
In two separate terminals:

**Terminal 1 — Frontend Web Application (Port 5173):**
```bash
npm run dev
```

**Terminal 2 — Backend Payment Service (Port 3001):**
```bash
npm run server
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite development server at `http://localhost:5173` |
| `npm run server` | Starts Express backend payment gateway at `http://localhost:3001` |
| `npm run build` | Compiles production assets into `dist/` |
| `npm run preview` | Previews the compiled production bundle locally |
| `npm run test:supabase` | Validates live Supabase connectivity and table schema health |
| `npm run test:rls` | Tests Row-Level Security access controls and authentication |
| `npm run test:payments` | Runs integration tests against Lenco Mobile Money payment endpoints |

---

## 📄 License
Private & Proprietary — Developed for PandaStays Housing Solutions.
