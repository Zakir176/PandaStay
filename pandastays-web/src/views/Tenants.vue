<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../lib/store'
import RecordPaymentModal from '../components/RecordPaymentModal.vue'

const router = useRouter()
const { state, triggerWhatsAppReminder } = useStore()

const searchQuery = ref('')
const isPaymentModalOpen = ref(false)
const toastMessage = ref('')

const filteredTenants = computed(() => {
  if (!searchQuery.value) return state.tenants
  const q = searchQuery.value.toLowerCase()
  return state.tenants.filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.phone.toLowerCase().includes(q) || 
    t.bed_label?.toLowerCase().includes(q) ||
    t.room_number?.includes(q)
  )
})

const sendReminder = (tenant) => {
  triggerWhatsAppReminder(tenant)
  toastMessage.value = `WhatsApp reminder dispatched to ${tenant.name}`
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

const goToProfile = (tenantId) => {
  router.push(`/app/tenants/${tenantId}`)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Live Toast -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div 
        v-if="toastMessage" 
        class="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-sm shadow-md text-xs font-medium"
      >
        <span class="material-symbols-outlined text-[18px]">chat</span>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <RecordPaymentModal 
      :is-open="isPaymentModalOpen" 
      @close="isPaymentModalOpen = false" 
    />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-medium">
          <span>{{ state.currentProperty.name }}</span>
          <span>&bull;</span>
          <span class="text-primary font-semibold">Active Tenants</span>
        </div>
        <h2 class="text-2xl font-bold text-on-surface tracking-tight">Tenant Directory</h2>
        <p class="text-xs text-on-surface-variant mt-0.5">
          Each tenant is assigned to an individual bed-space tenancy with verified emergency contacts.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <router-link
          to="/app/rooms"
          class="btn-pill-primary text-xs"
        >
          <span class="material-symbols-outlined text-[16px]">person_add</span>
          Assign New Bed-Space
        </router-link>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-3.5 card-bento">
      <div class="relative flex-1 min-w-60 max-w-md">
        <span class="material-symbols-outlined absolute left-3.5 top-2.5 text-on-surface-variant text-[18px]">search</span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by name, room, bed-space, or phone..."
          class="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none transition-all"
        />
      </div>

      <div class="text-xs text-on-surface-variant font-data-mono flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-primary inline-block"></span>
        <span>{{ filteredTenants.length }} Active Tenancies</span>
      </div>
    </div>

    <!-- Tenant Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div 
        v-for="tenant in filteredTenants" 
        :key="tenant.id"
        class="card-bento p-5 bg-surface-container-lowest flex flex-col justify-between hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
        @click="goToProfile(tenant.id)"
      >
        <div>
          <!-- Top Row: Avatar & Room Pill -->
          <div class="flex items-start justify-between gap-2 border-b border-outline-variant/50 pb-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-primary/20">
                {{ tenant.name.split(' ').map(n=>n[0]).join('') }}
              </div>
              <div>
                <h3 class="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                  {{ tenant.name }}
                </h3>
                <p class="text-xs text-on-surface-variant font-data-mono">
                  {{ tenant.phone }}
                </p>
              </div>
            </div>

            <span class="badge-pill bg-surface-container-high text-on-surface-variant text-xs font-bold">
              Room {{ tenant.room_number }}
            </span>
          </div>

          <!-- Tenancy Specs -->
          <div class="space-y-2 text-xs sm:text-sm">
            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant">Allocated Bed:</span>
              <span class="font-bold text-primary">{{ tenant.bed_label }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant">NRC / Student ID:</span>
              <span class="font-data-mono text-on-surface-variant">{{ tenant.id_number || '392819/11/1' }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant">Emergency:</span>
              <span class="text-on-surface font-medium truncate max-w-37.5">{{ tenant.emergency_contact_name }}</span>
            </div>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="mt-4 pt-3 border-t border-outline-variant/50 flex items-center justify-between gap-2">
          <button 
            @click.stop="sendReminder(tenant)"
            class="flex items-center gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[15px]">send</span>
            WhatsApp Nudge
          </button>

          <span class="text-xs font-semibold text-on-surface-variant group-hover:text-primary transition-colors flex items-center gap-1">
            <span>Profile</span>
            <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
