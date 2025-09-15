# Software Requirements Specification
## Boarding House Bed-Space Management & Payment Platform

**Version:** 0.1 (Draft)
**Date:** August 2026

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for a multi-landlord SaaS platform that manages bed-space rentals in Zambian student boarding houses. It covers tenant-bed allocation, rent payment via a payment gateway, automated rent reminders, and a maintenance reporting/priority dashboard for landlords.

### 1.2 Problem Statement
Zambian universities have insufficient on-campus accommodation. Landlords convert residential houses into boarding houses, renting individual bed-spaces within shared rooms (e.g. 5 tenants per room) rather than whole units. This informal arrangement makes it hard for landlords — especially those living elsewhere — to track who has paid, chase overdue rent, and manage maintenance issues raised by tenants.

### 1.3 Scope
The system is a **multi-landlord SaaS**: any landlord can register, add one or more properties, define rooms and bed-spaces within them, and manage tenants against those bed-spaces. Tenants pay rent through an integrated payment gateway and receive receipts. Landlords receive WhatsApp rent reminders on their behalf are sent to tenants, and can view/manage maintenance reports through a priority dashboard.

### 1.4 Definitions
- **Property** — a single boarding house.
- **Room** — a physical room within a property, containing one or more bed-spaces.
- **Bed-space** — the smallest rentable unit; one tenant occupies one bed-space.
- **Tenancy** — the record linking a tenant to a bed-space for a given period, at a given rate.
- **Landlord** — account that owns one or more properties.
- **Tenant** — account that rents a bed-space and pays rent through the platform.

---

## 2. Overall Description

### 2.1 User Classes
| Role | Description |
|---|---|
| Landlord | Owns properties, manages rooms/bed-spaces, views tenants and payment status, receives/reviews maintenance reports, grades report priority |
| Tenant | Views their tenancy, pays rent, downloads receipts, submits maintenance reports, receives rent reminders |
| Platform Admin | Manages landlord accounts, monitors payment gateway health, handles support (internal, not a public role) |

*(Open question for later: does a property need a "Caretaker/Agent" role who acts on the landlord's behalf on-site? Worth revisiting once you have a real multi-property landlord using the system.)*

### 2.2 Core Entity Relationships
```
Landlord 1---* Property 1---* Room 1---* BedSpace 1---* Tenancy *---1 Tenant
Tenancy 1---* Payment
Property 1---* Report (raised by Tenant, graded by Landlord)
```

---

## 3. Functional Requirements

### 3.1 Authentication & Accounts
- FR1.1 Landlord signup/login (email + password, or phone-based OTP — TBD)
- FR1.2 Tenant signup/login, typically invited by a landlord via a unique link/code tied to a bed-space
- FR1.3 Role-based access control (Landlord vs Tenant vs Admin)

### 3.2 Property, Room & Bed-Space Management
- FR2.1 Landlord can create/edit/delete a Property (name, address, contact)
- FR2.2 Landlord can add Rooms to a Property (room number/name, capacity)
- FR2.3 Landlord can add Bed-Spaces to a Room, up to its capacity
- FR2.4 Each Bed-Space has a status: Vacant / Occupied / Reserved
- FR2.5 Landlord can set a rent amount per Bed-Space (rates may differ within the same room)

### 3.3 Tenancy Management
- FR3.1 Landlord assigns a Tenant to a Bed-Space, creating a Tenancy with start date, rent amount, and billing cycle (monthly)
- FR3.2 Tenancy can be ended (move-out), which frees the Bed-Space and closes billing
- FR3.3 System tracks tenancy history per Bed-Space and per Tenant

### 3.4 Payments
- FR4.1 Tenant can pay rent through the integrated gateway (Lenco by BoardaPay)
- FR4.2 System records each payment against the Tenancy, with amount, date, and gateway reference
- FR4.3 System generates a receipt (PDF or in-app) per successful payment
- FR4.4 System reconciles payment status via gateway webhooks *(pending: confirm what webhook events Lenco/BoardaPay sends, and how partial/failed/reversed payments are represented)*
- FR4.5 Landlord can view a payment ledger per Tenant and per Property

### 3.5 Rent Reminders
- FR5.1 System sends a WhatsApp reminder N days before rent is due (rules-based, configurable per landlord)
- FR5.2 System sends escalating reminders if rent becomes overdue
- FR5.3 Reminder scheduling runs as a background job checking due dates against payment records

### 3.6 Maintenance Reports & Priority Dashboard
- FR6.1 Tenant can submit a Report against their Property (description, category, optional photo)
- FR6.2 Landlord views all open Reports for a Property
- FR6.3 Landlord manually assigns/reorders priority on Reports (drag-and-drop priority list)
- FR6.4 Report has a status: Open / In Progress / Resolved

---

## 4. Non-Functional Requirements
- NFR1 — Multi-tenancy: data must be strictly isolated per Landlord account
- NFR2 — Security: payment data and webhooks must be handled per gateway security requirements; no card/mobile-money credentials stored on platform servers
- NFR3 — Reliability: reminder jobs and payment webhook processing must be retried on failure, not silently dropped
- NFR4 — Usability: tenant-facing flows (pay rent, submit report) should work well on low-end Android devices and slow connections, given the target user base

---

## 5. External Integrations
- **Lenco by BoardaPay** — payment gateway for rent collection *(reconciliation/webhook details to confirm)*
- **WhatsApp Business API** (directly, or via a provider like Meta Cloud API / Twilio / Gupshup) — rent reminders

---

## 6. MVP Scope vs Phase 2

**MVP (v1):**
- Landlord & Tenant auth
- Property → Room → Bed-Space setup
- Tenancy assignment
- Rent payment via gateway + receipt generation
- Basic rules-based WhatsApp rent reminders
- Reports submission + manual priority list (no auto-scoring)

**Phase 2 (later):**
- Multi-property analytics/reports for landlords
- Caretaker/agent role
- Payment plans (partial payments, deposits, penalties for late payment)
- Automated priority scoring for reports
- SMS fallback for reminders where WhatsApp isn't available

---

## 7. Open Questions
1. Lenco/BoardaPay webhook events and reconciliation flow — needs research
2. Tenant onboarding flow: does the landlord invite tenants, or can tenants self-register and request a bed-space?
3. Billing cycle edge cases: pro-rated rent for mid-month move-in/move-out