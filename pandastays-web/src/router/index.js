import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import TenantLayout from '../layouts/TenantLayout.vue'
import LandingPage from '../views/LandingPage.vue'
import Dashboard from '../views/Dashboard.vue'
import Rooms from '../views/Rooms.vue'
import Financials from '../views/Financials.vue'
import Maintenance from '../views/Maintenance.vue'
import Leases from '../views/Leases.vue'
import Deposits from '../views/Deposits.vue'
import Tenants from '../views/Tenants.vue'
import TenantProfile from '../views/TenantProfile.vue'
import Settings from '../views/Settings.vue'
import TenantPortal from '../views/TenantPortal.vue'
import TenantPayments from '../views/TenantPayments.vue'
import TenantMaintenance from '../views/TenantMaintenance.vue'
import TenantLease from '../views/TenantLease.vue'
import TenantCheckout from '../views/TenantCheckout.vue'
import { useAuth } from '../lib/auth'

const routes = [
  // ─── Public Landing Site ───
  {
    path: '/',
    name: 'Landing',
    component: LandingPage
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

// Route Navigation Guard: Enforce Portal Separation & Data Integrity
router.beforeEach((to, from, next) => {
  const { currentRole } = useAuth()

  // Protect Landlord Portal against active tenants
  if (to.matched.some(record => record.meta?.role === 'landlord')) {
    if (currentRole.value === 'tenant') {
      return next({ path: '/tenant/portal', query: { restricted: 'landlord_only' } })
    }
  }

  next()
})

export default router
