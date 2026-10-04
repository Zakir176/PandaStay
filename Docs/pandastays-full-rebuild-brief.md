# PandaStays — Full Rebuild Brief (Clean Slate)

**This supersedes the earlier "restyle pass" brief.** Scope has changed: this is a ground-up rebuild of the whole application — frontend, backend, and data model — not a patch on the existing Stitch/Gemini build. Treat the old repo (`github.com/Zakir176/PandaStay`) as reference material only (what content/flows existed, what to avoid visually), not as a codebase to extend.

---

## 1. What PandaStays is

A multi-landlord SaaS for managing bed-space rentals in Zambian student boarding houses. Landlords manage properties, rooms, and individual bed-spaces; tenants are tied to a specific bed-space, pay rent through an integrated payment gateway, and get a receipt automatically. Landlords get visibility into payment status and maintenance issues without needing to be on-site.

**Core design principle:** the bed-space — not the room or the building — is the fundamental rentable unit. A room holds multiple bed-spaces, each independently rented, each with its own tenant and rent amount.

---

## 2. Tech stack (keep this — don't re-litigate)

- **Frontend:** Vue 3 + Vite + Tailwind CSS v4
- **Backend:** Supabase (Postgres + Auth) for data and auth; a thin Express server only where Supabase's client SDK isn't sufficient (e.g. payment gateway webhook handling, which needs a real server endpoint)
- **Payment gateway:** Lenco by BoardaPay — sub-account support confirmed, so each landlord can have their own payout routing rather than everything pooling into one account
- **Rent reminders:** WhatsApp Business API (or a provider such as Meta Cloud API/Twilio/Gupshup — pick whichever gives the simplest integration path), triggered by a scheduled job, not AI-driven
- **Deploy target:** Vercel (frontend) + Supabase (hosted backend) — consistent with how other projects in this account are deployed

---

## 3. Data model (clean slate — build to this spec)

```
landlords
  id, name, email, phone, created_at
  (auth via Supabase Auth; this table holds profile data keyed to auth.users.id)

properties
  id, landlord_id (FK -> landlords), name, address, created_at

rooms
  id, property_id (FK -> properties), room_number, capacity, created_at

bed_spaces
  id, room_id (FK -> rooms), label, rent_amount, status (vacant | occupied | reserved), created_at

tenants
  id, name, email, phone, id_number, date_of_birth, emergency_contact_name, emergency_contact_phone, created_at
  (auth via Supabase Auth; typically invited by a landlord via a link/code tied to a bed_space)

tenancies
  id, bed_space_id (FK -> bed_spaces), tenant_id (FK -> tenants),
  start_date, end_date (nullable), rent_amount, billing_cycle, status (active | ended), created_at

payments
  id, tenancy_id (FK -> tenancies), amount, paid_at, method, gateway_reference,
  status (pending | success | failed | reversed), receipt_number, created_at

reports
  id, property_id (FK -> properties), tenant_id (FK -> tenants), description, category,
  photo_url (nullable), status (open | in_progress | resolved), priority_rank (nullable, set manually by landlord),
  created_at, updated_at

reminder_log
  id, tenancy_id (FK -> tenancies), sent_at, channel, reminder_type (upcoming | overdue), delivery_status
```

Relationships: `Landlord 1—* Property 1—* Room 1—* BedSpace 1—* Tenancy *—1 Tenant`; `Tenancy 1—* Payment`; `Property 1—* Report`.

Row-level security: every table scoped so a landlord only ever sees their own properties/rooms/bed-spaces/tenancies/payments/reports; a tenant only sees their own tenancy, payments, and reports.

---

## 4. Functional requirements

### 4.1 Auth & accounts
- Landlord signup/login (Supabase Auth)
- Tenant signup/login, typically via an invite link/code tied to a specific bed-space
- Role-based access: Landlord / Tenant / (internal) Platform Admin

### 4.2 Property, room & bed-space management
- Landlord creates/edits/deletes Properties
- Landlord adds Rooms to a Property (number, capacity)
- Landlord adds Bed-Spaces to a Room, up to its capacity, each with its own rent amount
- Bed-space status: Vacant / Occupied / Reserved

### 4.3 Tenancy management
- Landlord assigns a Tenant to a Bed-Space → creates a Tenancy (start date, rent, billing cycle)
- Ending a tenancy frees the bed-space and closes billing
- Full tenancy history tracked per bed-space and per tenant

### 4.4 Payments
- Tenant pays rent via Lenco (sub-account routed to their landlord)
- Every payment recorded against its Tenancy with amount, date, gateway reference
- Receipt generated automatically per successful payment
- Payment status reconciled via Lenco webhooks (pending/success/failed/reversed)
- Landlord sees a payment ledger per tenant and per property

### 4.5 Rent reminders
- WhatsApp reminder N days before rent is due (configurable per landlord), rules-based
- Escalating reminders once overdue
- Driven by a scheduled job checking due dates against payment records

### 4.6 Maintenance reports
- Tenant submits a Report against their property (description, category, optional photo)
- Landlord sees all open Reports for a property
- Landlord manually sets/reorders priority (drag-and-drop list) — no auto-scoring
- Report status: Open / In Progress / Resolved

---

## 5. Visual direction (approved — build to this from the start)

### 5.1 Color tokens
- **Primary (emerald/forest):** `#0E6B50` — deep, muted green. Not a bright teal, not Tailwind's default `emerald-500`.
- **Secondary (slate):** `#4A5160` — warm charcoal-navy.
- **Tertiary (ochre/gold):** `#8A5A16` / container `#C08A2E` — muted ochre, used for "partial payment" states.
- **Error (brick):** `#9A3324` — warm brick-red, used for overdue/error states.
- **Background/surface:** warm paper-neutral (`#F6F4EC` family) — not cool blue-white.
- Avoid anything resembling Material 3 baseline defaults or raw Tailwind palette swatches — pick deliberate values, not generator output.

### 5.2 Typography
- Body/UI: **IBM Plex Sans**
- Data/financial figures, receipt numbers, amounts: **JetBrains Mono**

### 5.3 Component rules
- Cards: tight radius (~4px) — precise and structured, not soft/bubbly
- Status badges/chips: looser radius (~8px) — deliberately rounder than the card containing them, to create hierarchy
- Every status-bearing card gets a 3px solid accent bar across its top edge, color-matched to status (primary = paid, tertiary = partial, error = overdue)
- No heavy drop shadows — flat surfaces separated by a 1px border, not elevation
- Wherever bed/room occupancy is shown, use a literal bed-grid/floor-plan visual (filled vs. outline bed icons) instead of abstract progress bars or plain avatar lists — this is the one deliberately distinctive, product-specific visual signature, carry it everywhere occupancy appears

---

## 6. Pages to build

| Page | Audience | Notes |
|---|---|---|
| Dashboard | Landlord | Property overview, occupancy, rent collected, overdue rent, room/bed-space status grid |
| Tenants (list + profile) | Landlord | Profile view: lease info, payment history, quick actions |
| Rooms & Beds | Landlord | Bed-grid motif is the centerpiece here |
| Payments / Financial Ledger | Landlord | Lean on mono type; consider a receipt/ledger-paper feel |
| Security Deposits | Landlord | |
| Maintenance & Repairs | Landlord | Manual priority list (drag-and-drop) |
| Lease Transitions | Landlord | Semester/lease start-end handling |
| Reports | Landlord | |
| Settings | Landlord | |
| Support | Landlord | |
| Tenant: Payment checkout | Tenant | Receipt/paper aesthetic especially appropriate — highest-trust moment |
| Tenant: Profile / Payment history | Tenant | |
| Tenant: Submit report | Tenant | |

---

## 7. Phasing

**MVP (build first):** Landlord & tenant auth · property/room/bed-space setup · tenancy assignment · rent payment via Lenco + receipt generation · rules-based WhatsApp reminders · reports with manual priority list.

**Phase 2 (after MVP is validated):** multi-property analytics, caretaker/agent role, flexible payment plans (partial payments, deposits, late penalties), SMS fallback for reminders.

---

## 8. What to carry forward from the old repo

Nothing structurally. Use the old Stitch mockups (`stitch_pandastays_property_dashboard/` in the old repo) only as content/layout reference for screens not described in detail above — not for visual style, not for code.
