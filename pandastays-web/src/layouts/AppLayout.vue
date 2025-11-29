<script setup>
import { ref } from 'vue'
import RecordPaymentModal from '../components/RecordPaymentModal.vue'

const isMobileMenuOpen = ref(false)
const isPaymentModalOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const openPaymentModal = () => {
  isPaymentModalOpen.value = true
}

const closePaymentModal = () => {
  isPaymentModalOpen.value = false
}

const navItems = [
  { name: 'Dashboard', path: '/app', icon: 'dashboard' },
  { name: 'Financial Ledger', path: '/app/financials', icon: 'payments' },
  { name: 'Maintenance & Repairs', path: '/app/maintenance', icon: 'handyman' },
  { name: 'Semester & Leases', path: '/app/leases', icon: 'event_repeat' },
  { name: 'Security Deposits', path: '/app/deposits', icon: 'account_balance_wallet' },
  { name: 'Tenant Profiles', path: '/app/tenants', icon: 'groups' }
]
</script>

<template>
  <div class="relative min-h-screen bg-surface text-on-surface font-body-md antialiased flex">
    <!-- Payment Modal Component -->
    <RecordPaymentModal 
      :is-open="isPaymentModalOpen" 
      @close="closePaymentModal" 
    />

    <!-- Mobile Backdrop Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      @click="closeMobileMenu"
      class="fixed inset-0 bg-inverse-surface/40 z-40 md:hidden"
    ></div>

    <!-- Left Sidebar (Persistent Collapsible / Slate 900 feel) -->
    <aside 
      class="flex flex-col fixed left-0 top-0 h-full w-sidebar-width bg-surface dark:bg-inverse-surface border-r border-outline-variant dark:border-outline z-50 py-6 px-4 transition-transform duration-300 md:translate-x-0"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <div class="flex items-center justify-between mb-8 px-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-primary-container flex items-center justify-center text-on-primary-container">
            <span class="material-symbols-outlined">real_estate_agent</span>
          </div>
          <div>
            <h1 class="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">PandaStays</h1>
            <p class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wide">Management Portal</p>
          </div>
        </div>
        <button @click="closeMobileMenu" class="md:hidden text-on-surface-variant hover:text-on-surface">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <nav class="flex-1 flex flex-col gap-2">
        <router-link 
          v-for="item in navItems" 
          :key="item.path" 
          :to="item.path" 
          @click="closeMobileMenu"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="($route.path === item.path || (item.path === '/app' && $route.path === '/app/')) ? 'bg-secondary-container text-on-secondary-container font-medium' : 'text-on-surface-variant hover:bg-surface-container-high'"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span class="font-body-md text-body-md">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="mt-auto flex flex-col gap-2 border-t border-outline-variant pt-4">
        <a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
          <span class="material-symbols-outlined">settings</span>
          <span class="font-body-md text-body-md font-medium">Settings</span>
        </a>
        <a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
          <span class="material-symbols-outlined">help</span>
          <span class="font-body-md text-body-md font-medium">Support</span>
        </a>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex flex-col md:ml-sidebar-width min-h-screen w-full md:w-[calc(100%-260px)]">
      <!-- TopNavBar Header -->
      <header class="flex justify-between items-center w-full px-4 md:px-page-margin-dt py-4 h-16 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline docked full-width top-0 sticky z-40">
        <div class="flex items-center gap-4">
          <button @click="toggleMobileMenu" class="md:hidden text-on-surface flex items-center">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div class="flex flex-col">
            <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">PROPERTY</span>
            <h2 class="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface-variant">Mukuba House</h2>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button 
            @click="openPaymentModal"
            class="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-title-sm text-title-sm rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-on-primary-fixed-variant transition-colors active:scale-95 duration-75"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            Record Payment
          </button>
          <div class="flex items-center gap-2 border-l border-outline-variant pl-4">
            <button class="text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-75 w-8 h-8 flex items-center justify-center">
              <span class="material-symbols-outlined">notifications</span>
            </button>
            <button class="text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-75 w-8 h-8 flex items-center justify-center">
              <span class="material-symbols-outlined">help</span>
            </button>
            <div class="w-8 h-8 rounded-full bg-surface-variant overflow-hidden ml-2 cursor-pointer border border-outline-variant">
              <img 
                alt="Landlord Profile" 
                class="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEy6YVypc-v9f5s-ukQ0XdJBxYKdUrCEqe6ZF5bMB0QUXeHVou8O3VDsG1QpDutyI08E0eNYABm1iPrdBLQGZI74c1oEDhuy8HYv-X-qszL4dLXPUMSYNzOMlilbfebSAsxx9uJ2M4M7UPHVuuBAm-Row9XKJP8nwxZmQ0UcYtMKe4bvIaE__ltNi4MLDKIn_hzIFmupocIujpFo8SjhEIoZH732ouktDg3TU04cL9mJbyc9AtVlHy"
              >
            </div>
          </div>
        </div>
      </header>

      <!-- Main Router Outlet -->
      <main class="flex-1 p-4 md:p-page-margin-dt max-w-container-max mx-auto w-full">
        <router-view />
      </main>
    </div>
  </div>
</template>
