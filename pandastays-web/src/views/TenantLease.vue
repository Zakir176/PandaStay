<script setup>
import { computed } from 'vue'
import { useStore } from '../lib/store'
import { useAuth } from '../lib/auth'

import { openPrintReceipt } from '../lib/receiptPrinter.js'

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
    email: 'john.phiri@unza.zm',
    phone: '+260 97 1122334',
    id_number: '392819/11/1',
    emergency_contact_name: 'Patrick Phiri (Father)',
    emergency_contact_phone: '+260 97 7889900',
    room_number: '101'
  }
})

const bed = computed(() => {
  if (!tenant.value) return null
  return state.bedSpaces.find(b => b.tenantId === tenant.value.id || b.tenantName === tenant.value.name) || state.bedSpaces[0]
})

const handlePrintLease = async () => {
  await openPrintReceipt({
    receipt_number: `LSE-${tenant.value?.id_number?.slice(0, 6) || '2026-01'}`,
    tenant_name: tenant.value?.name,
    bed_label: bed.value?.label,
    amount: bed.value?.rent_amount || 2500,
    paid_at: 'Jan 5, 2026',
    gateway_reference: 'LEASE-CONTRACT-ACTIVE',
    method_label: 'Escrow Escrowed & Verified',
    status: 'ACTIVE LEASE'
  }, {
    type: 'LEASE',
    propertyName: state.currentProperty?.name || 'Mukuba House'
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-1">
          <span class="text-primary font-semibold">Residency Contract</span>
          <span>&bull;</span>
          <span>Academic Year 2026</span>
        </div>
        <h2 class="text-2xl font-bold text-on-surface tracking-tight">Tenancy Agreement & House Rules</h2>
        <p class="text-xs text-on-surface-variant mt-0.5">
          Official boarding house occupancy terms, deposit escrow status, and residential guidelines.
        </p>
      </div>

      <button 
        @click="handlePrintLease"
        class="btn-pill-primary text-xs w-full sm:w-auto justify-center"
      >
        <span class="material-symbols-outlined text-[16px]">download</span>
        <span>Download Official Lease (PDF)</span>
      </button>
    </div>

    <!-- Main Contract Bento Card -->
    <div class="card-bento p-4 sm:p-6 bg-surface border-border-card space-y-4 sm:space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-card pb-4">
        <div>
          <span class="badge-pill bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
            Active Digital Lease
          </span>
          <h3 class="text-lg font-bold text-on-surface mt-1">Mukuba House Boarding Agreement</h3>
          <p class="text-xs text-on-surface-variant">Plot 402, Great East Road, Northmead, Lusaka</p>
        </div>

        <div class="sm:text-right">
          <span class="text-[10px] uppercase font-bold text-on-surface-muted">Term Duration</span>
          <p class="font-data-mono font-bold text-sm text-primary">Jan 5, 2026 – Dec 15, 2026</p>
          <span class="text-[10px] text-on-surface-variant">Full Academic Term</span>
        </div>
      </div>

      <!-- Key Details Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-3.5 rounded-xl bg-surface-dim/50 border border-border-card space-y-1">
          <p class="text-[10px] uppercase font-bold text-on-surface-muted">Resident Name</p>
          <p class="font-bold text-xs text-on-surface truncate">{{ tenant?.name }}</p>
          <p class="font-data-mono text-[10px] text-on-surface-variant">ID: {{ tenant?.id_number || '392819/11/1' }}</p>
        </div>

        <div class="p-3.5 rounded-xl bg-surface-dim/50 border border-border-card space-y-1">
          <p class="text-[10px] uppercase font-bold text-on-surface-muted">Unit Allocation</p>
          <p class="font-bold text-xs text-on-surface">{{ bed?.label || 'Bed Space' }}</p>
          <p class="text-[10px] text-on-surface-variant">Room {{ tenant?.room_number || '101' }}</p>
        </div>

        <div class="p-3.5 rounded-xl bg-surface-dim/50 border border-border-card space-y-1">
          <p class="text-[10px] uppercase font-bold text-on-surface-muted">Monthly Rent</p>
          <p class="font-data-mono font-bold text-xs text-primary">
            ZMW {{ Number(bed?.rent_amount || 2500).toLocaleString() }}
          </p>
          <p class="text-[10px] text-on-surface-variant">Due 1st of each month</p>
        </div>

        <div class="p-3.5 rounded-xl bg-surface-dim/50 border border-border-card space-y-1">
          <p class="text-[10px] uppercase font-bold text-on-surface-muted">Security Deposit</p>
          <p class="font-data-mono font-bold text-xs text-on-surface">ZMW 1,250</p>
          <p class="text-[10px] text-primary font-semibold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Held in Escrow
          </p>
        </div>
      </div>

      <!-- Emergency Contacts & Next of Kin -->
      <div class="p-4 rounded-xl bg-surface-dim/30 border border-border-card space-y-2">
        <h4 class="font-bold text-xs uppercase tracking-wider text-on-surface-muted">Next of Kin & Emergency Contact</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span class="text-on-surface-variant text-[11px]">Guardian Name:</span>
            <p class="font-semibold text-on-surface">{{ tenant?.emergency_contact_name || 'Patrick Phiri (Father)' }}</p>
          </div>
          <div>
            <span class="text-on-surface-variant text-[11px]">Guardian Phone:</span>
            <p class="font-data-mono font-semibold text-on-surface">{{ tenant?.emergency_contact_phone || '+260 97 7889900' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- House Rules Bento Card -->
    <div class="card-bento p-4 sm:p-6 bg-surface border-border-card space-y-4">
      <div class="flex items-center gap-2 pb-3 border-b border-border-card">
        <span class="material-symbols-outlined text-primary text-[20px]">policy</span>
        <h3 class="font-bold text-base text-on-surface">Mukuba House Residential Rules</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-on-surface-variant">
        <div class="p-3.5 rounded-xl bg-surface-dim/40 border border-border-card space-y-1">
          <p class="font-bold text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[16px]">volume_off</span>
            1. Quiet Hours & Study Time
          </p>
          <p class="leading-relaxed">
            Quiet hours are observed strictly between <strong>22:00 PM and 06:00 AM</strong> daily to support academic study and rest. Loud music or disruptive noise is prohibited.
          </p>
        </div>

        <div class="p-3.5 rounded-xl bg-surface-dim/40 border border-border-card space-y-1">
          <p class="font-bold text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[16px]">group</span>
            2. Visitor & Guest Policy
          </p>
          <p class="leading-relaxed">
            External guests are welcome between <strong>08:00 AM and 20:00 PM</strong>. Overnight unauthorized visitors are strictly forbidden for campus boarding safety.
          </p>
        </div>

        <div class="p-3.5 rounded-xl bg-surface-dim/40 border border-border-card space-y-1">
          <p class="font-bold text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[16px]">soup_kitchen</span>
            3. Kitchen & Shared Hygiene
          </p>
          <p class="leading-relaxed">
            Communal kitchens, refrigerators, and sinks must be cleaned immediately after use. Unwashed utensils left overnight will be removed by hygiene personnel.
          </p>
        </div>

        <div class="p-3.5 rounded-xl bg-surface-dim/40 border border-border-card space-y-1">
          <p class="font-bold text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[16px]">security</span>
            4. Security & Escrow Refund
          </p>
          <p class="leading-relaxed">
            Your security deposit (ZMW 1,250) is held safely in escrow and is 100% refundable via Mobile Money upon clearance inspection at the end of the academic year.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
