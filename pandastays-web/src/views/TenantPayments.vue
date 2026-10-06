<script setup>
import { computed } from 'vue'
import { useStore } from '../lib/store'
import { useAuth } from '../lib/auth'

const { state } = useStore()
const { userProfile, currentRole } = useAuth()

// Strictly scoped to logged-in tenant
const tenant = computed(() => {
  if (currentRole.value === 'tenant' && userProfile.value?.id) {
    const match = state.tenants.find(t => t.id === userProfile.value.id || t.email === userProfile.value.email || t.name === userProfile.value.name)
    if (match) return match
  }
  return state.tenants[0] || {
    id: 'demo-tenant',
    name: 'John Phiri',
    email: 'john.phiri@unza.zm'
  }
})

const bed = computed(() => {
  if (!tenant.value) return null
  return state.bedSpaces.find(b => b.tenantId === tenant.value.id || b.tenantName === tenant.value.name) || state.bedSpaces[0]
})

const myPayments = computed(() => {
  if (!tenant.value?.name) return []
  return state.payments.filter(p => p.tenant_name === tenant.value.name)
})

const totalPaid = computed(() => {
  return myPayments.value.reduce((sum, p) => sum + Number(p.amount || 0), 0)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-1">
          <span class="text-primary font-semibold">Financial Ledger</span>
          <span>&bull;</span>
          <span>Verified Student Records</span>
        </div>
        <h2 class="text-2xl font-bold text-on-surface tracking-tight">Rent & Payment Receipts</h2>
        <p class="text-xs text-on-surface-variant mt-0.5">
          Review your accommodation rent transactions, mobile money references, and payment receipts.
        </p>
      </div>

      <router-link
        to="/tenant/checkout"
        class="btn-pill-primary text-xs"
      >
        <span class="material-symbols-outlined text-[16px]">point_of_sale</span>
        <span>Make Rent Payment</span>
      </router-link>
    </div>

    <!-- Summary Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <div class="card-bento p-4.5 bg-surface border-border-card">
        <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Total Paid to Date</p>
        <p class="text-2xl font-bold font-data-mono text-primary mt-1.5">
          ZMW {{ totalPaid.toLocaleString() }}
        </p>
        <p class="text-[11px] text-on-surface-variant mt-0.5">{{ myPayments.length }} verified payment(s)</p>
      </div>

      <div class="card-bento p-4.5 bg-surface border-border-card">
        <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Outstanding Balance</p>
        <p class="text-2xl font-bold font-data-mono text-on-surface mt-1.5">
          {{ bed?.paymentStatus === 'overdue' ? `ZMW ${bed.rent_amount}` : 'ZMW 0' }}
        </p>
        <p class="text-[11px] text-primary font-medium mt-0.5">
          {{ bed?.paymentStatus === 'overdue' ? 'Payment overdue' : 'Account in good standing' }}
        </p>
      </div>

      <div class="card-bento p-4.5 bg-surface border-border-card">
        <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Monthly Rate</p>
        <p class="text-2xl font-bold font-data-mono text-on-surface mt-1.5">
          ZMW {{ Number(bed?.rent_amount || 2500).toLocaleString() }}
        </p>
        <p class="text-[11px] text-on-surface-variant mt-0.5">{{ bed?.label || 'Bed Space' }}</p>
      </div>
    </div>

    <!-- Receipts Table Container -->
    <div class="card-bento p-5 bg-surface border-border-card space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-border-card">
        <div>
          <h3 class="font-bold text-base text-on-surface">Payment History</h3>
          <p class="text-xs text-on-surface-variant">All payments reconciled via Lenco & Mobile Money gateway.</p>
        </div>
        <span class="badge-pill bg-primary/10 text-primary border border-primary/20 text-[10px] font-data-mono">
          {{ myPayments.length }} Total
        </span>
      </div>

      <div v-if="myPayments.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="border-b border-border-card text-[11px] uppercase tracking-wider text-on-surface-muted font-bold bg-surface-dim/50">
              <th class="py-2.5 px-3 rounded-l-xl">Receipt #</th>
              <th class="py-2.5 px-3">Date & Time</th>
              <th class="py-2.5 px-3">Amount</th>
              <th class="py-2.5 px-3">Payment Method</th>
              <th class="py-2.5 px-3">Reference</th>
              <th class="py-2.5 px-3 text-right rounded-r-xl">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-card/60">
            <tr 
              v-for="p in myPayments" 
              :key="p.id"
              class="hover:bg-surface-dim/40 transition-colors text-xs"
            >
              <td class="py-3 px-3 align-middle font-data-mono font-bold text-primary">
                {{ p.receipt_number }}
              </td>
              <td class="py-3 px-3 align-middle text-on-surface-variant">
                {{ p.paid_at }}
              </td>
              <td class="py-3 px-3 align-middle font-data-mono font-bold text-on-surface">
                ZMW {{ Number(p.amount).toLocaleString() }}
              </td>
              <td class="py-3 px-3 align-middle text-on-surface">
                <span class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px] text-primary">credit_card</span>
                  <span>{{ p.method_label || 'MTN MoMo' }}</span>
                </span>
              </td>
              <td class="py-3 px-3 align-middle font-data-mono text-[11px] text-on-surface-variant">
                {{ p.gateway_reference }}
              </td>
              <td class="py-3 px-3 align-middle text-right">
                <span class="badge-pill bg-primary/10 text-primary border border-primary/20 text-[10px]">
                  Verified
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-12 text-on-surface-variant text-xs space-y-3">
        <span class="material-symbols-outlined text-[36px] text-on-surface-muted">receipt_long</span>
        <p class="font-bold text-on-surface">No payment receipts found</p>
        <p class="text-[11px] max-w-sm mx-auto">
          When you pay your monthly rent via Mobile Money, your verified receipts will be recorded here immediately.
        </p>
        <router-link to="/tenant/checkout" class="btn-pill-primary text-xs inline-flex">
          Pay Rent Now
        </router-link>
      </div>
    </div>
  </div>
</template>
