<script setup>
import { ref } from 'vue'
import { useStore } from '../lib/store'

const { state } = useStore()

const currentTerm = ref('Semester 1 (Jan - June 2026)')
const nextTerm = ref('Semester 2 (July - Dec 2026)')
const toastMessage = ref('')

const renewLease = (tenant) => {
  toastMessage.value = `Lease renewal agreement drafted for ${tenant.name} (${tenant.bed_label})`
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

const endLease = (tenant) => {
  tenant.status = 'ended'
  // Free the bed
  const targetBed = state.bedSpaces.find(b => b.tenantId === tenant.id || b.tenantName === tenant.name)
  if (targetBed) {
    targetBed.status = 'vacant'
    targetBed.tenantName = null
    targetBed.tenantId = null
    targetBed.paymentStatus = null
  }
  toastMessage.value = `Tenancy ended for ${tenant.name}. ${tenant.bed_label} is now marked Vacant!`
  setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
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
        <span class="material-symbols-outlined text-[18px]">event_repeat</span>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-medium">
          <span>{{ state.currentProperty.name }}</span>
          <span>&bull;</span>
          <span class="text-primary font-semibold">Academic Calendar Management</span>
        </div>
        <h2 class="text-2xl font-bold text-on-surface tracking-tight">Semester & Lease Transitions</h2>
        <p class="text-xs text-on-surface-variant mt-0.5">
          Manage term rollovers, lease renewals, and automatic bed-space vacation at semester end.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="badge-pill bg-primary-container text-primary text-xs font-data-mono font-medium">
          {{ currentTerm }}
        </span>
      </div>
    </div>

    <!-- Term Rollover Banner Card -->
    <div class="card-tight p-5 bg-surface-container-lowest card-accent-paid flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-sm bg-primary-container text-primary flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-2xl">event_available</span>
        </div>
        <div>
          <h3 class="font-bold text-sm text-on-surface">Upcoming Semester Transition Rollover</h3>
          <p class="text-xs text-on-surface-variant mt-0.5">
            Current term ends <strong>June 30, 2026</strong>. Check student renewal intents before releasing vacant bed-spaces to new incoming applicants.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button 
          @click="toastMessage = 'Batch renewal notices sent to all 6 active tenants!'"
          class="px-3.5 py-2 bg-primary text-on-primary text-xs font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-xs"
        >
          Send Bulk Term Renewal Notices
        </button>
      </div>
    </div>

    <!-- Active Leases Rollover Table -->
    <div class="card-tight p-5 bg-surface-container-lowest space-y-4">
      <div class="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h3 class="font-bold text-sm text-on-surface">Active Student Leases & Bed Allocations</h3>
          <p class="text-xs text-on-surface-variant">Ending a tenancy immediately marks the bed-space as Vacant on the floorplan.</p>
        </div>
        <span class="text-xs text-on-surface-variant font-data-mono">
          {{ state.tenants.filter(t => t.status === 'active').length }} Active Tenancies
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-outline-variant text-[10px] uppercase font-bold text-on-surface-variant bg-surface-container-low/60">
              <th class="py-2.5 px-3">Student Tenant</th>
              <th class="py-2.5 px-3">Bed Allocation</th>
              <th class="py-2.5 px-3">Term Start</th>
              <th class="py-2.5 px-3">Term End</th>
              <th class="py-2.5 px-3">Rent / Month</th>
              <th class="py-2.5 px-3">Tenancy Status</th>
              <th class="py-2.5 px-3 text-right">Lease Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/60">
            <tr 
              v-for="tenant in state.tenants" 
              :key="tenant.id"
              class="hover:bg-surface-container-low/40 transition-colors"
            >
              <td class="py-3 px-3 font-semibold text-on-surface">
                {{ tenant.name }}
              </td>
              <td class="py-3 px-3 text-on-surface font-medium">
                {{ tenant.bed_label }}
              </td>
              <td class="py-3 px-3 font-data-mono text-on-surface-variant">
                Jan 05, 2026
              </td>
              <td class="py-3 px-3 font-data-mono text-on-surface-variant">
                Dec 15, 2026
              </td>
              <td class="py-3 px-3 font-data-mono font-bold text-on-surface">
                ZMW 2,500
              </td>
              <td class="py-3 px-3">
                <span 
                  class="badge-pill text-[10px]"
                  :class="tenant.status === 'active' ? 'bg-primary-container text-primary font-semibold' : 'bg-surface-container text-on-surface-variant'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="tenant.status === 'active' ? 'bg-primary' : 'bg-outline'"></span>
                  <span>{{ tenant.status === 'active' ? 'Active Lease' : 'Ended (Vacated)' }}</span>
                </span>
              </td>
              <td class="py-3 px-3 text-right space-x-2">
                <button 
                  v-if="tenant.status === 'active'"
                  @click="renewLease(tenant)"
                  class="px-2.5 py-1 text-xs text-primary bg-primary-container hover:bg-primary hover:text-on-primary rounded-sm transition-colors font-medium"
                >
                  Renew
                </button>
                <button 
                  v-if="tenant.status === 'active'"
                  @click="endLease(tenant)"
                  class="px-2.5 py-1 text-xs text-error bg-error-container hover:bg-error hover:text-on-error rounded-sm transition-colors font-medium"
                >
                  End Tenancy
                </button>
                <span v-else class="text-on-surface-variant text-[11px] italic">
                  Bed Released
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
