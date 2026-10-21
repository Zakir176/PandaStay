# Software Requirements Specification (SRS)
## PandaStays: Zambian Student Boarding & Bed-Space Management SaaS

**Document Version:** 1.0.0 (Production Release)  
**Standard:** IEEE 830 / ISO/IEC/IEEE 29148 Compliant  
**Status:** Approved  
**Target Region:** Republic of Zambia (Lusaka, Copperbelt, and University Municipalities)  
**Security Classification:** Confidential / Proprietary  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the complete functional, interface, performance, and security requirements for **PandaStays**, a multi-landlord, cloud-native Software-as-a-Service (SaaS) platform engineered specifically for the Zambian student private housing market.

### 1.2 Problem Statement & Industry Context
Zambian tertiary institutions (e.g., University of Zambia, Copperbelt University, Evelyn Hone College) experience severe on-campus student accommodation shortages, housing less than 20% of enrolled students. Private landlords convert residential properties into high-density boarding houses. Unlike standard residential tenancies where entire apartments or houses are leased, boarding houses lease **individual bed-spaces within shared multi-occupancy rooms** (typically 2 to 8 beds per room).

Historical management methods rely on physical counter books, paper cash receipts, and ad-hoc WhatsApp groups. This creates major operational vulnerabilities:
1. **Pervasive Rent Arrears:** Lack of automated payment reminders and difficulty tracking which specific student in a shared room has paid or is in arrears.
2. **Reconciliation Fraud & Disputes:** Cash handlers and manual bank transfers create reconciliation overhead, lost payment slips, and counterfeit payment claims.
3. **Delayed Maintenance:** Critical repairs (plumbing, electrical, security) lack structured priority triage, leading to property deterioration and tenant dissatisfaction.
4. **Sub-Account Segregation:** Landlords need direct payout routing into their designated mobile money or bank accounts without pooled intermediary risks.

### 1.3 Scope of the Product
PandaStays resolves these operational challenges by treating the **individual bed-space as the atomic rentable unit**. The platform provides:
- **Landlord Operations Portal (`/app`):** Complete portfolio overview, visual architectural bed-grid floorplans, financial ledger with mobile money integration, tenant dossiers with National Registration Card (NRC) verification, automated WhatsApp overdue reminders, and a priority-ranked maintenance queue.
- **Student Resident Portal (`/tenant`):** Bed-space overview, digital lease and house rules repository, Mobile Money (MTN MoMo, Airtel Money, Zamtel Kwacha) STK push checkout, instant cryptographically-verifiable digital receipts with QR codes, and maintenance ticket logging.
- **Backend API Gateway & Webhook Service:** Privileged Express.js service coordinating Lenco Mobile Money STK push transactions, HMAC-SHA512 webhook signature verification, sub-account payout routing, and automated payment reconciliation.

### 1.4 Definitions, Acronyms, and Abbreviations
| Term / Acronym | Definition |
| :--- | :--- |
| **Bed-Space** | The fundamental atomic rentable unit in the system. Represents a single physical bed within a shared room. |
| **Room** | A physical room inside a property, containing one or more bed-spaces up to its designated capacity. |
| **Property** | A physical student boarding house or private hostel facility owned by a landlord. |
| **Tenancy** | A legally binding contract linking a student tenant to a specific bed-space for a defined billing cycle and rate. |
| **Landlord** | A registered property owner or asset manager with administrative authority over properties, rooms, beds, and rent collections. |
| **Tenant** | A student resident occupying an allocated bed-space with access to payment portals and ticket submission. |
| **NRC** | National Registration Card — the official Zambian national identification document format (`123456/11/1`). |
| **ZMW / K** | Zambian Kwacha — the legal tender of Zambia. |
| **MoMo** | Mobile Money — digital payment rail provided by MTN, Airtel, and Zamtel. |
| **STK Push** | SIM Tool Kit Push — automated mobile prompt requesting the user to enter their Mobile Money PIN to authorize payment. |
| **RLS** | Row-Level Security — PostgreSQL security feature restricting database row access based on current user session credentials. |
| **HMAC-SHA512**| Hash-based Message Authentication Code using SHA-512 for cryptographic webhook payload verification. |

---

## 2. Overall Description

### 2.1 Product Perspective & System Context
PandaStays operates as a cloud-hosted, multi-tenant web application deployed on high-availability edge infrastructure:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT PLATFORMS                                    │
│   Landlord Desktop/Tablet Portal           Mobile Safari / Android Chrome Web Client   │
└───────────────────────────────┬────────────────────────────────┬───────────────────────┘
                                │ HTTPS / TLS 1.3                │ HTTPS / TLS 1.3
                                ▼                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       VUE 3 FRONTEND APPLICATION (Vercel Edge)                         │
│  - Reactive Pinia/Store State     - Tactile Bento Design System   - Dynamic Theme Engine│
│  - Animated Number Engine         - Role Navigation Guards        - QR Generator        │
└───────────────────────────────┬────────────────────────────────┬───────────────────────┘
                                │                                │
            Client-Side RPC /   │                                │ Client-Side RPC /
            PostgreSQL Over RLS │                                │ PostgreSQL Over RLS
                                ▼                                ▼
┌────────────────────────────────────────────────┐  ┌────────────────────────────────────┐
│         SUPABASE MANAGED CLOUD ENGINE          │  │     EXPRESS 5 API GATEWAY (:3001)   │
│  - Auth Service (JWT, Passwords, Magic Links)  │  │  - Lenco STK Push Service Client   │
│  - PostgreSQL 15 Database (Relational Engine) │◄─┤  - HMAC-SHA512 Webhook Verifier     │
│  - Strict Row-Level Security Policies (RLS)    │  │  - Service-Role Privileged Writer  │
│  - Database Migration History & Seed Fixtures  │  │  - Fail-Closed Startup Diagnostics │
└────────────────────────────────────────────────┘  └─────────────────▲──────────────────┘
                                                                      │ HTTPS / Webhooks
                                                                      ▼
                                                    ┌────────────────────────────────────┐
                                                    │     LENCO PAYMENT GATEWAY          │
                                                    │  - MTN MoMo / Airtel / Zamtel Push │
                                                    │  - Subaccount Split Settlement     │
                                                    └────────────────────────────────────┘
```

### 2.2 User Classes and Role Matrix

| User Class | Scope & Permissions | Interface |
| :--- | :--- | :--- |
| **Property Landlord** | Full CRUD on own properties, rooms, beds, tenancies, payment logs, and maintenance priorities. Read-only on unassigned platform entities. | `/app/*` (Bento Shell with Collapsible Rail) |
| **Student Resident (Tenant)** | Read-only access to own allocated bed-space, lease document, and payment history. Write access to personal maintenance tickets and payment checkouts. | `/tenant/*` (Top-Tabbed Mobile Optimized Shell) |
| **Public Verifier** | Zero-auth read-only validation of cryptographic digital payment receipts via QR code scan or URL lookup. | `/verify/:id` (Standalone Verification Portal) |
| **Platform Administrator** | System health monitoring, API gateway telemetry, and sub-account onboarding assistance (internal service-role). | CLI / Supabase Studio |

### 2.3 Operating Environment
1. **Client Devices:** Modern desktop browsers (Chrome, Edge, Firefox, Safari) and mobile browsers (Android Chrome, iOS Safari) with responsive viewports down to 320px width.
2. **Server Runtime:** Node.js runtime environment (v18.0.0 LTS or v20.0.0 LTS).
3. **Database Engine:** PostgreSQL 15+ managed instance with `pgcrypto` extension.
4. **Networking:** Low-latency TLS 1.3 encrypted HTTPS channels. Client-side optimistic updates to accommodate variable cellular bandwidth in Zambia.

### 2.4 Design and Implementation Constraints
- **Multi-Tenancy Isolation:** Strictly enforce multi-tenant separation using PostgreSQL Row-Level Security. Landlord A must never read, modify, or infer data belonging to Landlord B.
- **Zero Raw Credential Storage:** Mobile Money PINs and banking credentials must never touch PandaStays application servers. All authorization occurs via telecom network STK push prompts.
- **Fail-Closed Architecture:** Backend services and frontend route guards must default to unauthorized (`401/403`) upon missing, expired, or invalid tokens.

---

## 3. External Interface Requirements

### 3.1 User Interfaces
1. **Tactile Bento Grid System:** Information architecture organized into structured cards with 2:1:1 asymmetry, inverted dark hero cards (`#0B2416`), and crisp border framing (`#E2E7E2`).
2. **Architectural Bed Floorplan (`<BedGrid>`):** Top-down silhouette visualizer depicting rooms and individual bed spaces with color-coded status chips (Occupied = Emerald, Partial = Ochre, Overdue = Brick Red, Reserved = Diagonal Hatch, Vacant = Clean Outline).
3. **Executive Printable Voucher (`<ReceiptVoucher>`):** Official payment document with anti-tamper security patterns, QR verification code, gateway references, and PDF download capabilities.
4. **Dynamic HSL Theming:** User-selectable accent themes (`Forest Emerald`, `Savanna Ochre`, `Midnight Slate`, `Kafue Teal`, `Copper Sunset`, `Jacaranda Indigo`).

### 3.2 Software & API Interfaces
1. **Lenco Mobile Money API v2:**
   - Base URL: `https://api.lenco.co/access/v2`
   - Endpoints utilized: `/collections/mobile-money`, `/collections/status/:reference`, `/sub-accounts`.
   - Payload authentication: Bearer API secret key.
   - Incoming webhook validation: Verification of `x-lenco-signature` header using HMAC-SHA512 hashing against raw webhook bodies.
2. **Supabase Client SDK (`@supabase/supabase-js`):**
   - JWT-based authenticated client connections with automatic token refresh.

---

## 4. Functional Requirements

### 4.1 Authentication & Profile Identity
- **FR-AUTH-1:** The system shall support secure landlord and tenant signup and sign-in using email and password.
- **FR-AUTH-2:** The system shall support passwordless magic link sign-in dispatched via email.
- **FR-AUTH-3:** The system shall dynamically resolve the authenticated user's role (`landlord` vs `tenant`) from the database upon session initialization.
- **FR-AUTH-4:** Route navigation guards (`router.beforeEach`) shall intercept unauthorized transitions and redirect tenants attempting to enter `/app/*` to `/tenant/portal`, and landlords attempting to enter `/tenant/*` to `/app`.
- **FR-AUTH-5:** The sign-out procedure shall clear in-memory user sessions immediately and navigate to the public landing page (`/`) without UI freezing or delay.

### 4.2 Property, Room & Bed-Space Architecture
- **FR-PROP-1:** Landlords shall be able to create, edit, and delete properties (specifying Name, Physical Address, and Zambian contact details).
- **FR-PROP-2:** Landlords shall be able to provision rooms within a property, configuring room numbers and physical bed capacity.
- **FR-PROP-3:** Landlords shall be able to create and manage individual bed-spaces within each room, specifying custom labels (e.g., `Bed 101-A (Window)`) and independent rental rates in ZMW.
- **FR-PROP-4:** The system shall automatically manage bed-space occupancy statuses: `vacant`, `occupied`, and `reserved`.
- **FR-PROP-5:** Deleting a room or property shall cascade cleanly through child bed-spaces and foreign key relationships in accordance with database constraints.

### 4.3 Tenancy Lifecycle & Resident Dossiers
- **FR-TEN-1:** Landlords shall be able to onboard and allocate a student tenant to a specific vacant or reserved bed-space, creating an active `tenancy` record with defined start date, monthly rental amount, and billing period.
- **FR-TEN-2:** Student dossiers shall record verified identity metadata: Full Legal Name, Zambian Phone Number, National Registration Card (NRC) number, Date of Birth, Emergency Contact Name, and Emergency Contact Phone.
- **FR-TEN-3:** The system shall automatically link a student's self-registered Supabase auth account to their pre-existing tenancy dossier using case-insensitive email matching (`link_tenant_profile()`).
- **FR-TEN-4:** Ending a tenancy shall transition the tenancy record to `ended`, clear the bed space's tenant association, and return the bed space status to `vacant`.

### 4.4 Financial Ledger, Mobile Money & Lenco Gateway
- **FR-FIN-1:** The system shall display a real-time financial ledger tracking total revenue collected, outstanding balances, and total transaction volume.
- **FR-FIN-2:** Landlords and tenants shall be able to initiate Mobile Money STK push payment prompts (MTN, Airtel, Zamtel) via the backend API gateway.
- **FR-FIN-3:** The backend API gateway shall route payments to the landlord's registered `lenco_subaccount_id` to ensure direct settlement segregation.
- **FR-FIN-4:** The system shall process incoming Lenco webhook events (`collection.successful`, `collection.failed`), verify their HMAC-SHA512 signatures, query Lenco's status endpoint for verification, and update payment statuses accordingly.
- **FR-FIN-5:** Landlords shall be able to record verified offline cash collections with mandatory receipt issuance.

### 4.5 Digital Receipt Generation & Anti-Tamper Verification
- **FR-REC-1:** Every successful payment record shall generate a unique digital receipt number (e.g., `REC-2026-001`) and an unguessable cryptographic verification token (UUID v4).
- **FR-REC-2:** Digital receipts shall render a scannable QR code resolving to `https://pandastays.zm/verify/:token`.
- **FR-REC-3:** The public verification route (`/verify/:id`) shall validate receipts in real-time against the database without requiring user authentication.
- **FR-REC-4:** Receipts shall be printable and exportable to PDF with official boarding house vouchers.

### 4.6 WhatsApp Escalation & Reminders Engine
- **FR-REM-1:** The system shall identify tenants with upcoming rent due dates (N days before due date, configured per landlord).
- **FR-REM-2:** The system shall identify overdue tenancies and compute days elapsed past the grace period.
- **FR-REM-3:** The landlord dashboard shall provide a single-click "Send WhatsApp Chaser" action compiling a personalized message with tenant name, bed space, amount due, and payment link.
- **FR-REM-4:** All reminder dispatches shall be logged in the `reminder_log` audit table.

### 4.7 Prioritized Maintenance Queue
- **FR-MNT-1:** Tenants shall be able to submit maintenance tickets specifying category (Plumbing, Electrical, Furniture, Security, Structural), description, and optional photo URL.
- **FR-MNT-2:** Landlords shall view all open tickets across their property in an operations queue.
- **FR-MNT-3:** Landlords shall be able to update ticket status (`open`, `in_progress`, `resolved`) and manually rank priority tickets.

---

## 5. Non-Functional Requirements

### 5.1 Security & Data Privacy
- **NFR-SEC-1:** All database tables shall have PostgreSQL Row-Level Security enabled. Direct client queries through the anonymous Supabase client must be bounded by authenticated UID session policies.
- **NFR-SEC-2:** The `landlords.lenco_subaccount_id` column shall be protected against unauthorized modification via database-level `REVOKE UPDATE` constraints.
- **NFR-SEC-3:** All backend API endpoints modifying financial data shall require authenticated Bearer tokens and enforce fail-closed authorization.
- **NFR-SEC-4:** Express API Gateway shall enforce security headers using `helmet` and maintain an explicit CORS whitelist.

### 5.2 Performance & UI Responsiveness
- **NFR-PERF-1:** Initial landing and dashboard visual rendering shall achieve First Contentful Paint (FCP) under 1.2 seconds on standard broadband connections.
- **NFR-PERF-2:** Number animations and SVG gauge sweeps shall render smoothly at 60fps/120fps using browser `requestAnimationFrame` without layout shift (`tabular-nums`).
- **NFR-PERF-3:** Vite production bundles shall be minified and optimized to gzip asset sizes under 200 kB for core vendor bundles.

### 5.3 Reliability & Availability
- **NFR-REL-1:** The platform shall target 99.9% uptime for client web applications and backend API gateways.
- **NFR-REL-2:** Webhook listeners shall be idempotent, discarding duplicate webhook delivery references (`gateway_reference` unique constraints).

---

## 6. Verification and Acceptance Criteria
1. **Multi-Tenancy Verification:** Automated test suite (`npm run test:rls`) executes and passes, proving Landlord A cannot read Landlord B's records.
2. **Payment Flow Verification:** Simulated STK push requests and signed webhooks update tenancy payment statuses from `pending` to `success` with zero manual intervention.
3. **Build Validation:** `npm run build` completes with zero TypeScript/Vue compiler errors.