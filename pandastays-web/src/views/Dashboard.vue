<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore, roomsWithBeds, occupancyStats } from '../lib/store'
import BedGrid from '../components/BedGrid.vue'
import RecordPaymentModal from '../components/RecordPaymentModal.vue'

const router = useRouter()
const { state, triggerWhatsAppReminder } = useStore()

const isPaymentModalOpen = ref(false)
const reminderNotification = ref(null)

const openPaymentModal = () => {
  isPaymentModalOpen.value = true
}

const closePaymentModal = () => {
  isPaymentModalOpen.value = false
}

const handleSelectBed = ({ bed, room }) => {
  if (bed.status === 'vacant') {
    router.push('/app/rooms')
  } else if (bed.tenantId) {
    router.push(`/app/tenants/${bed.tenantId}`)
  } else {
    router.push('/app/rooms')
  }
}

const sendReminder = (tenant) => {
  triggerWhatsAppReminder(tenant)
  reminderNotification.value = `WhatsApp reminder dispatched to ${tenant.name} (${tenant.phone})`
  setTimeout(() => {
    reminderNotification.value = null
  }, 4000)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Live Toast Alert for WhatsApp Reminders -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div 
        v-if="reminderNotification" 
        class="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-sm shadow-md text-xs font-medium"
      >
        <span class="material-symbols-outlined text-[18px]">chat</span>
        <span>{{ reminderNotification }}</span>
      </div>
    </transition>

    <!-- Payment Modal Component -->
    <RecordPaymentModal 
      :is-open="isPaymentModalOpen" 
      @close="closePaymentModal" 
    />

    <!-- Dashboard Property Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-medium">
          <span>Lusaka Northmead</span>
          <span>&bull;</span>
          <span class="text-primary font-semibold">Active Term / Semester 1</span>
        </div>
        <h1 class="text-2xl font-bold text-on-surface tracking-tight">{{ state.currentProperty.name }}</h1>
        <p class="text-xs text-on-surface-variant mt-0.5">
          {{ state.currentProperty.address }} &bull; Multi-Bed Boarding House
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <router-link
          to="/tenant/portal"
          class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary bg-primary-container hover:bg-primary/20 rounded-sm transition-colors"
        >
          <span class="material-symbols-outlined text-[16px]">visibility</span>
          <span>Tenant View</span>
        </router-link>
        <button 
          @click="openPaymentModal"
          class="flex items-center gap-2 px-3.5 py-2 bg-primary text-on-primary text-xs font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-xs"
        >
          <span class="material-symbols-outlined text-[18px]">add_card</span>
          Record Payment
        </button>
      </div>
    </div>

    <!-- Status-Bearing Metric Cards (Section 5.3 rules: tight 4px radius, 3px solid status accent bar) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Occupancy Card -->
      <div class="card-tight p-4 bg-surface-container-lowest card-accent-paid flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-on-surface-variant">
            <span class="text-xs font-semibold uppercase tracking-wider">Occupancy</span>
            <span class="badge-pill bg-primary-container text-primary text-[10px]">
              {{ occupancyStats.occupiedBeds }}/{{ occupancyStats.totalBeds }} Beds
            </span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-3xl font-bold font-data-mono text-on-surface">{{ occupancyStats.percentage }}%</span>
            <span class="text-xs text-primary font-medium">Target 95%</span>
          </div>
        </div>
        <div class="mt-3 pt-2 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
          <span>{{ occupancyStats.vacantBeds }} Bed vacant</span>
          <router-link to="/app/rooms" class="text-primary hover:underline text-[11px] font-medium">Manage Beds &rarr;</router-link>
        </div>
      </div>

      <!-- 2. Rent Collected Card -->
      <div class="card-tight p-4 bg-surface-container-lowest card-accent-paid flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-on-surface-variant">
            <span class="text-xs font-semibold uppercase tracking-wider">Rent Collected</span>
            <span class="badge-pill bg-primary-container text-primary text-[10px]">Lenco Verified</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-3xl font-bold font-data-mono text-primary">
              K{{ occupancyStats.totalRentCollected.toLocaleString() }}
            </span>
          </div>
        </div>
        <div class="mt-3 pt-2 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
          <span>{{ state.payments.length }} payments processed</span>
          <router-link to="/app/financials" class="text-primary hover:underline text-[11px] font-medium">Ledger &rarr;</router-link>
        </div>
      </div>

      <!-- 3. Overdue Rent Card -->
      <div class="card-tight p-4 bg-surface-container-lowest card-accent-overdue flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-on-surface-variant">
            <span class="text-xs font-semibold uppercase tracking-wider text-error">Overdue Rent</span>
            <span class="badge-pill bg-error-container text-error text-[10px]">2 Tenants</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-3xl font-bold font-data-mono text-error">
              K{{ occupancyStats.overdueRent.toLocaleString() }}
            </span>
          </div>
        </div>
        <div class="mt-3 pt-2 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
          <span class="text-error font-medium">Escalating WhatsApp due</span>
          <button @click="sendReminder({ name: 'All Overdue Tenants', phone: '+260 97 0000000', bed_label: 'Multiple', balanceDue: 3700 })" class="text-error hover:underline text-[11px] font-semibold">
            Send Alerts &rarr;
          </button>
        </div>
      </div>

      <!-- 4. Maintenance Reports Card -->
      <div class="card-tight p-4 bg-surface-container-lowest card-accent-partial flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-on-surface-variant">
            <span class="text-xs font-semibold uppercase tracking-wider">Open Reports</span>
            <span class="badge-pill bg-tertiary-container text-tertiary text-[10px]">Manual Priority</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-3xl font-bold font-data-mono text-on-surface">
              {{ state.reports.filter(r => r.status !== 'resolved').length }}
            </span>
            <span class="text-xs text-tertiary font-medium">1 In Progress</span>
          </div>
        </div>
        <div class="mt-3 pt-2 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Priority #1: Plumbing</span>
          <router-link to="/app/maintenance" class="text-primary hover:underline text-[11px] font-medium">Review &rarr;</router-link>
        </div>
      </div>
    </div>

    <!-- Centerpiece: Signature Bed-Grid Floorplan Component -->
    <div class="card-tight p-5 bg-surface-container-lowest">
      <BedGrid 
        :rooms="roomsWithBeds" 
        title="Live Bed-Space Floorplan & Occupancy" 
        @select-bed="handleSelectBed"
      />
    </div>

    <!-- Two Column Grid: Overdue Chasers & Recent Financial Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Overdue Chaser & Reminders Panel -->
      <div class="card-tight p-5 bg-surface-container-lowest lg:col-span-1 space-y-4">
        <div class="flex items-center justify-between border-b border-outline-variant/60 pb-3">
          <div>
            <h3 class="font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span class="material-symbols-outlined text-error text-[18px]">warning</span>
              Rent Overdue Chaser
            </h3>
            <p class="text-[11px] text-on-surface-variant">Rules-based WhatsApp dispatch</p>
          </div>
          <span class="badge-pill bg-error-container text-error text-[10px]">Active</span>
        </div>

        <div class="space-y-3">
          <div 
            v-for="bed in state.bedSpaces.filter(b => b.paymentStatus === 'overdue' || b.paymentStatus === 'partial')"
            :key="bed.id"
            class="p-3 rounded-sm border border-outline-variant bg-surface-container-low flex items-center justify-between"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-semibold text-xs text-on-surface">{{ bed.tenantName }}</span>
                <span 
                  class="badge-pill text-[9px] py-0.5 px-1.5"
                  :class="bed.paymentStatus === 'overdue' ? 'bg-error-container text-error' : 'bg-tertiary-container text-tertiary'"
                >
                  {{ bed.paymentStatus === 'overdue' ? 'Overdue' : 'Partial' }}
                </span>
              </div>
              <p class="text-[11px] text-on-surface-variant font-data-mono mt-0.5">
                {{ bed.label }} &bull; Balance: <strong class="text-error">ZMW {{ (bed.balanceDue || bed.rent_amount).toLocaleString() }}</strong>
              </p>
            </div>

            <button 
              @click="sendReminder({ name: bed.tenantName, phone: '+260 97 0000000', bed_label: bed.label, balanceDue: bed.balanceDue })"
              title="Dispatch WhatsApp Reminder"
              class="px-2.5 py-1.5 bg-primary text-on-primary hover:bg-primary/90 rounded-sm text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <span class="material-symbols-outlined text-[14px]">send</span>
              <span>Nudge</span>
            </button>
          </div>
        </div>

        <!-- WhatsApp Configuration Footnote -->
        <div class="pt-2 text-[11px] text-on-surface-variant/80 border-t border-outline-variant/60 flex items-center justify-between">
          <span>Reminder schedule: 3 days before due</span>
          <router-link to="/app/settings" class="text-primary hover:underline font-medium">Config &rarr;</router-link>
        </div>
      </div>

      <!-- Recent Payments with Receipt Paper Aesthetic -->
      <div class="card-tight p-5 bg-surface-container-lowest lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between border-b border-outline-variant/60 pb-3">
          <div>
            <h3 class="font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
              Recent Rent Receipts & Collections
            </h3>
            <p class="text-[11px] text-on-surface-variant">Automated Lenco reconciliation</p>
          </div>
          <router-link to="/app/financials" class="text-xs text-primary font-medium hover:underline">
            Full Ledger &rarr;
          </router-link>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-outline-variant/60 text-on-surface-variant font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-2 px-2">Receipt #</th>
                <th class="py-2 px-2">Tenant</th>
                <th class="py-2 px-2">Bed-Space</th>
                <th class="py-2 px-2">Channel</th>
                <th class="py-2 px-2 text-right">Amount</th>
                <th class="py-2 px-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/40">
              <tr 
                v-for="payment in state.payments.slice(0, 5)" 
                :key="payment.id"
                class="hover:bg-surface-container-low/40 transition-colors"
              >
                <td class="py-2.5 px-2 font-data-mono font-medium text-primary">
                  {{ payment.receipt_number }}
                </td>
                <td class="py-2.5 px-2 font-semibold text-on-surface">
                  {{ payment.tenant_name }}
                </td>
                <td class="py-2.5 px-2 text-on-surface-variant">
                  {{ payment.bed_label }}
                </td>
                <td class="py-2.5 px-2">
                  <span class="badge-pill bg-surface-container text-on-surface-variant text-[10px]">
                    {{ payment.method_label || 'Mobile Money' }}
                  </span>
                </td>
                <td class="py-2.5 px-2 font-data-mono font-bold text-right text-on-surface">
                  ZMW {{ Number(payment.amount).toLocaleString() }}
                </td>
                <td class="py-2.5 px-2 font-data-mono text-right text-on-surface-variant">
                  {{ payment.paid_at.substring(5, 10) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
