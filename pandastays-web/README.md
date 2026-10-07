# 🐼 PandaStays Web Application

Frontend single-page application and backend payment service for the PandaStays Student Housing Management Platform.

---

## 🏗️ Architecture & Component Design

The application follows a layered modular architecture:

```
src/
├── components/          # Reusable UI widgets, interactive floorplans, and modals
├── constants/           # Centralized domain enumerations (Roles, Statuses, Methods)
├── layouts/             # Portal shells (Landlord AppLayout & Student TenantLayout)
├── lib/                 # Core stores (Auth, Reactive Store, Dynamic Theme)
├── router/              # Route configuration & role-based beforeEach navigation guards
├── services/            # Pure data access modules (Property, Tenant, Payment, Report)
├── utils/               # Data formatting helpers (Kwacha Currency, Dates, NRC, Phone)
└── views/               # Route pages (Landlord Operations & Student Resident Portal)
```

---

## 🎨 Design System: Tactile Bento Grid

The application design is built on the **Bento Grid** design system:
- **Asymmetric Grid Layouts**: 2:1:1 hero tiering with high visual hierarchy.
- **Top-Down Bed Silhouette**: Architectural floorplan cards displaying real-time occupancy and payment statuses.
- **Capsule Pill Elements**: Compact, high-density badge status indicators and actionable buttons.
- **Dynamic HSL Theming**: 6 curated palettes (`Forest Emerald`, `Savanna Ochre`, `Midnight Slate`, `Kafue Teal`, `Copper Sunset`, `Jacaranda Indigo`) driven by CSS variables in `style.css` and managed via `src/lib/theme.js`.

---

## 🔌 API & Integration Layer

- **Supabase Client (`src/lib/supabaseClient.js`)**: Real-time subscriptions and standard client-side data queries using anonymous keys.
- **Backend Service Role Gateway (`server/`)**: Express service running on Port `3001` handling privileged actions (bypassing RLS safely, HMAC webhook verification, and Lenco STK Push payment requests).

---

## 🛠️ Development & Testing

### Running the App Locally
```bash
# Start frontend client (Vite on :5173)
npm run dev

# Start backend service (Express on :3001)
npm run server
```

### Build & Production Output
```bash
npm run build
npm run preview
```

### Running Integration Diagnostics
```bash
npm run test:supabase   # Test Supabase connection and tables
npm run test:rls        # Test Row-Level Security policies
npm run test:payments   # Test Lenco Mobile Money payment integration
```
