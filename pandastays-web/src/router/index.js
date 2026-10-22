import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import TenantLayout from '../layouts/TenantLayout.vue'
import {
  LandingPage,
  Dashboard,
  Rooms,
  Financials,
  Maintenance,
  Leases,
  Deposits,
  Tenants,
  TenantProfile,
  Settings,
  TenantPortal,
  TenantPayments,
  TenantMaintenance,
  TenantLease,
  TenantCheckout,
  PublicVerification
} from '../views'
import AccountPending from '../views/AccountPending.vue'
import { useAuth, initAuth } from '../lib/auth'
import { resolveGuardRedirect } from './guard'

const routes = [
  // ─── Public Landing Site ───
  {
    path: '/',
    name: 'Landing',
    component: LandingPage
  },

  // ─── Public Scannable Verification Route (Zero Auth Required) ───
  {
    path: '/verify/:id',
    name: 'PublicVerification',
    component: PublicVerification
  },

  // ─── Signed-in users with no landlord row and no tenant rows ───
  {
    path: '/account-pending',
    name: 'AccountPending',
    component: AccountPending
  },

  // ─── Landlord Operations Portal (Dedicated to Property Owners & Managers) ───
  {
    path: '/app',
    component: AppLayout,
    meta: { role: 'landlord' },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
        meta: { role: 'landlord' }
      },
      {
        path: 'rooms',
        name: 'Rooms',
        component: Rooms,
        meta: { role: 'landlord' }
      },
      {
        path: 'financials',
        name: 'Financials',
        component: Financials,
        meta: { role: 'landlord' }
      },
      {
        path: 'maintenance',
        name: 'Maintenance',
        component: Maintenance,
        meta: { role: 'landlord' }
      },
      {
        path: 'leases',
        name: 'Leases',
        component: Leases,
        meta: { role: 'landlord' }
      },
      {
        path: 'deposits',
        name: 'Deposits',
        component: Deposits,
        meta: { role: 'landlord' }
      },
      {
        path: 'tenants',
        name: 'Tenants',
        component: Tenants,
        meta: { role: 'landlord' }
      },
      {
        path: 'tenants/:id',
        name: 'TenantProfile',
        component: TenantProfile,
        meta: { role: 'landlord' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: { role: 'landlord' }
      }
    ]
  },

  // ─── Student Resident Portal (Dedicated to Tenants & Boarding Students) ───
  {
    path: '/tenant',
    component: TenantLayout,
    meta: { role: 'tenant' },
    children: [
      {
        path: '',
        redirect: '/tenant/portal'
      },
      {
        path: 'portal',
        name: 'TenantPortal',
        component: TenantPortal,
        meta: { role: 'tenant' }
      },
      {
        path: 'payments',
        name: 'TenantPayments',
        component: TenantPayments,
        meta: { role: 'tenant' }
      },
      {
        path: 'maintenance',
        name: 'TenantMaintenance',
        component: TenantMaintenance,
        meta: { role: 'tenant' }
      },
      {
        path: 'lease',
        name: 'TenantLease',
        component: TenantLease,
        meta: { role: 'tenant' }
      },
      {
        path: 'checkout',
        name: 'TenantCheckout',
        component: TenantCheckout,
        meta: { role: 'tenant' }
      }
    ]
  },

  // ─── Quick Pay Alias ───
  {
    path: '/pay',
    redirect: '/tenant/checkout'
  },

  // ─── Fallback Catch-All ───
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  }
})

// Route Navigation Guard: Enforce Real Authentication & Bi-Directional Role Isolation
router.beforeEach(async (to, from, next) => {
  await initAuth()
  const { currentRole, isAuthenticated } = useAuth()
  const requiresRole = to.matched.find(record => record.meta?.role)?.meta?.role

  const redirect = resolveGuardRedirect({
    requiresRole,
    isAuthenticated: isAuthenticated.value,
    currentRole: currentRole.value,
    to
  })
  if (redirect) return next(redirect)

  next()
})

export default router
