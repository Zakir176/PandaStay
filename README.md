# 🐼 PandaStays — Zambian Student Housing & Boarding SaaS Platform

<div align="center">

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](file:///d:/code/GitHub/Personal/PandaStay/pandastays-web)
[![Security Review](https://img.shields.io/badge/security%20audit-Round%204%20Hardened-emerald?style=flat-square)](file:///d:/code/GitHub/Personal/PandaStay/Docs/ARCHITECTURE.md)
[![Vue 3](https://img.shields.io/badge/frontend-Vue%203%20%2B%20Vite%208-4FC08D?style=flat-square&logo=vuedotjs)](file:///d:/code/GitHub/Personal/PandaStay/pandastays-web)
[![Tailwind CSS](https://img.shields.io/badge/styling-Tailwind%20v4%20Bento-38B2AC?style=flat-square&logo=tailwind-css)](file:///d:/code/GitHub/Personal/PandaStay/Design.md)
[![Supabase](https://img.shields.io/badge/database-Supabase%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](file:///d:/code/GitHub/Personal/PandaStay/pandastays-web/supabase)
[![Payment Rails](https://img.shields.io/badge/payments-Lenco%20Mobile%20Money-0A6640?style=flat-square)](file:///d:/code/GitHub/Personal/PandaStay/Docs/API.md)
[![License](https://img.shields.io/badge/license-Proprietary-blue?style=flat-square)](file:///d:/code/GitHub/Personal/PandaStay/README.md)

**Next-generation PropTech engineered specifically for Zambian student boarding houses, private hostels, and property landlords.**  
*Automates MTN MoMo, Airtel Money, and Zamtel Kwacha rent collection, visual bed-level occupancy, and tenant management with sub-account settlement.*

[System Overview](#-system-architecture--dual-portal-design) • [Key Features](#-key-features) • [Directory Map](#-repository-structure--directory-map) • [Quick Start](#-quick-start--local-development) • [API & Webhooks](Docs/API.md) • [Architecture Spec](Docs/ARCHITECTURE.md) • [Design System](Design.md)

</div>

---

## 🏛️ System Architecture & Dual Portal Design

PandaStays enforces strict architectural role separation, multi-tenant isolation, and database-level security between **Property Landlords** and **Student Residents**:

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
         ├── /app (Dashboard & Bento KPIs)                 ├── /tenant/portal (Bed Silhouette & Room)
         ├── /app/rooms (Floorplans & Bed CRUD)            ├── /tenant/payments (Receipts & History)
         ├── /app/financials (Ledger & MoMo)               ├── /tenant/maintenance (Ticket Tracker)
         ├── /app/tenants (Roster & NRC Records)           ├── /tenant/lease (Digital Contract & Rules)
         └── /app/maintenance, /app/leases, etc.          └── /tenant/checkout (MoMo STK Push)
```

```
                                  ┌───────────────────────────────┐
                                  │ Public Receipt Route (/verify)│
                                  │   [PublicVerification.vue]    │
                                  └───────────────┬───────────────┘
                                                  ▼
                                      Zero-Auth QR Verification
                                      Unguessable UUID v4 Token
```

### 🔒 Enterprise Security & Multi-Tenancy Boundary
- **Row-Level Security (RLS):** Every database table is protected by PostgreSQL Row-Level Security policies tied to `auth.uid()`. Landlords can only query properties and tenancies they own; students can only view their own records.
- **Fail-Closed API Gateway:** Privileged Express backend (`server/`) validates incoming bearer tokens and aborts startup immediately if critical security credentials (`LENCO_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are missing.
- **Column-Level Revocation:** Direct client updates to sensitive columns (`landlords.lenco_subaccount_id`) are revoked at the PostgreSQL engine level.
- **HMAC-SHA512 Webhook Verification:** Incoming Lenco payment notifications are verified in constant time (`timingSafeEqual`) against raw request buffers, followed by an authoritative status re-query.
- **Unguessable Receipt Tokens:** Public receipt verification URLs use cryptographically random UUID v4 tokens (`/verify/d4e5f6a7-...`) rather than predictable primary keys, eliminating scraping risks.

---

## ✨ Key Features

### 🏢 Landlord Operations Portal (`/app`)
- **Interactive Architectural Bed-Grid Floorplan (`<BedGrid>`):** Top-down bed silhouette visualizer with real-time occupancy and payment statuses (Occupied, Partial, Overdue, Reserved, Vacant).
- **Tactile Bento KPI Dashboard:** Inverted dark hero cards (`#0B2416`), live 60fps/120fps animated count-up numbers (`<AnimatedNumber>`), and dynamic user area/timezone detection.
- **Audited Financial Ledger:** Real-time revenue tracking, manual cash collection logger, and automated receipt issuance.
- **Overdue Rent Chaser & WhatsApp Escalation:** Rules-based WhatsApp reminder dispatch compiling personalized payment links directly to student phone numbers.
- **Prioritized Maintenance Triage:** Maintenance ticket queue with category filters and manual priority ranking.
- **Customizable Theming:** 6 curated Zambian color palettes (Forest Emerald, Savanna Ochre, Midnight Slate, Kafue Teal, Copper Sunset, Jacaranda Indigo).

### 🎓 Student Resident Portal (`/tenant`)
- **My Bed & Room Overview:** View assigned room number, bed space label, room capacity, and active house rules.
- **Mobile Money STK Push Checkout (`/tenant/checkout`):** Native checkout supporting MTN MoMo, Airtel Money, and Zamtel Kwacha directly dispatched to the student's handset.
- **Cryptographic Digital Receipt Voucher (`<ReceiptVoucher>`):** Official downloadable payment voucher with anti-tamper security patterns and scannable QR verification code.
- **Maintenance Ticket Submission:** Submit repair requests with photo attachments and track progress from open to resolved.
- **Digital Lease & Agreement:** Direct access to lease dates, monthly rental rate, and boarding house policies.

---

## 📁 Repository Structure & Directory Map

```
PandaStay/
├── Docs/                            # Formal System Documentation (IEEE-830 / C4 Specs)
│   ├── SRS.md                       # Software Requirements Specification (v1.0.0)
│   ├── API.md                       # REST API & Lenco Webhook Ingestion Reference
│   ├── ARCHITECTURE.md              # System Architecture, RLS Matrix & Security Audits
│   └── pandastays-full-rebuild-brief.md # Original Rebuild Brief & Scope
├── Design.md                        # Tactile Bento Grid Design System & Tokens
├── pandastays-web/                  # Primary Application Package
│   ├── public/                      # Static web assets & icons
│   ├── scripts/                     # Automated diagnostic & verification suites
│   │   ├── test-supabase.js         # Supabase connection & schema test
│   │   ├── test-rls.js              # Row-Level Security policy validation test
│   │   └── test-payments.js         # Lenco payment rail integration test
│   ├── server/                      # Express 5 Backend API Gateway (Port 3001)
│   │   ├── config/                  # Supabase service-role client & environment validation
│   │   │   └── supabase.js
│   │   ├── middleware/              # Authentication & security middlewares
│   │   │   └── auth.js              # requireAuth, requireLandlord, and rate limiters
│   │   ├── routes/                  # Express route controllers
│   │   │   ├── payments.js          # /api/momo/push, /api/momo/status, /api/receipts
│   │   │   ├── tenants.js           # /api/tenants/link auto-link profile endpoint
│   │   │   └── webhooks.js          # /api/webhooks/lenco HMAC-SHA512 listener
│   │   ├── services/                # External gateway adapters
│   │   │   └── lenco.js             # Lenco API client with sub-account routing
│   │   └── index.js                 # Server entry point & global error middleware
│   ├── src/                         # Vue 3 Frontend Single Page Application
│   │   ├── components/              # Reusable UI components & modals
│   │   │   ├── AnimatedNumber.vue   # 60fps/120fps ease-out cubic count-up component
│   │   │   ├── BedGrid.vue          # Architectural Bento bed floorplan grid
│   │   │   ├── BedIcon.vue          # Top-down silhouette bed visualizer
│   │   │   ├── AuthModal.vue        # Dual-role Supabase auth modal
│   │   │   ├── ReceiptVoucher.vue   # Official printable voucher with QR code
│   │   │   ├── ReceiptVoucherModal.vue # Modal container for receipt vouchers
│   │   │   ├── RecordPaymentModal.vue  # Manual payment logging modal
│   │   │   ├── AddRoomModal.vue     # Room provisioning modal
│   │   │   ├── EditRoomModal.vue    # Room editor modal
│   │   │   ├── AssignTenantModal.vue# Student bed allocation modal
│   │   │   ├── LogMaintenanceModal.vue # Maintenance ticket modal
│   │   │   └── index.js             # Component library barrel export
│   │   ├── constants/               # Domain enumerations (Roles, Statuses, Methods)
│   │   ├── layouts/                 # Root portal shells
│   │   │   ├── AppLayout.vue        # Landlord layout with collapsible Bento rail
│   │   │   └── TenantLayout.vue     # Student layout with top navigation tabs
│   │   ├── lib/                     # Global reactive stores & clients
│   │   │   ├── auth.js              # Supabase session, role verification, and profile loader
│   │   │   ├── store.js             # Reactive domain state, live KPIs, and Supabase sync
│   │   │   ├── supabaseClient.js    # Browser Supabase client
│   │   │   ├── theme.js             # HSL theme switcher & palette store
│   │   │   └── receiptPrinter.js    # PDF & printable receipt utilities
│   │   ├── router/                  # Vue Router configuration & role navigation guards
│   │   │   └── index.js
│   │   ├── services/                # Pure frontend data access services
│   │   │   ├── propertyService.js   # Properties, rooms, and bed-spaces
│   │   │   ├── tenantService.js     # Tenants, tenancies, and dossiers
│   │   │   ├── paymentService.js    # Payments and MoMo push triggers
│   │   │   ├── reportService.js     # Maintenance tickets and priority updates
│   │   │   └── index.js             # Services barrel export
│   │   ├── utils/                   # Formatting utilities (ZMW Currency, NRC, Phone, Dates)
│   │   ├── views/                   # Full-page route views
│   │   │   ├── LandingPage.vue      # Public landing page with dual portal access
│   │   │   ├── Dashboard.vue        # Landlord KPI command center
│   │   │   ├── Rooms.vue            # Room inventory & bed management
│   │   │   ├── Financials.vue       # Financial ledger & receipt registry
│   │   │   ├── Maintenance.vue      # Maintenance queue & triage
│   │   │   ├── Leases.vue           # Academic semester lease transitions
│   │   │   ├── Deposits.vue         # Refundable security deposit escrow
│   │   │   ├── Tenants.vue          # Student resident directory
│   │   │   ├── TenantProfile.vue    # Student identity dossier & payment ledger
│   │   │   ├── Settings.vue         # Landlord settings & gateway preferences
│   │   │   ├── TenantPortal.vue     # Student resident bed & room overview
│   │   │   ├── TenantPayments.vue   # Personal payment history & receipts
│   │   │   ├── TenantMaintenance.vue# Student maintenance ticket tracker
│   │   │   ├── TenantLease.vue      # Digital tenancy agreement & house rules
│   │   │   ├── TenantCheckout.vue   # Mobile money checkout gateway
│   │   │   ├── PublicVerification.vue # Zero-auth receipt verification page
│   │   │   └── index.js             # Views barrel export
│   │   ├── App.vue                  # Root application component
│   │   ├── main.js                  # Application bootstrapper
│   │   └── style.css                # Bento design tokens & Tailwind v4 styling
│   ├── supabase/                    # Database definitions & migrations
│   │   ├── migrations/              # Incremental SQL migration scripts
│   │   ├── schema.sql               # Authoritative PostgreSQL schema & RLS policies
│   │   └── seed.sql                 # Seed fixtures for Mukuba House demo data
│   ├── package.json                 # Dependency manifests & NPM scripts
│   └── vite.config.js               # Vite bundler configuration
└── README.md                        # Master repository documentation
```

---

## ⚡ Tech Stack Summary

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Vue.js (Composition API)** | `v3.5.13` | Reactive components, composables, `<script setup>` |
| **Build Tooling** | **Vite** | `v8.2.0` | High-speed ESM development & Rollup production bundling |
| **Routing** | **Vue Router** | `v4.5.0` | Dual-portal routing & role-based navigation guards |
| **Styling & Tokens** | **Tailwind CSS v4 + Custom CSS**| `v4.0.0` | Tactile Bento grid, capsule geometry, dynamic HSL theming |
| **Backend Gateway** | **Node.js + Express** | `v5.0.1` | Port `3001` service-role API gateway (bypasses RLS safely) |
| **Database & Auth** | **Supabase (PostgreSQL 15)** | Cloud | Row-Level Security, JWT Auth, Relational Schema |
| **Payment Rail** | **Lenco API v2** | `v2` | MTN, Airtel, and Zamtel MoMo STK Push & Webhooks |
| **Cryptographic QR** | **qrcode** | `v1.5.4` | Offline-verifiable digital receipt QR codes |

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- **Node.js** >= `18.0.0 LTS` (Recommended: Node 20 LTS)
- **npm** >= `9.0.0`
- Active **Supabase** project instance (or local Supabase CLI)

### 2. Environment Configuration
Navigate to `pandastays-web/` and configure your `.env` file:

```bash
cd pandastays-web
cp .env.example .env
```

Configure your environment variables:
```ini
# Supabase Configuration (Client & Backend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Lenco Mobile Money Payment Gateway
LENCO_SECRET_KEY=your-lenco-api-secret-key
LENCO_BASE_URL=https://api.lenco.co/access/v2

# Express Backend Service
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 3. Database Migration & Seed Data
Execute the schema and seed scripts in your Supabase SQL Editor:
1. Run [`pandastays-web/supabase/schema.sql`](pandastays-web/supabase/schema.sql) (Initializes tables, RLS policies, and functions).
2. Run [`pandastays-web/supabase/seed.sql`](pandastays-web/supabase/seed.sql) (Loads demo data for *Mukuba House*).

### 4. Install Dependencies
```bash
cd pandastays-web
npm install
```

### 5. Start Development Servers
Open two terminal windows:

**Terminal 1 — Vite Frontend Web Server (Port 5173):**
```bash
npm run dev
```

**Terminal 2 — Express Backend Gateway (Port 3001):**
```bash
npm run server
```

Access the application in your browser at `http://localhost:5173`.

---

## 🧪 Verification & Testing Scripts

| Command | Purpose | Verification Details |
| :--- | :--- | :--- |
| `npm run build` | Asset compilation | Builds production bundles in `dist/` with zero compiler errors. |
| `npm run test:supabase` | Database connectivity | Validates connection to Supabase and asserts table existence. |
| `npm run test:rls` | Security audit | Simulates landlord vs tenant queries to verify RLS policy isolation. |
| `npm run test:payments` | Gateway test | Verifies Lenco Mobile Money credentials and STK push endpoints. |

---

## 📚 Complete Documentation Index

- 📄 [**Software Requirements Specification (SRS)**](Docs/SRS.md): Comprehensive functional and non-functional requirements adhering to IEEE-830 standards.
- 🔌 [**API & Webhook Documentation**](Docs/API.md): Complete REST endpoint specifications, request/response models, and HMAC-SHA512 webhook integration guide.
- 🏗️ [**Architecture & Security Specification**](Docs/ARCHITECTURE.md): C4 system models, database entity relationships, Row-Level Security policy matrix, and security audit history.
- 🎨 [**Tactile Bento Design System**](Design.md): Design tokens, color schemes, typography scale, component geometry, and micro-animation physics.

---

## 📄 License
Private & Proprietary — Developed for PandaStays Housing Solutions. All rights reserved.
