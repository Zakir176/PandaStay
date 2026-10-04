<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../lib/store'

const { state } = useStore()

const statusFilter = ref('All')
const selectedDeposit = ref(null)
const toastMessage = ref('')

const totalDeposits = computed(() => {
  return state.tenants.reduce((sum, t) => sum + (t.deposit_amount || 1250), 0)
})

const filteredTenants = computed(() => {
  if (statusFilter.value === 'All') return state.tenants
  return state.tenants.filter(t => t.deposit_status === statusFilter.value.toLowerCase())
})

const refundDeposit = (tenant) => {
  tenant.deposit_status = 'refunded'
  toastMessage.value = `Deposit refund of ZMW ${tenant.deposit_amount || 1250} logged for ${tenant.name}`
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
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
        <span class="material-symbols-outlined text-[18px]">verified</span>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-medium">
          <span>{{ state.currentProperty.name }}</span>
          <span>&bull;</span>
          <span class="text-primary font-semibold">Security Escrow</span>
        </div>
        <h2 class="text-2xl font-bold text-on-surface tracking-tight">Security Deposit Escrow</h2>
        <p class="text-xs text-on-surface-variant mt-0.5">
          Tenant security deposits held in escrow against damages, key replacement, and move-out inspections.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="badge-pill bg-primary-container text-primary text-xs font-data-mono">
          Escrow Account: Active
        </span>
      </div>
    </div>

    <!-- Summary Metrics (Tight 4px radius, 3px solid accent bars) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card-tight p-4 bg-surface-container-lowest card-accent-paid">
        <p class="text-xs text-on-surface-variant font-medium">Total Escrow Funds Held</p>
        <p class="text-2xl font-bold font-data-mono text-primary mt-1">
          ZMW {{ totalDeposits.toLocaleString() }}
        </p>
        <p class="text-[11px] text-on-surface-variant mt-1">Protected in landlord escrow wallet</p>
      </div>

      <div class="card-tight p-4 bg-surface-container-lowest card-accent-partial">
        <p class="text-xs text-on-surface-variant font-medium">Active Tenancy Deposits</p>
        <p class="text-2xl font-bold font-data-mono text-tertiary mt-1">
          {{ state.tenants.length }} Units
        </p>
        <p class="text-[11px] text-on-surface-variant mt-1">1 deposit per allocated bed-space</p>
      </div>

      <div class="card-tight p-4 bg-surface-container-lowest card-accent-neutral">
        <p class="text-xs text-on-surface-variant font-medium">Inspection Status</p>
        <p class="text-2xl font-bold font-data-mono text-on-surface mt-1">100% In Good Standing</p>
        <p class="text-[11px] text-on-surface-variant mt-1">No outstanding damages recorded</p>
      </div>
    </div>

    <!-- Escrow Ledger Table -->
    <div class="receipt-paper rounded-sm p-5 border border-outline-variant space-y-4">
      <div class="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h3 class="font-bold text-sm text-on-surface font-data-mono uppercase">
            Mukuba House — Security Deposit Escrow Register
          </h3>
          <p class="text-xs text-on-surface-variant">Each student pays 50% term rate deposit on move-in</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-data-mono">
          <thead>
            <tr class="border-b border-outline text-on-surface-variant uppercase text-[10px] font-bold bg-surface-container-low/70">
              <th class="py-2.5 px-3">Tenant Name</th>
              <th class="py-2.5 px-3">Bed Allocation</th>
              <th class="py-2.5 px-3">NRC ID</th>
              <th class="py-2.5 px-3 text-right">Deposit Held</th>
              <th class="py-2.5 px-3">Escrow Status</th>
              <th class="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/60">
            <tr 
              v-for="t in filteredTenants" 
              :key="t.id"
              class="hover:bg-surface-container-low/40 transition-colors"
            >
              <td class="py-3 px-3 font-semibold text-on-surface">
                {{ t.name }}
              </td>
              <td class="py-3 px-3 text-on-surface-variant">
                {{ t.bed_label }} (Room {{ t.room_number }})
              </td>
              <td class="py-3 px-3 text-on-surface-variant">
                {{ t.id_number || '392819/11/1' }}
              </td>
              <td class="py-3 px-3 font-bold text-right text-on-surface">
                ZMW {{ (t.deposit_amount || 1250).toLocaleString() }}
              </td>
              <td class="py-3 px-3">
                <span 
                  class="badge-pill text-[10px]"
                  :class="t.deposit_status === 'refunded' ? 'bg-surface-container text-on-surface-variant' : 'bg-primary-container text-primary'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="t.deposit_status === 'refunded' ? 'bg-outline' : 'bg-primary'"></span>
                  <span>{{ t.deposit_status === 'refunded' ? 'Refunded' : 'Held in Escrow' }}</span>
                </span>
              </td>
              <td class="py-3 px-3 text-right">
                <button 
                  v-if="t.deposit_status !== 'refunded'"
                  @click="refundDeposit(t)"
                  class="px-2.5 py-1 text-xs text-primary bg-primary-container hover:bg-primary hover:text-on-primary rounded-sm transition-colors font-medium"
                >
                  Process Refund
                </button>
                <span v-else class="text-on-surface-variant text-[11px] italic">
                  Cleared on Move-Out
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
