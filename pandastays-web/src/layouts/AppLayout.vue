<script setup>
import { ref, onMounted } from 'vue'
import RecordPaymentModal from '../components/RecordPaymentModal.vue'
import AuthModal from '../components/AuthModal.vue'
import { useAuth, initAuth } from '../lib/auth'

const { userProfile, currentRole, signOut } = useAuth()

onMounted(() => {
  initAuth()
})

const isMobileMenuOpen = ref(false)
const isPaymentModalOpen = ref(false)
const isAuthModalOpen = ref(false)
const isProfileDropdownOpen = ref(false)

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

const openAuthModal = () => {
  isProfileDropdownOpen.value = false
  isAuthModalOpen.value = true
}

const handleSignOut = async () => {
  isProfileDropdownOpen.value = false
  await signOut()
}

const navItems = [
  { name: 'Dashboard', path: '/app', icon: 'dashboard' },
  { name: 'Rooms & Beds', path: '/app/rooms', icon: 'single_bed' },
  { name: 'Tenant Profiles', path: '/app/tenants', icon: 'groups' },
  { name: 'Financial Ledger', path: '/app/financials', icon: 'receipt_long' },
  { name: 'Maintenance & Repairs', path: '/app/maintenance', icon: 'handyman' },
  { name: 'Semester & Leases', path: '/app/leases', icon: 'event_repeat' },
  { name: 'Security Deposits', path: '/app/deposits', icon: 'shield' },
  { name: 'Settings & Reminders', path: '/app/settings', icon: 'tune' }
]
</script>

<template>
  <div class="relative min-h-screen bg-surface text-on-surface font-body-md antialiased flex">
    <!-- Payment Modal Component -->
    <RecordPaymentModal 
      :is-open="isPaymentModalOpen" 
      @close="closePaymentModal" 
    />

    <!-- Supabase Auth Modal Component -->
    <AuthModal
      :is-open="isAuthModalOpen"
      :initial-role="currentRole || 'landlord'"
      @close="isAuthModalOpen = false"
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
        <router-link 
          to="/tenant/portal"
          @click="closeMobileMenu"
          class="flex items-center gap-3 px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-md text-xs font-semibold"
        >
          <span class="material-symbols-outlined text-[18px]">person_pin</span>
          <span>Tenant Portal Demo</span>
        </router-link>
        <router-link 
          to="/tenant/checkout"
          @click="closeMobileMenu"
          class="flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-md text-xs"
        >
          <span class="material-symbols-outlined text-[18px]">point_of_sale</span>
          <span>Pay Rent Checkout</span>
        </router-link>
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
            <!-- User Profile Avatar & Dropdown -->
            <div class="relative ml-2">
              <button 
                @click="isProfileDropdownOpen = !isProfileDropdownOpen"
                class="flex items-center gap-2 p-1 rounded-sm hover:bg-surface-container-low transition-colors border border-outline-variant"
              >
                <div class="w-8 h-8 rounded-[3px] bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                  {{ userProfile.name?.split(' ').map(n=>n[0]).join('').substring(0, 2) || 'MK' }}
                </div>
                <div class="hidden lg:flex flex-col text-left">
                  <span class="text-xs font-semibold text-on-surface leading-tight">{{ userProfile.name }}</span>
                  <span class="text-[10px] text-primary capitalize font-medium leading-none">{{ currentRole }}</span>
                </div>
                <span class="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
              </button>

              <!-- Profile Dropdown Menu -->
              <div 
                v-if="isProfileDropdownOpen"
                class="absolute right-0 mt-2 w-56 card-tight p-2 bg-surface-container-lowest shadow-xl border border-outline z-50 space-y-1 text-xs"
              >
                <div class="p-2 border-b border-outline-variant/60">
                  <p class="font-bold text-on-surface truncate">{{ userProfile.name }}</p>
                  <p class="font-data-mono text-[11px] text-on-surface-variant truncate">{{ userProfile.email }}</p>
                  <span class="badge-pill bg-primary-container text-primary text-[9px] mt-1 inline-flex uppercase tracking-wider font-bold">
                    {{ currentRole }} Portal
                  </span>
                </div>

                <button 
                  @click="openAuthModal"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-[3px] text-left text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span class="material-symbols-outlined text-[16px] text-primary">switch_account</span>
                  <span>Switch Account / Sign In</span>
                </button>

                <router-link
                  to="/app/settings"
                  @click="isProfileDropdownOpen = false"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-[3px] text-left text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span class="material-symbols-outlined text-[16px] text-on-surface-variant">settings</span>
                  <span>Settings & Reminders</span>
                </router-link>

                <div class="border-t border-outline-variant/60 pt-1">
                  <button 
                    @click="handleSignOut"
                    class="w-full flex items-center gap-2 px-3 py-2 rounded-[3px] text-left text-error hover:bg-error-container/40 transition-colors"
                  >
                    <span class="material-symbols-outlined text-[16px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
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
