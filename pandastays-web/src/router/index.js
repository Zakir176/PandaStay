import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
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
import TenantCheckout from '../views/TenantCheckout.vue'
import TenantPortal from '../views/TenantPortal.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage
  },
  {
    path: '/app',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'rooms',
        name: 'Rooms',
        component: Rooms
      },
      {
        path: 'financials',
        name: 'Financials',
        component: Financials
      },
      {
        path: 'maintenance',
        name: 'Maintenance',
        component: Maintenance
      },
      {
        path: 'leases',
        name: 'Leases',
        component: Leases
      },
      {
        path: 'deposits',
        name: 'Deposits',
        component: Deposits
      },
      {
        path: 'tenants',
        name: 'Tenants',
        component: Tenants
      },
      {
        path: 'tenants/:id',
        name: 'TenantProfile',
        component: TenantProfile
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings
      }
    ]
  },
  {
    path: '/tenant',
    redirect: '/tenant/portal'
  },
  {
    path: '/tenant/portal',
    name: 'TenantPortal',
    component: TenantPortal
  },
  {
    path: '/tenant/checkout',
    name: 'TenantCheckout',
    component: TenantCheckout
  },
  {
    path: '/pay',
    redirect: '/tenant/checkout'
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

export default router
