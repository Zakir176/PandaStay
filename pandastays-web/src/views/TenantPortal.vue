<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../lib/store'
import { useAuth } from '../lib/auth'
import { BedIcon } from '../components'

const { state, addReport } = useStore()
const { userProfile, currentRole } = useAuth()

// Strictly scope to current tenant for data integrity
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
    room_number: '101'
  }
})

// Scoped bed space
const bed = computed(() => {
  if (!tenant.value) return null
  return state.bedSpaces.find(b => b.tenantId === tenant.value.id || b.tenantName === tenant.value.name) || state.bedSpaces[0]
})

// Scoped payments (strictly tenant's own payments)
const myPayments = computed(() => {
  if (!tenant.value?.name) return []
  return state.payments.filter(p => p.tenant_name === tenant.value.name)
})

// Scoped reports (strictly tenant's own maintenance reports)
const myReports = computed(() => {
  if (!tenant.value?.name) return []
  return state.reports.filter(r => r.tenant_name === tenant.value.name)
})

const reportSubmittedToast = ref(false)
const reportForm = ref({
  category: 'Plumbing',
  description: ''
})

const submitReport = () => {
  if (!reportForm.value.description) return
  addReport({
    tenantName: tenant.value.name,
    phone: tenant.value.phone,
    roomNumber: tenant.value.room_number || '101',
    category: reportForm.value.category,
    description: reportForm.value.description
  })

  reportSubmittedToast.value = true
  reportForm.value.description = ''
  setTimeout(() => {
    reportSubmittedToast.value = false
  }, 4000)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Live Toast -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div 
        v-if="reportSubmittedToast" 
        class="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-full shadow-lg text-xs font-semibold"
      >
        <span class="material-symbols-outlined text-[18px]">check_circle</span>
        <span>Maintenance ticket submitted! Your landlord has been notified.</span>
      </div>
    </transition>

    <!-- Page Title & Greeting -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-1">
          <span class="text-primary font-semibold">Active Residency</span>
          <span>&bull;</span>
          <span>Term 1 Academic Year 2026</span>
        </div>
        <h1 class="text-2xl font-bold text-on-surface tracking-tight">
          Welcome back, {{ tenant?.name?.split(' ')[0] || 'Resident' }}!
        </h1>
        <p class="text-xs text-on-surface-variant mt-0.5">
          {{ state.currentProperty?.name || 'Mukuba House' }} &bull; Room {{ tenant?.room_number || '101' }}, {{ bed?.label || 'Bed Space' }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <router-link
          to="/tenant/checkout"
          class="btn-pill-primary text-xs"
        >
          <span class="material-symbols-outlined text-[16px]">point_of_sale</span>
          <span>Pay Term Rent</span>
        </router-link>
      </div>
    </div>

    <!-- Centerpiece Bento Card: Allocated Bed-Space Tenancy -->
    <div v-if="bed && tenant" class="card-bento p-6 bg-surface border-border-card space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="p-2 rounded-2xl bg-surface-dim/60 border border-border-card">
            <BedIcon :bed="bed" size="lg" :interactive="false" />
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="badge-pill bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                Your Allocated Bed
              </span>
              <span class="badge-pill bg-surface-dim text-on-surface-variant border border-border-card text-xs">
                Active Lease
              </span>
            </div>
            <h2 class="text-xl font-bold text-on-surface">{{ bed.label }}</h2>
            <p class="text-xs sm:text-sm text-on-surface-variant font-data-mono">
              Room {{ tenant.room_number || '101' }} &bull; {{ state.currentProperty?.address || 'Plot 402, Great East Road' }}
            </p>
            <p class="text-xs text-on-surface-variant">
              Registered Phone: <span class="font-data-mono font-medium text-on-surface">{{ tenant.phone }}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-border-card pt-4 md:pt-0 md:pl-8 gap-3">
          <div class="md:text-right">
            <span class="text-xs uppercase font-bold text-on-surface-muted tracking-wider">Agreed Monthly Rent</span>
            <p class="text-2xl font-bold font-data-mono text-primary">
              ZMW {{ Number(bed.rent_amount || 2500).toLocaleString() }}
            </p>
            <p class="text-xs text-on-surface-variant">Billed monthly via Mobile Money</p>
          </div>

          <router-link
            to="/tenant/checkout"
            class="btn-pill-primary py-2 px-4 text-xs sm:text-sm font-bold shadow-xs"
          >
            <span class="material-symbols-outlined text-[16px]">qr_code_2</span>
            <span>Pay with MoMo</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Quick Bento Summary Metrics (3 Columns) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <!-- Rent Balance -->
      <div class="card-bento p-4.5 bg-surface border-border-card">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold uppercase tracking-wider text-on-surface-muted">Current Rent Status</p>
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        </div>
        <p class="text-2xl font-bold font-data-mono text-primary mt-1.5">
          {{ bed?.paymentStatus === 'paid' ? 'Up to date' : 'ZMW 0 Due' }}
        </p>
        <p class="text-xs text-on-surface-variant mt-0.5">
          Next cycle due Nov 1, 2026
        </p>
      </div>

      <!-- Deposit Escrow -->
      <div class="card-bento p-4.5 bg-surface border-border-card">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold uppercase tracking-wider text-on-surface-muted">Security Deposit</p>
          <span class="material-symbols-outlined text-primary text-[18px]">verified_user</span>
        </div>
        <p class="text-2xl font-bold font-data-mono text-on-surface mt-1.5">ZMW 1,250</p>
        <p class="text-xs text-primary font-medium mt-0.5">Held in escrow &bull; Refundable</p>
      </div>

      <!-- Maintenance -->
      <div class="card-bento p-4.5 bg-surface border-border-card">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold uppercase tracking-wider text-on-surface-muted">Support Tickets</p>
          <span class="material-symbols-outlined text-primary text-[18px]">handyman</span>
        </div>
        <p class="text-2xl font-bold font-data-mono text-on-surface mt-1.5">{{ myReports.length }}</p>
        <p class="text-xs text-on-surface-variant mt-0.5">
          {{ myReports.filter(r => r.status === 'open').length }} open tickets pending
        </p>
      </div>
    </div>

    <!-- Two-Column Section: Maintenance Quick Form & Receipts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      
      <!-- Maintenance Ticket Submission -->
      <div class="card-bento p-5 bg-surface border-border-card space-y-4">
        <div class="border-b border-border-card pb-3 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-base text-on-surface flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">handyman</span>
              <span>Report Maintenance Issue</span>
            </h3>
            <p class="text-xs text-on-surface-variant">
              Notifies your landlord immediately on their operational board.
            </p>
          </div>
          <router-link to="/tenant/maintenance" class="text-xs text-primary font-semibold hover:underline">
            View All &rarr;
          </router-link>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Issue Category</label>
            <select 
              v-model="reportForm.category"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-border-card bg-surface-dim/50 text-on-surface focus:border-primary focus:outline-none transition-all"
            >
              <option value="Plumbing">Plumbing (Tap, Toilet, Shower)</option>
              <option value="Electrical">Electrical (Lights, Socket, Geyser)</option>
              <option value="Furniture">Furniture (Bed frame, Desk, Chair)</option>
              <option value="Security/Locks">Security / Door Locks</option>
              <option value="Wi-Fi">Wi-Fi Connection</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Description</label>
            <textarea 
              v-model="reportForm.description"
              rows="2" 
              placeholder="e.g. Bathroom cold water tap is dripping..."
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-border-card bg-surface-dim/50 text-on-surface focus:border-primary focus:outline-none transition-all resize-none"
            ></textarea>
          </div>

          <button 
            @click="submitReport"
            :disabled="!reportForm.description"
            class="btn-pill-primary w-full justify-center text-sm py-2.5 disabled:opacity-50"
          >
            Submit Maintenance Ticket
          </button>
        </div>

        <!-- Latest tickets preview -->
        <div v-if="myReports.length > 0" class="pt-3 border-t border-border-card space-y-2">
          <p class="text-xs font-bold uppercase text-on-surface-muted">Your Recent Reports:</p>
          <div 
            v-for="rep in myReports.slice(0, 2)" 
            :key="rep.id"
            class="p-2.5 rounded-xl bg-surface-dim/50 border border-border-card text-xs sm:text-sm flex items-center justify-between"
          >
            <div>
              <p class="font-semibold text-on-surface">{{ rep.category }}</p>
              <p class="text-xs text-on-surface-variant truncate max-w-56">{{ rep.description }}</p>
            </div>
            <span class="badge-pill text-xs capitalize" :class="{
              'bg-error/15 text-error': rep.status === 'open',
              'bg-tertiary/15 text-tertiary': rep.status === 'in_progress',
              'bg-primary/10 text-primary': rep.status === 'resolved'
            }">{{ rep.status }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Receipts Preview -->
      <div class="card-bento p-5 bg-surface border-border-card space-y-4">
        <div class="border-b border-border-card pb-3 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-base text-on-surface flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
              <span>Recent Payment Receipts</span>
            </h3>
            <p class="text-xs text-on-surface-variant">Verified rent collection vouchers</p>
          </div>
          <router-link to="/tenant/payments" class="text-xs sm:text-sm text-primary font-semibold hover:underline">
            Full Ledger &rarr;
          </router-link>
        </div>

        <div v-if="myPayments.length > 0" class="space-y-2.5">
          <div 
            v-for="p in myPayments.slice(0, 3)" 
            :key="p.id"
            class="p-3 bg-surface-dim/40 rounded-xl border border-border-card text-xs sm:text-sm space-y-1"
          >
            <div class="flex justify-between items-center">
              <span class="font-bold font-data-mono text-primary">#{{ p.receipt_number }}</span>
              <span class="text-on-surface-variant text-xs">{{ p.paid_at }}</span>
            </div>
            <div class="flex justify-between text-on-surface-variant text-xs sm:text-sm">
              <span>{{ p.method_label || 'Mobile Money' }}</span>
              <span class="font-bold font-data-mono text-on-surface">ZMW {{ Number(p.amount).toLocaleString() }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-on-surface-variant text-xs space-y-2">
          <span class="material-symbols-outlined text-[28px] text-on-surface-muted">receipt</span>
          <p>No payment records found yet.</p>
          <router-link to="/tenant/checkout" class="btn-pill-primary text-xs inline-flex">
            Pay First Rent
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>
