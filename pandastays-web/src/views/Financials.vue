<script setup>
import { ref, computed } from 'vue'
import { useStore, occupancyStats } from '../lib/store'
import RecordPaymentModal from '../components/RecordPaymentModal.vue'
import ReceiptVoucherModal from '../components/ReceiptVoucherModal.vue'

const { state } = useStore()

const methodFilter = ref('All')
const isPaymentModalOpen = ref(false)
const selectedReceipt = ref(null)

const filteredPayments = computed(() => {
  if (methodFilter.value === 'All') return state.payments
  return state.payments.filter(p => p.method?.includes(methodFilter.value.toLowerCase()))
})

const viewReceipt = (payment) => {
  selectedReceipt.value = payment
}
</script>

<template>
  <div class="space-y-6">
    <!-- Payment Modal Component -->
    <RecordPaymentModal 
      :is-open="isPaymentModalOpen" 
      @close="isPaymentModalOpen = false" 
    />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-medium">
          <span>{{ state.currentProperty.name }}</span>
          <span>&bull;</span>
          <span class="text-primary font-semibold">Lenco Sub-Account: {{ state.currentLandlord.lenco_subaccount_id }}</span>
        </div>
        <h2 class="text-2xl font-bold text-on-surface tracking-tight">Financial Ledger & Receipts</h2>
        <p class="text-xs text-on-surface-variant mt-0.5">
          Audited payment records with automatic receipt issuance and gateway reconciliation.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="isPaymentModalOpen = true"
          class="flex items-center gap-2 px-3.5 py-2 bg-primary text-on-primary text-xs font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-xs"
        >
          <span class="material-symbols-outlined text-[18px]">add_card</span>
          Record New Payment
        </button>
      </div>
    </div>

    <!-- Summary Metrics Cards (tight 4px radius, 3px solid accent bars) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card-tight p-4 bg-surface-container-lowest card-accent-paid">
        <div class="flex items-center justify-between text-on-surface-variant">
          <span class="text-xs font-semibold uppercase tracking-wider">Total Rent Collected</span>
          <span class="badge-pill bg-primary-container text-primary text-[10px]">Active Term</span>
        </div>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-3xl font-bold font-data-mono text-primary">
            ZMW {{ occupancyStats.totalRentCollected.toLocaleString() }}
          </span>
        </div>
        <p class="text-[11px] text-on-surface-variant mt-1">Reconciled via Lenco Payment Gateway</p>
      </div>

      <div class="card-tight p-4 bg-surface-container-lowest card-accent-overdue">
        <div class="flex items-center justify-between text-on-surface-variant">
          <span class="text-xs font-semibold uppercase tracking-wider text-error">Outstanding Balance</span>
          <span class="badge-pill bg-error-container text-error text-[10px]">Overdue/Partial</span>
        </div>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-3xl font-bold font-data-mono text-error">
            ZMW {{ occupancyStats.overdueRent.toLocaleString() }}
          </span>
        </div>
        <p class="text-[11px] text-on-surface-variant mt-1">Nudge reminders queued via WhatsApp</p>
      </div>

      <div class="card-tight p-4 bg-surface-container-lowest card-accent-neutral">
        <div class="flex items-center justify-between text-on-surface-variant">
          <span class="text-xs font-semibold uppercase tracking-wider">Total Transactions</span>
          <span class="badge-pill bg-surface-container text-on-surface-variant text-[10px]">Verified</span>
        </div>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-3xl font-bold font-data-mono text-on-surface">
            {{ state.payments.length }} Receipts
          </span>
        </div>
        <p class="text-[11px] text-on-surface-variant mt-1">100% digital audit trail</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-3 card-tight">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-on-surface-variant mr-1">Method:</span>
        <button 
          v-for="m in ['All', 'MTN', 'Airtel', 'Zamtel']" 
          :key="m"
          @click="methodFilter = m"
          class="px-3 py-1.5 rounded-sm text-xs font-medium transition-colors"
          :class="methodFilter === m ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'"
        >
          {{ m }}
        </button>
      </div>

      <div class="text-xs text-on-surface-variant font-data-mono">
        Showing {{ filteredPayments.length }} entries
      </div>
    </div>

    <!-- The Ledger Paper Container -->
    <div class="receipt-paper rounded-sm p-5 border border-outline-variant space-y-4">
      <div class="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h3 class="font-bold text-sm text-on-surface font-data-mono tracking-wide uppercase">
            PandaStays Central Rent Register — 2026
          </h3>
          <p class="text-xs text-on-surface-variant">
            Property: {{ state.currentProperty.name }} &bull; Lusaka, Zambia
          </p>
        </div>
        <span class="badge-pill bg-primary-container text-primary font-data-mono text-xs">
          STK PUSH ROUTED
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-data-mono">
          <thead>
            <tr class="border-b border-outline text-on-surface-variant uppercase text-[10px] font-bold bg-surface-container-low/70">
              <th class="py-2.5 px-3">Receipt No.</th>
              <th class="py-2.5 px-3">Date & Time</th>
              <th class="py-2.5 px-3">Tenant Name</th>
              <th class="py-2.5 px-3">Bed Allocation</th>
              <th class="py-2.5 px-3">Gateway Ref</th>
              <th class="py-2.5 px-3">Payment Channel</th>
              <th class="py-2.5 px-3 text-right">Amount (ZMW)</th>
              <th class="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/60">
            <tr 
              v-for="p in filteredPayments" 
              :key="p.id"
              class="hover:bg-surface-container-low/50 transition-colors"
            >
              <td class="py-3 px-3 font-bold text-primary">
                {{ p.receipt_number }}
              </td>
              <td class="py-3 px-3 text-on-surface-variant">
                {{ p.paid_at }}
              </td>
              <td class="py-3 px-3 font-semibold text-on-surface">
                {{ p.tenant_name }}
              </td>
              <td class="py-3 px-3 text-on-surface-variant">
                {{ p.bed_label }}
              </td>
              <td class="py-3 px-3 text-on-surface-variant text-[11px]">
                {{ p.gateway_reference }}
              </td>
              <td class="py-3 px-3">
                <span class="badge-pill bg-surface-container text-on-surface-variant text-[10px]">
                  {{ p.method_label || 'Mobile Money' }}
                </span>
              </td>
              <td class="py-3 px-3 font-bold text-right text-on-surface text-sm">
                K{{ Number(p.amount).toLocaleString() }}
              </td>
              <td class="py-3 px-3 text-right">
                <button 
                  @click="viewReceipt(p)"
                  class="px-2.5 py-1 text-xs text-primary bg-primary-container hover:bg-primary hover:text-on-primary rounded-sm transition-colors font-medium"
                >
                  View Receipt
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Official Paper Receipt Modal (Highest-Trust Moment) -->
    <ReceiptVoucherModal
      :is-open="!!selectedReceipt"
      :receipt="selectedReceipt"
      :property-name="state.currentProperty.name"
      @close="selectedReceipt = null"
    />
  </div>
</template>
