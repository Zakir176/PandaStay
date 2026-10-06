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
const searchQuery = ref('')

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

const managementNav = [
  { name: 'Dashboard', path: '/app', icon: 'grid_view' },
  { name: 'Rooms & Beds', path: '/app/rooms', icon: 'bed' },
  { name: 'Tenant Profiles', path: '/app/tenants', icon: 'group' },
  { name: 'Financial Ledger', path: '/app/financials', icon: 'receipt_long' }
]

const operationsNav = [
  { name: 'Maintenance & Repairs', path: '/app/maintenance', icon: 'handyman' },
  { name: 'Semester & Leases', path: '/app/leases', icon: 'date_range' },
  { name: 'Security Deposits', path: '/app/deposits', icon: 'shield' },
  { name: 'Settings & Reminders', path: '/app/settings', icon: 'tune' }
]
</script>

<template>
  <div class="relative min-h-screen bg-background text-on-surface antialiased flex">
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
      class="fixed inset-0 bg-hero-dark/40 z-40 md:hidden backdrop-blur-xs"
    ></div>

    <!-- Left Sidebar (Clean Bento Rail ~250px) -->
    <aside 
      class="flex flex-col fixed left-0 top-0 h-full w-[250px] bg-surface border-r border-border-card z-50 py-5 px-3.5 transition-transform duration-300 md:translate-x-0"
      :class="isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'"
    >
      <!-- Brand Logo Header -->
      <div class="flex items-center justify-between mb-6 px-2">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-primary shadow-xs">
            <span class="material-symbols-outlined text-[20px]">holiday_village</span>
          </div>
          <div>
            <h1 class="text-base font-bold text-on-surface tracking-tight leading-none">PandaStays</h1>
            <p class="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mt-0.5">Boarding Portal</p>
          </div>
        </div>
        <button @click="closeMobileMenu" class="md:hidden text-on-surface-variant hover:text-on-surface p-1">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Navigation Sections -->
      <div class="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
        <!-- Section 1: Management -->
        <div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted px-3 mb-1.5">Management</p>
          <nav class="flex flex-col gap-1">
            <router-link 
              v-for="item in managementNav" 
              :key="item.path" 
              :to="item.path" 
              @click="closeMobileMenu"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150"
              :class="($route.path === item.path || (item.path === '/app' && $route.path === '/app/')) 
                ? 'bg-primary-container text-primary font-semibold shadow-xs' 
                : 'text-on-surface-variant hover:bg-surface-dim hover:text-on-surface'"
            >
              <span class="material-symbols-outlined text-[19px]">{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </router-link>
          </nav>
        </div>

        <!-- Section 2: Operations -->
        <div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted px-3 mb-1.5">Operations</p>
          <nav class="flex flex-col gap-1">
            <router-link 
              v-for="item in operationsNav" 
              :key="item.path" 
              :to="item.path" 
              @click="closeMobileMenu"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150"
              :class="($route.path === item.path) 
                ? 'bg-primary-container text-primary font-semibold shadow-xs' 
                : 'text-on-surface-variant hover:bg-surface-dim hover:text-on-surface'"
            >
              <span class="material-symbols-outlined text-[19px]">{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </router-link>
          </nav>
        </div>
      </div>

      <!-- Docked Bottom Widget: Topographic Lenco MoMo Gateway -->
      <div class="mt-auto pt-3 border-t border-border-card space-y-2">
        <div class="card-bento-hero bg-topo-dark p-3 text-white">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-white/70">Gateway</span>
            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary-accent/20 text-primary-accent text-[9px] font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-accent animate-pulse"></span>
              Live
            </span>
          </div>
          <p class="text-xs font-semibold mt-1">Lenco MoMo Gateway</p>
          <p class="text-[10px] text-white/60">MTN &bull; Airtel &bull; Zamtel Push</p>
        </div>

        <!-- Quick Tenant View Links -->
        <div class="flex items-center gap-1.5">
          <router-link 
            to="/tenant/portal"
            @click="closeMobileMenu"
            class="flex-1 flex items-center justify-center gap-1 py-1.5 bg-surface-dim text-on-surface-variant hover:text-primary transition-colors rounded-lg text-[11px] font-semibold"
          >
            <span class="material-symbols-outlined text-[15px]">badge</span>
            <span>Tenant View</span>
          </router-link>
          <router-link 
            to="/tenant/checkout"
            @click="closeMobileMenu"
            class="flex-1 flex items-center justify-center gap-1 py-1.5 bg-surface-dim text-on-surface-variant hover:text-primary transition-colors rounded-lg text-[11px] font-semibold"
          >
            <span class="material-symbols-outlined text-[15px]">point_of_sale</span>
            <span>Pay Rent</span>
          </router-link>
        </div>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex flex-col md:ml-[250px] min-h-screen w-full md:w-[calc(100%-250px)]">
      <!-- TopNavBar Header (Clean White Bento Header) -->
      <header class="flex justify-between items-center w-full px-4 md:px-6 py-3 h-16 bg-surface border-b border-border-card sticky top-0 z-40">
        <!-- Left: Mobile Trigger & Search Capsule -->
        <div class="flex items-center gap-3 flex-1 max-w-md">
          <button @click="toggleMobileMenu" class="md:hidden text-on-surface-variant hover:text-on-surface p-1">
            <span class="material-symbols-outlined text-[22px]">menu</span>
          </button>

          <!-- Central Capsule Search Input -->
          <div class="relative w-full">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-muted pointer-events-none">
              search
            </span>
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search rooms, beds, tenants..."
              class="w-full pl-9 pr-10 py-1.5 bg-surface-dim border border-border-card rounded-full text-xs text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:border-primary focus:bg-surface transition-colors"
            />
            <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-surface border border-border-card text-on-surface-muted pointer-events-none">
              ⌘K
            </span>
          </div>
        </div>

        <!-- Right Utility Cluster -->
        <div class="flex items-center gap-3 pl-3">
          <!-- Primary CTA: Record Payment Pill Button -->
          <button 
            @click="openPaymentModal"
            class="btn-pill-primary hidden sm:inline-flex"
          >
            <span class="material-symbols-outlined text-[16px]">add_card</span>
            <span>Record Payment</span>
          </button>

          <!-- Notification Bell -->
          <button class="relative w-9 h-9 rounded-full border border-border-card bg-surface hover:bg-surface-dim text-on-surface-variant flex items-center justify-center transition-colors">
            <span class="material-symbols-outlined text-[18px]">notifications</span>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface"></span>
          </button>

          <!-- Landlord Profile Avatar Capsule -->
          <div class="relative">
            <button 
              @click="isProfileDropdownOpen = !isProfileDropdownOpen"
              class="flex items-center gap-2 px-2 py-1.5 rounded-full border border-border-card hover:bg-surface-dim transition-colors bg-surface"
            >
              <div class="w-7 h-7 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {{ userProfile.name?.split(' ').map(n=>n[0]).join('').substring(0, 2) || 'MK' }}
              </div>
              <div class="hidden lg:flex flex-col text-left pr-1">
                <span class="text-xs font-semibold text-on-surface leading-tight">{{ userProfile.name }}</span>
                <span class="text-[10px] text-on-surface-variant capitalize leading-none">Mukuba House</span>
              </div>
              <span class="material-symbols-outlined text-[16px] text-on-surface-muted">expand_more</span>
            </button>

            <!-- Profile Dropdown Menu -->
            <div 
              v-if="isProfileDropdownOpen"
              class="absolute right-0 mt-2 w-56 card-bento p-2 shadow-xl border border-border-card z-50 space-y-1 text-xs"
            >
              <div class="p-2 border-b border-border-card">
                <p class="font-bold text-on-surface truncate">{{ userProfile.name }}</p>
                <p class="font-data-mono text-[11px] text-on-surface-variant truncate">{{ userProfile.email }}</p>
                <span class="badge-pill bg-primary-container text-primary text-[9px] mt-1 inline-flex uppercase tracking-wider font-bold">
                  {{ currentRole }} Account
                </span>
              </div>

              <button 
                @click="openAuthModal"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-on-surface hover:bg-surface-dim transition-colors"
              >
                <span class="material-symbols-outlined text-[16px] text-primary">switch_account</span>
                <span>Switch Account / Sign In</span>
              </button>

              <router-link
                to="/app/settings"
                @click="isProfileDropdownOpen = false"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-on-surface hover:bg-surface-dim transition-colors"
              >
                <span class="material-symbols-outlined text-[16px] text-on-surface-variant">settings</span>
                <span>Settings & Reminders</span>
              </router-link>

              <div class="border-t border-border-card pt-1">
                <button 
                  @click="handleSignOut"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-error hover:bg-error-container/40 transition-colors"
                >
                  <span class="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Router Outlet -->
      <main class="flex-1 p-4 md:p-6 max-w-container-max mx-auto w-full">
        <router-view />
      </main>
    </div>
  </div>
</template>
