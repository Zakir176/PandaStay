<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../lib/store'
import RecordPaymentModal from '../components/RecordPaymentModal.vue'

const route = useRoute()
const router = useRouter()
const { state, triggerWhatsAppReminder } = useStore()

const isPaymentModalOpen = ref(false)
const toastMessage = ref('')

const tenant = computed(() => {
  const t = state.tenants.find(item => item.id === route.params.id)
  return t || state.tenants[0]
})

const tenantBed = computed(() => {
  return state.bedSpaces.find(b => b.tenantId === tenant.value?.id || b.tenantName === tenant.value?.name)
})

const tenantPayments = computed(() => {
  return state.payments.filter(p => p.tenant_name === tenant.value?.name)
})

const sendReminder = () => {
  triggerWhatsAppReminder(tenant.value)
  toastMessage.value = `WhatsApp reminder dispatched to ${tenant.value.name}`
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
        <span class="material-symbols-outlined text-[18px]">chat</span>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <RecordPaymentModal 
      :is-open="isPaymentModalOpen" 
      @close="isPaymentModalOpen = false" 
    />

    <!-- Header Navigation Back -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-4">
      <div class="flex items-center gap-3">
        <router-link 
          to="/app/tenants" 
          class="btn-pill-outline text-xs inline-flex items-center gap-1.5 py-1 px-3"
        >
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Tenants</span>
        </router-link>
        <span class="text-outline">&bull;</span>
        <h2 class="text-xl font-bold text-on-surface">{{ tenant?.name }}</h2>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="sendReminder"
          class="btn-pill-outline text-xs inline-flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-[16px] text-primary">chat</span>
          Send WhatsApp Nudge
        </button>

        <button 
          @click="isPaymentModalOpen = true"
          class="btn-pill-primary text-xs inline-flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-[16px]">add_card</span>
          Record Payment
        </button>
      </div>
    </div>

    <!-- Tenant Details Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Profile Card -->
      <div class="card-bento p-5 bg-surface-container-lowest space-y-5">
        <div class="flex items-center gap-4 border-b border-outline-variant/50 pb-4">
          <div class="w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center border border-primary/20">
            {{ tenant?.name.split(' ').map(n=>n[0]).join('') }}
          </div>
          <div>
            <h3 class="font-bold text-base text-on-surface">{{ tenant?.name }}</h3>
            <p class="text-xs sm:text-sm text-on-surface-variant font-data-mono">{{ tenant?.phone }}</p>
            <span class="badge-pill bg-primary/15 text-primary text-xs mt-1.5 inline-flex font-bold">
              Active Tenancy
            </span>
          </div>
        </div>

        <div class="space-y-3.5 text-xs sm:text-sm">
          <div class="p-3 bg-surface-container-low rounded-xl">
            <span class="block text-xs uppercase font-bold text-on-surface-variant mb-0.5">Allocated Bed-Space</span>
            <span class="font-bold text-base text-primary">{{ tenant?.bed_label }}</span>
            <span class="text-on-surface-variant text-xs block mt-0.5">Room {{ tenant?.room_number }} &bull; Mukuba House</span>
          </div>

          <div>
            <span class="block text-xs uppercase font-bold text-on-surface-variant mb-0.5">Monthly Rent</span>
            <span class="font-data-mono font-bold text-sm text-on-surface">
              ZMW {{ Number(tenantBed?.rent_amount || 2500).toLocaleString() }}
            </span>
          </div>

          <div>
            <span class="block text-xs uppercase font-bold text-on-surface-variant mb-0.5">NRC / Student Identification</span>
            <span class="font-data-mono text-on-surface">{{ tenant?.id_number || '392819/11/1' }}</span>
          </div>

          <div>
            <span class="block text-xs uppercase font-bold text-on-surface-variant mb-0.5">Emergency Contact</span>
            <span class="font-medium text-on-surface block">{{ tenant?.emergency_contact_name }}</span>
            <span class="font-data-mono text-on-surface-variant">{{ tenant?.emergency_contact_phone }}</span>
          </div>
        </div>
      </div>

      <!-- Payment History & Ledger Paper -->
      <div class="card-bento p-5 bg-surface-container-lowest lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between border-b border-outline-variant/50 pb-3">
          <div>
            <h3 class="font-bold text-base text-on-surface">Tenancy Payment Ledger</h3>
            <p class="text-xs sm:text-sm text-on-surface-variant">Recorded payments and official receipts for {{ tenant?.name }}</p>
          </div>
          <span class="badge-pill bg-surface-container text-on-surface-variant text-xs font-data-mono font-semibold">
            {{ tenantPayments.length }} Receipts
          </span>
        </div>

        <div v-if="tenantPayments.length > 0" class="overflow-x-auto">
          <table class="w-full text-left text-sm font-data-mono">
            <thead>
              <tr class="border-b border-outline-variant/60 text-xs uppercase font-bold text-on-surface-variant bg-surface-container-low/60">
                <th class="py-2.5 px-3">Receipt No</th>
                <th class="py-2.5 px-3">Date</th>
                <th class="py-2.5 px-3">Channel</th>
                <th class="py-2.5 px-3">Gateway Ref</th>
                <th class="py-2.5 px-3 text-right">Amount</th>
                <th class="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/40">
              <tr v-for="p in tenantPayments" :key="p.id" class="hover:bg-surface-container-lowest transition-colors">
                <td class="py-2.5 px-3 font-bold text-primary">{{ p.receipt_number }}</td>
                <td class="py-2.5 px-3 text-on-surface-variant">{{ p.paid_at }}</td>
                <td class="py-2.5 px-3">{{ p.method_label || 'Mobile Money' }}</td>
                <td class="py-2.5 px-3 text-xs text-on-surface-variant">{{ p.gateway_reference }}</td>
                <td class="py-2.5 px-3 font-bold text-right text-on-surface">ZMW {{ Number(p.amount).toLocaleString() }}</td>
                <td class="py-2.5 px-3 text-right">
                  <span class="badge-pill bg-primary/15 text-primary text-xs font-bold">Paid</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-8 text-on-surface-variant text-xs">
          No past payments recorded for this tenancy yet.
        </div>
      </div>
    </div>
  </div>
</template>
