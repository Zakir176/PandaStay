<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth, initAuth } from '../lib/auth'
import { useStore } from '../lib/store'
import { AuthModal } from '../components'
import { getInitials } from '../utils/formatters'

const router = useRouter()
const route = useRoute()
const { userProfile, currentRole, signOut } = useAuth()
const { state } = useStore()

const isProfileDropdownOpen = ref(false)
const isAuthModalOpen = ref(false)
const isMobileMenuOpen = ref(false)

onMounted(() => {
  initAuth()
})

// Current student tenant strictly isolated
const currentTenant = computed(() => {
  if (currentRole.value === 'tenant' && userProfile.value?.id) {
    const match = state.tenants.find(t => t.id === userProfile.value.id || t.email === userProfile.value.email || t.name === userProfile.value.name)
    if (match) return match
  }
  return state.tenants[0] || {
    id: 'demo-tenant',
    name: 'John Phiri',
    email: 'john.phiri@unza.zm',
    phone: '+260 97 1122334',
    bed_label: 'Bed 101-A (Window)',
    room_number: '101'
  }
})

// Current student's allocated bed space
const currentBed = computed(() => {
  if (!currentTenant.value) return null
  return state.bedSpaces.find(b => b.tenantId === currentTenant.value.id || b.tenantName === currentTenant.value.name) || state.bedSpaces[0]
})

// Student initials for avatar
const tenantInitials = computed(() => getInitials(currentTenant.value?.name))

const handleSignOut = async () => {
  await signOut()
  isProfileDropdownOpen.value = false
  router.push('/')
}



const navItems = [
  { name: 'My Bed & Room', path: '/tenant/portal', icon: 'bed' },
  { name: 'Rent & Payments', path: '/tenant/payments', icon: 'receipt_long' },
  { name: 'Maintenance', path: '/tenant/maintenance', icon: 'handyman' },
  { name: 'My Lease & Rules', path: '/tenant/lease', icon: 'gavel' }
]

const isActive = (path) => route.path === path
</script>

<template>
  <div class="min-h-screen bg-surface-dim/40 flex flex-col text-on-surface">
    <!-- Auth Modal -->
    <AuthModal
      :is-open="isAuthModalOpen"
      initial-role="tenant"
      @close="isAuthModalOpen = false"
    />

    <!-- Dedicated Resident Portal Header -->
    <header class="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border-card shadow-xs">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        <!-- Left: Brand Logo & Identity -->
        <router-link to="/tenant/portal" class="flex items-center gap-3 shrink-0">
          <div class="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
            PS
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-base text-on-surface tracking-tight">PandaStays</span>
              <span class="badge-pill bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                Resident Portal
              </span>
            </div>
            <p class="text-xs text-on-surface-variant leading-none hidden sm:block mt-0.5">
              {{ state.currentProperty?.name || 'Mukuba House' }} &bull; Student Housing
            </p>
          </div>
        </router-link>

        <!-- Center: Primary Nav Tabs (Desktop) -->
        <nav class="hidden md:flex items-center gap-1 bg-surface-dim/70 p-1 rounded-full border border-border-card text-sm">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5"
            :class="isActive(item.path) 
              ? 'bg-primary text-white shadow-xs' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-dim'"
          >
            <span class="material-symbols-outlined text-[17px]">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </router-link>
        </nav>

        <!-- Right: Student Profile & Switcher -->
        <div class="flex items-center gap-2.5">
          <!-- Quick MoMo Pay Button -->
          <router-link
            to="/tenant/checkout"
            class="btn-pill-primary py-1.5 px-3.5 text-sm hidden sm:inline-flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[16px]">point_of_sale</span>
            <span>Pay Rent</span>
          </router-link>

          <!-- Resident User Dropdown Button -->
          <div class="relative">
            <button
              @click="isProfileDropdownOpen = !isProfileDropdownOpen"
              class="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-full border border-border-card bg-surface hover:bg-surface-dim transition-colors"
            >
              <div class="w-7 h-7 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center">
                {{ tenantInitials }}
              </div>
              <div class="hidden sm:flex flex-col text-left">
                <span class="text-sm font-semibold text-on-surface leading-tight truncate max-w-28">
                  {{ currentTenant?.name || 'Student' }}
                </span>
                <span class="text-xs text-on-surface-variant font-data-mono leading-none">
                  {{ currentBed?.shortLabel || 'Bed 101-A' }}
                </span>
              </div>
              <span class="material-symbols-outlined text-[16px] text-on-surface-muted">expand_more</span>
            </button>

            <!-- Backdrop -->
            <div
              v-if="isProfileDropdownOpen"
              @click="isProfileDropdownOpen = false"
              class="fixed inset-0 z-40 bg-transparent"
            ></div>

            <!-- Profile Dropdown -->
            <div
              v-if="isProfileDropdownOpen"
              class="absolute top-full right-0 mt-2 w-64 bg-surface rounded-2xl shadow-2xl border border-border-card p-2.5 z-50 space-y-1 text-sm"
            >
              <div class="p-2.5 border-b border-border-card">
                <p class="font-bold text-sm text-on-surface truncate">{{ currentTenant?.name }}</p>
                <p class="font-data-mono text-xs text-on-surface-variant truncate">{{ currentTenant?.email }}</p>
                <div class="mt-1.5 flex items-center gap-1.5">
                  <span class="badge-pill bg-primary/10 text-primary border border-primary/20 text-xs">
                    Room {{ currentTenant?.room_number || '101' }}
                  </span>
                  <span class="badge-pill bg-surface-dim text-on-surface-variant border border-border-card text-xs">
                    {{ currentBed?.label || 'Bed Space' }}
                  </span>
                </div>
              </div>

              <!-- Quick Links -->
              <router-link
                to="/tenant/payments"
                @click="isProfileDropdownOpen = false"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-on-surface hover:bg-surface-dim transition-colors"
              >
                <span class="material-symbols-outlined text-[18px] text-primary">receipt_long</span>
                <span>Payment Receipts</span>
              </router-link>

              <router-link
                to="/tenant/maintenance"
                @click="isProfileDropdownOpen = false"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-on-surface hover:bg-surface-dim transition-colors"
              >
                <span class="material-symbols-outlined text-[18px] text-primary">handyman</span>
                <span>Maintenance Tickets</span>
              </router-link>

              <div class="border-t border-border-card pt-1">


                <button
                  @click="handleSignOut"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-error hover:bg-error/10 transition-colors"
                >
                  <span class="material-symbols-outlined text-[18px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Menu Trigger -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden w-8 h-8 rounded-lg flex items-center justify-center border border-border-card text-on-surface-variant"
          >
            <span class="material-symbols-outlined text-[20px]">
              {{ isMobileMenuOpen ? 'close' : 'menu' }}
            </span>
          </button>
        </div>

      </div>

      <!-- Mobile Navigation Drawer -->
      <div 
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-border-card bg-surface px-4 py-3 space-y-1 text-sm"
      >
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-colors"
          :class="isActive(item.path) ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-dim'"
        >
          <span class="material-symbols-outlined text-[18px]">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </router-link>

        <div class="pt-2 border-t border-border-card">
          <router-link
            to="/tenant/checkout"
            @click="isMobileMenuOpen = false"
            class="btn-pill-primary w-full justify-center py-2 text-sm"
          >
            <span class="material-symbols-outlined text-[16px]">point_of_sale</span>
            <span>Pay Rent with MoMo</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content Outlet for Tenant Views -->
    <main class="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6">
      <router-view />
    </main>

    <!-- Resident Portal Footer -->
    <footer class="border-t border-border-card bg-surface py-6 text-center text-xs text-on-surface-variant">
      <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm text-on-surface">PandaStays</span>
          <span>&bull;</span>
          <span class="text-xs">Resident Portal for {{ state.currentProperty?.name || 'Mukuba House' }}</span>
        </div>
        <p class="text-xs text-on-surface-muted">
          Need assistance? Contact property management via WhatsApp or submit a maintenance ticket.
        </p>
      </div>
    </footer>
  </div>
</template>
