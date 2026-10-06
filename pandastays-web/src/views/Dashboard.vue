<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore, roomsWithBeds, occupancyStats } from '../lib/store'
import BedGrid from '../components/BedGrid.vue'
import RecordPaymentModal from '../components/RecordPaymentModal.vue'
import AssignTenantModal from '../components/AssignTenantModal.vue'

const router = useRouter()
const { state, triggerWhatsAppReminder } = useStore()

const isPaymentModalOpen = ref(false)
const selectedBed = ref(null)
const selectedRoom = ref(null)
const isAssignModalOpen = ref(false)
const reminderNotification = ref(null)
const currentTime = ref(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))

let timerInterval = null
onMounted(() => {
  timerInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const openPaymentModal = () => {
  isPaymentModalOpen.value = true
}

const closePaymentModal = () => {
  isPaymentModalOpen.value = false
}

const handleSelectBed = ({ bed, room }) => {
  if (bed.status === 'vacant' || bed.status === 'reserved') {
    selectedBed.value = bed
    selectedRoom.value = room
    isAssignModalOpen.value = true
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

// Critical Overdue Tenant for Reminders Spotlight Card
const primaryOverdueTenant = computed(() => {
  const overdueBed = state.bedSpaces.find(b => b.paymentStatus === 'overdue' && b.tenantName)
  if (overdueBed) {
    const tenant = state.tenants.find(t => t.id === overdueBed.tenantId || t.name === overdueBed.tenantName)
    return {
      name: overdueBed.tenantName,
      phone: tenant?.phone || '+260 97 1122334',
      bedLabel: overdueBed.label,
      balanceDue: overdueBed.balanceDue || 2500,
      daysOverdue: 5
    }
  }
  return {
    name: 'John Phiri',
    phone: '+260 97 1122334',
    bedLabel: 'Bed 101-A',
    balanceDue: 2500,
    daysOverdue: 5
  }
})

// Recent collections stream (max 5)
const recentPayments = computed(() => {
  return state.payments.slice(0, 5)
})

// Active roster tenants (strictly allocated tenants with active leases)
const activeRosterTenants = computed(() => {
  return state.tenants.filter(t => t.tenancy_id || t.bed_id || t.status === 'active').slice(0, 4)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Live Toast Alert for WhatsApp Reminders -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div 
        v-if="reminderNotification" 
        class="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-full shadow-lg text-xs font-semibold border border-white/20"
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

    <!-- Assign / Reserve Bed Modal -->
    <AssignTenantModal
      :is-open="isAssignModalOpen"
      :bed="selectedBed"
      :room="selectedRoom"
      @close="isAssignModalOpen = false"
    />

    <!-- Dashboard Property Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-1">
          <span class="font-semibold text-primary">Lusaka Northmead</span>
          <span>&bull;</span>
          <span>Active Term 1 / Semester 2026</span>
        </div>
        <h1 class="text-2xl font-bold text-on-surface tracking-tight">{{ state.currentProperty.name }}</h1>
        <p class="text-xs text-on-surface-variant mt-0.5">
          {{ state.currentProperty.address }} &bull; Student Boarding House
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <router-link
          to="/tenant/portal"
          class="btn-pill-outline"
        >
          <span class="material-symbols-outlined text-[16px]">visibility</span>
          <span>Tenant View</span>
        </router-link>
        <button 
          @click="openPaymentModal"
          class="btn-pill-primary"
        >
          <span class="material-symbols-outlined text-[16px]">add_card</span>
          <span>Record Payment</span>
        </button>
      </div>
    </div>

    <!-- ==================================================================== -->
    <!-- TIER 1: 4-COLUMN BENTO KPI ROW (WITH INVERTED HERO CARD)              -->
    <!-- ==================================================================== -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Hero Inverted Card: Total Rent Collected -->
      <div class="card-bento-hero p-5 flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between text-white/80">
            <span class="text-[10px] font-bold uppercase tracking-wider">Total Revenue</span>
            <router-link to="/app/financials" class="btn-circle-action" title="View Financial Ledger">
              <span class="material-symbols-outlined text-[18px]">north_east</span>
            </router-link>
          </div>
          <div class="mt-3">
            <span class="text-3xl font-bold font-data-mono text-white tracking-tight">
              K{{ occupancyStats.totalRentCollected.toLocaleString() }}
            </span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
          <span class="flex items-center gap-1.5 text-[11px] font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-accent animate-pulse"></span>
            Lenco Verified &bull; {{ state.payments.length }} Collections
          </span>
          <span class="text-[11px] font-bold text-primary-accent">100% Reconciled</span>
        </div>
      </div>

      <!-- 2. Standard Bento Card: Occupancy Rate -->
      <div class="card-bento p-5 flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between text-on-surface-variant">
            <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Occupancy Rate</span>
            <router-link to="/app/rooms" class="btn-circle-action-light" title="Manage Rooms & Beds">
              <span class="material-symbols-outlined text-[18px]">north_east</span>
            </router-link>
          </div>
          <div class="flex items-baseline gap-2.5 mt-3">
            <span class="text-3xl font-bold font-data-mono text-on-surface">
              {{ occupancyStats.percentage }}%
            </span>
            <span class="badge-pill bg-primary-container text-primary text-[10px]">
              {{ occupancyStats.occupiedBeds }}/{{ occupancyStats.totalBeds }} Beds
            </span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-border-card flex items-center justify-between text-xs text-on-surface-variant">
          <span>{{ occupancyStats.vacantBeds }} vacant bed space available</span>
          <router-link to="/app/rooms" class="text-primary hover:underline text-[11px] font-semibold">Assign &rarr;</router-link>
        </div>
      </div>

      <!-- 3. Standard Bento Card: Overdue Rent -->
      <div class="card-bento p-5 flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between text-on-surface-variant">
            <span class="text-[10px] font-bold uppercase tracking-wider text-error">Overdue Balance</span>
            <router-link to="/app/financials" class="btn-circle-action-light" title="View Overdue Accounts">
              <span class="material-symbols-outlined text-[18px]">north_east</span>
            </router-link>
          </div>
          <div class="flex items-baseline gap-2.5 mt-3">
            <span class="text-3xl font-bold font-data-mono text-error">
              K{{ occupancyStats.overdueRent.toLocaleString() }}
            </span>
            <span class="badge-pill bg-error-container text-error text-[10px]">
              2 Tenants Overdue
            </span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-border-card flex items-center justify-between text-xs text-on-surface-variant">
          <span class="text-error font-medium">WhatsApp escalations queued</span>
          <button 
            @click="sendReminder({ name: 'All Overdue Tenants', phone: '+260 97 0000000', bed_label: 'Multiple', balanceDue: 3700 })"
            class="text-error hover:underline text-[11px] font-bold"
          >
            Dispatch &rarr;
          </button>
        </div>
      </div>

      <!-- 4. Standard Bento Card: Maintenance Reports -->
      <div class="card-bento p-5 flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between text-on-surface-variant">
            <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Active Repairs</span>
            <router-link to="/app/maintenance" class="btn-circle-action-light" title="View Tickets">
              <span class="material-symbols-outlined text-[18px]">north_east</span>
            </router-link>
          </div>
          <div class="flex items-baseline gap-2.5 mt-3">
            <span class="text-3xl font-bold font-data-mono text-on-surface">
              {{ state.reports.filter(r => r.status !== 'resolved').length }}
            </span>
            <span class="badge-pill bg-tertiary-container text-tertiary text-[10px]">
              Priority Queue
            </span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-border-card flex items-center justify-between text-xs text-on-surface-variant">
          <span class="truncate">Priority #1: Plumbing Leaks</span>
          <router-link to="/app/maintenance" class="text-primary hover:underline text-[11px] font-semibold">Tickets &rarr;</router-link>
        </div>
      </div>
    </div>

    <!-- ==================================================================== -->
    <!-- TIER 2: ASYMMETRIC 2 : 1 : 1 BENTO GRID                              -->
    <!-- ==================================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <!-- Col 1 (Span 2): Centerpiece Architectural Bed-Grid Floorplan -->
      <div class="card-bento overflow-visible! p-5 lg:col-span-2 flex flex-col justify-between">
        <BedGrid 
          :rooms="roomsWithBeds" 
          title="Architectural Bed-Space Floorplan" 
          :compact="true"
          @select-bed="handleSelectBed"
        />
      </div>

      <!-- Col 2 (Span 1): Overdue Rent Chaser Spotlight (Modeled on Fernly Reminders) -->
      <div class="card-bento p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-border-card">
            <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Overdue Chaser</span>
            <span class="badge-pill bg-error-container text-error text-[10px]">
              Urgent Alert
            </span>
          </div>

          <div class="mt-4 space-y-3">
            <div>
              <p class="text-xs font-bold text-on-surface">{{ primaryOverdueTenant.name }}</p>
              <p class="text-[11px] text-on-surface-variant">{{ primaryOverdueTenant.bedLabel }} &bull; Mukuba House</p>
            </div>

            <div class="p-3 bg-surface-dim rounded-xl border border-border-card space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-on-surface-variant">Outstanding Rent:</span>
                <span class="font-data-mono font-bold text-error">K{{ primaryOverdueTenant.balanceDue.toLocaleString() }}</span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-on-surface-muted">
                <span>Grace Period Expired:</span>
                <span class="font-semibold text-error">{{ primaryOverdueTenant.daysOverdue }} days ago</span>
              </div>
            </div>

            <p class="text-[11px] text-on-surface-variant leading-relaxed">
              Rules-based template configured to disburse MoMo payment link to <span class="font-mono">{{ primaryOverdueTenant.phone }}</span>.
            </p>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-border-card">
          <button 
            @click="sendReminder(primaryOverdueTenant)"
            class="btn-pill-primary w-full justify-center"
          >
            <span class="material-symbols-outlined text-[16px]">send</span>
            <span>Send WhatsApp Chaser</span>
          </button>
        </div>
      </div>

      <!-- Col 3 (Span 1): Recent Lenco MoMo Collections Feed (Modeled on Fernly Project List) -->
      <div class="card-bento p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-border-card">
            <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Recent Collections</span>
            <router-link to="/app/financials" class="text-primary hover:underline text-[11px] font-semibold">Ledger &rarr;</router-link>
          </div>

          <div class="mt-3.5 space-y-2.5">
            <div 
              v-for="payment in recentPayments" 
              :key="payment.id"
              class="flex items-center justify-between p-2 rounded-xl hover:bg-surface-dim transition-colors border border-transparent hover:border-border-card"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div 
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  :class="{
                    'bg-yellow-400/20 text-yellow-700': payment.method === 'momo_mtn',
                    'bg-red-500/20 text-red-600': payment.method === 'momo_airtel',
                    'bg-green-500/20 text-green-700': payment.method === 'momo_zamtel',
                    'bg-primary-container text-primary': !payment.method?.startsWith('momo')
                  }"
                >
                  <span class="material-symbols-outlined text-[15px]">
                    {{ payment.method === 'cash' ? 'payments' : 'smartphone' }}
                  </span>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-on-surface truncate leading-tight">{{ payment.tenant_name }}</p>
                  <p class="text-[10px] text-on-surface-variant truncate">{{ payment.bed_label }} &bull; {{ payment.method_label || 'MoMo' }}</p>
                </div>
              </div>
              <div class="text-right shrink-0 pl-2">
                <p class="font-data-mono font-bold text-xs text-primary leading-tight">K{{ payment.amount?.toLocaleString() }}</p>
                <p class="text-[9px] text-on-surface-muted font-mono">{{ payment.receipt_number }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-border-card mt-2 text-center">
          <p class="text-[10px] text-on-surface-muted font-medium">All collections reconciled against Lenco API</p>
        </div>
      </div>
    </div>

    <!-- ==================================================================== -->
    <!-- TIER 3: ASYMMETRIC 2 : 1 : 1 BENTO GRID                              -->
    <!-- ==================================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <!-- Col 1 (Span 2): Tenants & Bed Occupants Table (Modeled on Fernly Team Card) -->
      <div class="card-bento p-5 lg:col-span-2 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-border-card">
            <div>
              <h3 class="font-bold text-sm text-on-surface">Active Tenant Roster</h3>
              <p class="text-[11px] text-on-surface-variant">Allocated bed spaces and verification status</p>
            </div>
            <router-link to="/app/rooms" class="btn-pill-outline text-[11px] py-1 px-3">
              <span class="material-symbols-outlined text-[14px]">person_add</span>
              <span>Onboard Tenant</span>
            </router-link>
          </div>

          <div class="divide-y divide-border-card/60 mt-2">
            <div 
              v-for="tenant in activeRosterTenants" 
              :key="tenant.id"
              class="py-2.5 flex items-center justify-between gap-3 hover:bg-surface-dim/40 px-2 rounded-xl transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-full bg-primary-container text-primary font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {{ tenant.name?.split(' ').map(n=>n[0]).join('').substring(0, 2) || 'ST' }}
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-on-surface leading-tight truncate">{{ tenant.name }}</p>
                  <p class="text-[10px] text-on-surface-variant truncate">{{ tenant.phone }} &bull; ID: {{ tenant.id_number || 'NRC-Verified' }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <span class="badge-pill bg-surface-dim text-on-surface-variant border border-border-card text-[10px]">
                  {{ tenant.bed_label || 'Assigned' }}
                </span>
                <span 
                  class="badge-pill text-[10px]"
                  :class="{
                    'bg-primary-container text-primary border border-primary/20': tenant.status === 'active',
                    'bg-error-container text-error border border-error/20': tenant.status === 'overdue',
                    'bg-tertiary-container text-tertiary border border-tertiary/20': tenant.status !== 'active' && tenant.status !== 'overdue'
                  }"
                >
                  {{ tenant.status === 'active' ? 'Active Lease' : tenant.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-border-card mt-3 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Showing 4 of {{ state.tenants.length }} tenants</span>
          <router-link to="/app/tenants" class="text-primary hover:underline font-semibold text-[11px]">View All Tenants &rarr;</router-link>
        </div>
      </div>

      <!-- Col 2 (Span 1): Semester Term Progress Radial Half-Donut Gauge (Modeled on Fernly Gauge) -->
      <div class="card-bento p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-border-card">
            <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Semester 1 Progress</span>
            <span class="badge-pill bg-primary-container text-primary text-[10px]">Term 2026</span>
          </div>

          <!-- Half-Donut SVG Gauge Visual -->
          <div class="flex flex-col items-center justify-center my-4">
            <div class="relative w-40 h-24 flex items-end justify-center">
              <svg viewBox="0 0 100 55" class="w-full h-full overflow-visible">
                <!-- Background Arc -->
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#E2E7E2"
                  stroke-width="12"
                  stroke-linecap="round"
                />
                <!-- Progress Arc (48% Term Elapsed) -->
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#144D2F"
                  stroke-width="12"
                  stroke-linecap="round"
                  stroke-dasharray="125.66"
                  stroke-dashoffset="65"
                />
              </svg>
              <!-- Center Display Percentage -->
              <div class="absolute bottom-0 flex flex-col items-center text-center">
                <span class="text-2xl font-bold font-data-mono text-on-surface leading-none">48%</span>
                <span class="text-[10px] text-on-surface-variant font-medium mt-0.5">Term Elapsed</span>
              </div>
            </div>
            <p class="text-[11px] text-on-surface-variant mt-2 font-medium">72 of 150 Days Completed</p>
          </div>
        </div>

        <div class="pt-3 border-t border-border-card text-[10px] flex items-center justify-center gap-4 text-on-surface-variant">
          <span class="flex items-center gap-1.5 font-medium">
            <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
            Active Lease Term
          </span>
          <span class="flex items-center gap-1.5 font-medium">
            <span class="w-2.5 h-2.5 rounded-full bg-hatch-diagonal border border-primary/30"></span>
            Upcoming Term (▨)
          </span>
        </div>
      </div>

      <!-- Col 3 (Span 1): Lenco Terminal & Real-time Clock (Modeled on Fernly Time Tracker) -->
      <div class="card-bento-hero bg-topo-dark p-5 flex flex-col justify-between text-white">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-white/15">
            <span class="text-[10px] font-bold uppercase tracking-wider text-white/70">Lenco Terminal</span>
            <span class="badge-pill bg-white/15 text-white text-[10px] border border-white/20">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-accent animate-pulse"></span>
              Synchronized
            </span>
          </div>

          <!-- Digital Clock Display in Monospace -->
          <div class="my-5 text-center">
            <p class="text-xs uppercase tracking-widest text-white/60 mb-1 font-semibold">Lusaka Local Time</p>
            <div class="text-3xl font-extrabold font-data-mono tracking-wider text-white drop-shadow-sm">
              {{ currentTime }}
            </div>
            <p class="text-[10px] text-white/60 mt-1.5">Next WhatsApp Sweep: 08:00 AM</p>
          </div>
        </div>

        <!-- Terminal Quick Action Triggers -->
        <div class="pt-3 border-t border-white/15 flex items-center gap-2">
          <button 
            @click="openPaymentModal"
            class="flex-1 py-2 rounded-full bg-white text-hero-dark text-xs font-bold hover:bg-white/90 transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[15px]">add_card</span>
            <span>Record Cash</span>
          </button>
          <router-link 
            to="/app/financials"
            class="w-8 h-8 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            title="Lenco Ledger"
          >
            <span class="material-symbols-outlined text-[16px]">receipt_long</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
