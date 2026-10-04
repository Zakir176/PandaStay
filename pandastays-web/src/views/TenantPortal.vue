<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../lib/store'
import BedIcon from '../components/BedIcon.vue'
import AuthModal from '../components/AuthModal.vue'

const { state, addReport } = useStore()

const currentTenantId = ref(state.tenants[0]?.id || '')
const reportSubmittedToast = ref(false)
const isAuthModalOpen = ref(false)

const tenant = computed(() => {
  return state.tenants.find(t => t.id === currentTenantId.value) || state.tenants[0]
})

const bed = computed(() => {
  return state.bedSpaces.find(b => b.tenantId === tenant.value?.id || b.tenantName === tenant.value?.name) || state.bedSpaces[0]
})

const myPayments = computed(() => {
  return state.payments.filter(p => p.tenant_name === tenant.value?.name)
})

const myReports = computed(() => {
  return state.reports.filter(r => r.tenant_name === tenant.value?.name)
})

// Maintenance report form
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
  <div class="min-h-screen bg-surface py-8 px-4 max-w-4xl mx-auto space-y-6">
    <!-- Live Toast -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div 
        v-if="reportSubmittedToast" 
        class="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-sm shadow-md text-xs font-medium"
      >
        <span class="material-symbols-outlined text-[18px]">check_circle</span>
        <span>Maintenance ticket submitted! Your landlord has been notified.</span>
      </div>
    </transition>

    <!-- Supabase Auth Modal -->
    <AuthModal
      :is-open="isAuthModalOpen"
      initial-role="tenant"
      @close="isAuthModalOpen = false"
    />

    <!-- Header Navigation -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-sm bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
          PS
        </div>
        <div>
          <h1 class="text-xl font-bold text-on-surface">PandaStays Tenant Portal</h1>
          <p class="text-xs text-on-surface-variant">{{ state.currentProperty.name }} &bull; Boarding House Residency</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Switch Tenant Mock Selector -->
        <select 
          v-model="currentTenantId"
          class="px-2.5 py-1.5 text-xs rounded-sm border border-outline bg-surface-container-low text-on-surface focus:outline-none"
        >
          <option v-for="t in state.tenants" :key="t.id" :value="t.id">
            Viewing: {{ t.name }}
          </option>
        </select>

        <button 
          @click="isAuthModalOpen = true"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container text-primary text-xs font-semibold rounded-sm hover:bg-primary/20 transition-colors"
        >
          <span class="material-symbols-outlined text-[16px]">login</span>
          <span>Tenant Sign In</span>
        </button>

        <router-link
          to="/app"
          class="text-xs text-on-surface-variant hover:text-primary font-medium"
        >
          &larr; Landlord Portal
        </router-link>
      </div>
    </div>

    <!-- Active Bed-Space Tenancy Banner -->
    <div v-if="bed && tenant" class="card-tight p-5 bg-surface-container-lowest card-accent-paid flex flex-col sm:flex-row sm:items-center justify-between gap-5">
      <div class="flex items-center gap-4">
        <BedIcon :bed="bed" size="lg" :interactive="false" />
        <div>
          <span class="badge-pill bg-primary-container text-primary text-[10px] font-semibold mb-1">
            Allocated Bed-Space
          </span>
          <h2 class="text-xl font-bold text-on-surface">{{ bed.label }}</h2>
          <p class="text-xs text-on-surface-variant font-data-mono">
            Room {{ tenant.room_number || '101' }} &bull; {{ state.currentProperty?.name }}
          </p>
          <p class="text-xs text-on-surface-variant mt-1">
            Emergency: {{ tenant.emergency_contact_name }} ({{ tenant.emergency_contact_phone }})
          </p>
        </div>
      </div>

      <div class="sm:text-right border-t sm:border-t-0 sm:border-l border-outline-variant pt-3 sm:pt-0 sm:pl-6 space-y-2">
        <span class="text-[10px] uppercase font-bold text-on-surface-variant">Monthly Rent</span>
        <p class="text-2xl font-bold font-data-mono text-primary">
          ZMW {{ Number(bed.rent_amount || 0).toLocaleString() }}
        </p>
        <router-link
          to="/tenant/checkout"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-xs"
        >
          <span class="material-symbols-outlined text-[16px]">point_of_sale</span>
          Pay Rent Now
        </router-link>
      </div>
    </div>
    <div v-else class="card-tight p-6 bg-surface-container-lowest text-center text-on-surface-variant text-xs font-data-mono">
      No active bed-space allocated yet. Once assigned by your landlord, your room details and rent payment invoice will appear here.
    </div>

    <!-- Two Columns: Maintenance Report Submission & Payment History -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Maintenance Ticket Submission -->
      <div class="card-tight p-5 bg-surface-container-lowest space-y-4">
        <div class="border-b border-outline-variant/60 pb-3">
          <h3 class="font-bold text-sm text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[18px]">handyman</span>
            Report a Maintenance Issue (Section 4.6)
          </h3>
          <p class="text-xs text-on-surface-variant">
            Issues appear immediately on your landlord's priority dashboard.
          </p>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Category</label>
            <select 
              v-model="reportForm.category"
              class="w-full px-3 py-2 text-xs rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="Plumbing">Plumbing (Tap, Toilet, Shower)</option>
              <option value="Electrical">Electrical (Lights, Socket, Geyser)</option>
              <option value="Furniture">Furniture (Bed frame, Desk, Chair)</option>
              <option value="Security/Locks">Security / Door Locks</option>
              <option value="Wi-Fi">Wi-Fi Connection</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Issue Description</label>
            <textarea 
              v-model="reportForm.description"
              rows="3" 
              placeholder="Describe the issue in detail (e.g. bathroom cold tap dripping)..."
              class="w-full px-3 py-2 text-xs rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
            ></textarea>
          </div>

          <button 
            @click="submitReport"
            :disabled="!reportForm.description"
            class="w-full py-2 bg-primary text-on-primary text-xs font-semibold rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Submit Maintenance Report
          </button>
        </div>

        <!-- My Open Tickets -->
        <div v-if="myReports.length > 0" class="pt-3 border-t border-outline-variant/60 space-y-2">
          <h4 class="text-xs font-semibold text-on-surface">Your Reported Issues:</h4>
          <div 
            v-for="rep in myReports" 
            :key="rep.id"
            class="p-2.5 rounded-sm bg-surface-container-low border border-outline-variant text-xs space-y-1"
          >
            <div class="flex items-center justify-between">
              <span class="font-semibold text-on-surface">{{ rep.category }}</span>
              <span class="badge-pill py-0.5 px-2 text-[10px]" :class="{
                'bg-error-container text-error': rep.status === 'open',
                'bg-tertiary-container text-tertiary': rep.status === 'in_progress',
                'bg-primary-container text-primary': rep.status === 'resolved'
              }">{{ rep.status }}</span>
            </div>
            <p class="text-on-surface-variant text-[11px]">{{ rep.description }}</p>
          </div>
        </div>
      </div>

      <!-- Payment History & Receipt Vouchers -->
      <div class="receipt-paper rounded-sm p-5 border border-outline space-y-4">
        <div class="border-b border-outline pb-3 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-sm text-on-surface font-data-mono">RENT PAYMENT RECEIPTS</h3>
            <p class="text-xs text-on-surface-variant">Verified accommodation payment history</p>
          </div>
          <span class="badge-pill bg-primary-container text-primary text-[10px] font-data-mono">
            {{ myPayments.length }} Receipts
          </span>
        </div>

        <div v-if="myPayments.length > 0" class="space-y-3">
          <div 
            v-for="p in myPayments" 
            :key="p.id"
            class="p-3 bg-surface-container-lowest rounded-sm border border-outline-variant font-data-mono text-xs space-y-1"
          >
            <div class="flex justify-between items-center">
              <span class="font-bold text-primary">{{ p.receipt_number }}</span>
              <span class="text-on-surface-variant text-[10px]">{{ p.paid_at }}</span>
            </div>
            <div class="flex justify-between text-on-surface-variant">
              <span>Method: {{ p.method_label }}</span>
              <span class="font-bold text-on-surface">ZMW {{ Number(p.amount).toLocaleString() }}</span>
            </div>
            <div class="text-[10px] text-on-surface-variant/70 truncate">
              Ref: {{ p.gateway_reference }}
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-on-surface-variant text-xs font-data-mono">
          No payments recorded yet. Click "Pay Rent Now" to clear your term rent.
        </div>
      </div>
    </div>
  </div>
</template>
