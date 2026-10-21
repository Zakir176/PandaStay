# 🐼 PandaStays Web Application Package

The core web application package for the PandaStays Student Housing Platform. Contains the Vue 3 single-page application and the Express backend API gateway.

---

## 🏗️ Architecture & Component Design

The application follows a layered modular architecture:

```
src/
├── components/          # Reusable UI widgets, interactive floorplans, and modals
├── constants/           # Centralized domain enumerations (Roles, Statuses, Methods)
├── layouts/             # Dual-portal shells (Landlord AppLayout & Student TenantLayout)
├── lib/                 # Core stores (Auth, Reactive Store, Dynamic Theme Engine)
├── router/              # Route configuration & role-based beforeEach navigation guards
├── services/            # Pure data access modules (Property, Tenant, Payment, Report)
├── utils/               # Data formatting helpers (ZMW Kwacha Currency, Dates, NRC, Phone)
└── views/               # Route pages (Landlord Operations & Student Resident Portal)
```

---

## 🎨 Tactile Bento Grid Design System

The application design is built on the **Bento Grid** design system:
- **Asymmetric Grid Layouts**: 2:1:1 hero tiering with high visual hierarchy.
- **Top-Down Bed Silhouette**: Architectural floorplan cards displaying real-time occupancy and payment statuses.
- **Capsule Pill Elements**: Compact, high-density badge status indicators and actionable buttons.
- **Dynamic HSL Theming**: 6 curated palettes (`Forest Emerald`, `Savanna Ochre`, `Midnight Slate`, `Kafue Teal`, `Copper Sunset`, `Jacaranda Indigo`) driven by CSS variables in `style.css` and managed via `src/lib/theme.js`.
- **60fps/120fps Motion**: Hardware-accelerated count-up numbers (`<AnimatedNumber>`) and decelerated entrance animations (`bentoFadeUp`).

---

## 🔌 API & Integration Layer

- **Supabase Client (`src/lib/supabaseClient.js`)**: Real-time subscriptions and standard client-side data queries using anonymous keys bounded by PostgreSQL Row-Level Security (RLS).
- **Backend Service Role Gateway (`server/`)**: Express service running on Port `3001` handling privileged actions (bypassing RLS safely, HMAC-SHA512 webhook verification, and Lenco STK Push payment requests).

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

---

## 📚 Related Documentation
- [Master System README](../README.md)
- [Software Requirements Specification (SRS)](../Docs/SRS.md)
- [API & Webhook Documentation](../Docs/API.md)
- [Architecture & Security Specification](../Docs/ARCHITECTURE.md)
- [Design System Specification](../Design.md)
