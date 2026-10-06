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
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-medium">
          <span>{{ state.currentProperty.name }}</span>
          <span>&bull;</span>
          <span class="text-primary font-semibold">Lenco Sub-Account: {{ state.currentLandlord.lenco_subaccount_id || 'sub_lenco_mukuba_981' }}</span>
        </div>
        <h2 class="text-2xl font-bold text-on-surface tracking-tight">Financial Ledger & Receipts</h2>
        <p class="text-xs text-on-surface-variant mt-0.5">
          Audited payment records with automatic receipt issuance and gateway reconciliation.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="isPaymentModalOpen = true"
          class="btn-pill-primary"
        >
          <span class="material-symbols-outlined text-[16px]">add_card</span>
          <span>Record New Payment</span>
        </button>
      </div>
    </div>

    <!-- Summary Metrics Cards (Bento 3-Column Row) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card-bento p-5 bg-surface border-t-3 border-t-primary flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-on-surface-variant">
            <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Total Rent Collected</span>
            <span class="badge-pill bg-primary-container text-primary text-[10px]">Active Term</span>
          </div>
          <div class="mt-2.5">
            <span class="text-3xl font-bold font-data-mono text-primary">
              ZMW {{ occupancyStats.totalRentCollected.toLocaleString() }}
            </span>
          </div>
        </div>
        <p class="text-[11px] text-on-surface-variant mt-3 pt-2 border-t border-border-card">
          Reconciled via Lenco Mobile Money Gateway
        </p>
      </div>

      <div class="card-bento p-5 bg-surface border-t-3 border-t-error flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-on-surface-variant">
            <span class="text-[10px] font-bold uppercase tracking-wider text-error">Outstanding Balance</span>
            <span class="badge-pill bg-error-container text-error text-[10px]">Overdue/Partial</span>
          </div>
          <div class="mt-2.5">
            <span class="text-3xl font-bold font-data-mono text-error">
              ZMW {{ occupancyStats.overdueRent.toLocaleString() }}
            </span>
          </div>
        </div>
        <p class="text-[11px] text-on-surface-variant mt-3 pt-2 border-t border-border-card">
          Nudge reminders queued via WhatsApp
        </p>
      </div>

      <div class="card-bento p-5 bg-surface flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-on-surface-variant">
            <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Total Transactions</span>
            <span class="badge-pill bg-surface-dim text-on-surface-variant text-[10px]">Audit Trail</span>
          </div>
          <div class="mt-2.5">
            <span class="text-3xl font-bold font-data-mono text-on-surface">
              {{ state.payments.length }} Receipts
            </span>
          </div>
        </div>
        <p class="text-[11px] text-on-surface-variant mt-3 pt-2 border-t border-border-card">
          100% digital ledger records
        </p>
      </div>
    </div>

    <!-- Filter Bar (Bento Capsule Strip) -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 card-bento">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-bold text-on-surface-muted mr-1.5 uppercase text-[10px] tracking-wider">Method:</span>
        <button 
          v-for="m in ['All', 'MTN', 'Airtel', 'Zamtel']" 
          :key="m"
          @click="methodFilter = m"
          class="badge-pill text-xs py-1 px-3 transition-colors cursor-pointer"
          :class="methodFilter === m ? 'bg-primary text-white font-bold' : 'bg-surface-dim text-on-surface-variant hover:bg-surface-dim/80'"
        >
          {{ m }}
        </button>
      </div>

      <div class="text-xs text-on-surface-variant font-data-mono">
        Showing {{ filteredPayments.length }} entries
      </div>
    </div>

    <!-- The Ledger Bento Container -->
    <div class="card-bento p-5 bg-surface space-y-4">
      <div class="flex items-center justify-between border-b border-border-card pb-3">
        <div>
          <h3 class="font-bold text-sm text-on-surface font-data-mono tracking-wide uppercase">
            PandaStays Central Rent Register — 2026
          </h3>
          <p class="text-xs text-on-surface-variant">
            Property: {{ state.currentProperty.name }} &bull; Lusaka, Zambia
          </p>
        </div>
        <span class="badge-pill bg-primary-container text-primary font-data-mono text-xs border border-primary/20">
          STK PUSH ROUTED
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-data-mono">
          <thead>
            <tr class="border-b border-border-card text-on-surface-muted uppercase text-[10px] font-bold bg-surface-dim/50">
              <th class="py-3 px-3 rounded-l-xl">Receipt No.</th>
              <th class="py-3 px-3">Date & Time</th>
              <th class="py-3 px-3">Tenant Name</th>
              <th class="py-3 px-3">Bed Allocation</th>
              <th class="py-3 px-3">Gateway Ref</th>
              <th class="py-3 px-3">Payment Channel</th>
              <th class="py-3 px-3 text-right">Amount (ZMW)</th>
              <th class="py-3 px-3 text-right rounded-r-xl">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-card/60">
            <tr 
              v-for="p in filteredPayments" 
              :key="p.id"
              class="hover:bg-surface-dim/40 transition-colors"
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
                <span class="badge-pill bg-surface-dim text-on-surface-variant text-[10px] border border-border-card">
                  {{ p.method_label || 'Mobile Money' }}
                </span>
              </td>
              <td class="py-3 px-3 font-bold text-right text-on-surface text-sm">
                K{{ Number(p.amount).toLocaleString() }}
              </td>
              <td class="py-3 px-3 text-right">
                <button 
                  @click="viewReceipt(p)"
                  class="btn-pill-primary py-1 px-3 text-[11px]"
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
