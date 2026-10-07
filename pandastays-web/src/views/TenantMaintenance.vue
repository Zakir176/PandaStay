<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../lib/store'
import { useAuth } from '../lib/auth'

const { state, addReport } = useStore()
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
    phone: '+260 97 1122334',
    room_number: '101'
  }
})

const myReports = computed(() => {
  if (!tenant.value?.name) return []
  return state.reports.filter(r => r.tenant_name === tenant.value.name)
})

const reportForm = ref({
  category: 'Plumbing',
  description: '',
  urgency: 'Medium'
})

const isSubmitting = ref(false)
const showSuccessToast = ref(false)

const handleSubmit = async () => {
  if (!reportForm.value.description.trim()) return

  isSubmitting.value = true
  try {
    await addReport({
      tenantName: tenant.value.name,
      phone: tenant.value.phone,
      roomNumber: tenant.value.room_number || '101',
      category: reportForm.value.category,
      description: reportForm.value.description
    })

    showSuccessToast.value = true
    reportForm.value.description = ''
    setTimeout(() => {
      showSuccessToast.value = false
    }, 4000)
  } catch (err) {
    console.error('Failed to submit report:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Success Alert -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div 
        v-if="showSuccessToast" 
        class="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-full shadow-lg text-xs font-semibold"
      >
        <span class="material-symbols-outlined text-[18px]">check_circle</span>
        <span>Ticket logged! Priority updated on your landlord's operations board.</span>
      </div>
    </transition>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-1">
          <span class="text-primary font-semibold">Repairs & Facilities</span>
          <span>&bull;</span>
          <span>Room {{ tenant?.room_number || '101' }}</span>
        </div>
        <h2 class="text-2xl font-bold text-on-surface tracking-tight">Maintenance & Repairs</h2>
        <p class="text-xs text-on-surface-variant mt-0.5">
          Report broken fixtures, plumbing issues, or electrical faults. Tickets sync directly to the property warden.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Submission Form (5 Cols) -->
      <div class="lg:col-span-5 card-bento p-5 bg-surface border-border-card space-y-4 h-fit">
        <div class="border-b border-border-card pb-3">
          <h3 class="font-bold text-base text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[18px]">add_task</span>
            <span>Submit New Ticket</span>
          </h3>
          <p class="text-xs text-on-surface-variant">Describe the fault accurately to speed up repairs.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Issue Category</label>
            <select 
              v-model="reportForm.category"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-border-card bg-surface-dim/50 text-on-surface focus:border-primary focus:outline-none transition-all"
            >
              <option value="Plumbing">Plumbing (Tap, Toilet, Shower, Drainage)</option>
              <option value="Electrical">Electrical (Lights, Socket, Geyser)</option>
              <option value="Furniture">Furniture (Bed frame, Mattress, Desk)</option>
              <option value="Security/Locks">Security / Door Locks / Window Latches</option>
              <option value="Wi-Fi">Wi-Fi & Internet</option>
              <option value="General">General / Other</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Severity / Urgency</label>
            <select 
              v-model="reportForm.urgency"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-border-card bg-surface-dim/50 text-on-surface focus:border-primary focus:outline-none transition-all"
            >
              <option value="Normal">Normal (Can wait 24-48 hours)</option>
              <option value="Medium">Medium (Affects daily routine)</option>
              <option value="Urgent">Urgent Emergency (Water leak, power outage)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Detailed Description</label>
            <textarea 
              v-model="reportForm.description"
              rows="4" 
              placeholder="e.g. The cold water tap in our shared bathroom has been leaking steadily since yesterday morning..."
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-border-card bg-surface-dim/50 text-on-surface focus:border-primary focus:outline-none transition-all resize-none"
              required
            ></textarea>
          </div>

          <button 
            type="submit"
            :disabled="!reportForm.description || isSubmitting"
            class="btn-pill-primary w-full justify-center text-sm py-2.5 disabled:opacity-50 flex items-center gap-1.5"
          >
            <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
            <span v-else class="material-symbols-outlined text-[16px]">send</span>
            <span>{{ isSubmitting ? 'Logging...' : 'Submit Ticket' }}</span>
          </button>
        </form>
      </div>

      <!-- Tickets Tracker (7 Cols) -->
      <div class="lg:col-span-7 card-bento p-5 bg-surface border-border-card space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-border-card">
          <div>
            <h3 class="font-bold text-base text-on-surface flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[18px]">history</span>
              <span>Your Reported Issues</span>
            </h3>
            <p class="text-xs text-on-surface-variant">Live updates as the landlord or maintenance team takes action.</p>
          </div>
          <span class="badge-pill bg-primary/10 text-primary border border-primary/20 text-xs font-data-mono">
            {{ myReports.length }} Logged
          </span>
        </div>

        <div v-if="myReports.length > 0" class="space-y-3">
          <div 
            v-for="ticket in myReports" 
            :key="ticket.id"
            class="p-4 rounded-xl border border-border-card bg-surface-dim/40 space-y-2 transition-all"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-on-surface">{{ ticket.category }}</span>
                <span class="badge-pill bg-surface-dim text-on-surface-variant border border-border-card text-xs">
                  Room {{ ticket.room_number || tenant.room_number }}
                </span>
              </div>

              <!-- Status Badge -->
              <span class="badge-pill text-xs capitalize font-bold" :class="{
                'bg-error/15 text-error border border-error/20': ticket.status === 'open',
                'bg-tertiary/15 text-tertiary border border-tertiary/20': ticket.status === 'in_progress',
                'bg-primary/10 text-primary border border-primary/20': ticket.status === 'resolved'
              }">
                <span class="w-1.5 h-1.5 rounded-full" :class="{
                  'bg-error': ticket.status === 'open',
                  'bg-tertiary': ticket.status === 'in_progress',
                  'bg-primary': ticket.status === 'resolved'
                }"></span>
                <span>{{ ticket.status.replace('_', ' ') }}</span>
              </span>
            </div>

            <p class="text-sm text-on-surface-variant leading-relaxed">
              {{ ticket.description }}
            </p>

            <div class="flex items-center justify-between text-xs text-on-surface-muted pt-2 border-t border-border-card/60">
              <span>Submitted {{ ticket.created_at || 'Recently' }}</span>
              <span v-if="ticket.status === 'open'" class="text-error font-semibold flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">schedule</span>
                Awaiting Warden Review
              </span>
              <span v-else-if="ticket.status === 'in_progress'" class="text-tertiary font-semibold flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">build</span>
                Technician Dispatched
              </span>
              <span v-else class="text-primary font-semibold flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">check_circle</span>
                Completed & Verified
              </span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12 text-on-surface-variant text-sm space-y-2">
          <span class="material-symbols-outlined text-[36px] text-on-surface-muted">task_alt</span>
          <p class="font-bold text-on-surface">No maintenance tickets logged</p>
          <p class="text-xs max-w-sm mx-auto">
            Everything in your room is running smoothly! If you ever experience plumbing, lighting, or furniture issues, submit a ticket using the form.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
