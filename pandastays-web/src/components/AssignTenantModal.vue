<script setup>
import { ref, watch } from 'vue'
import { useStore } from '../lib/store'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  bed: {
    type: Object,
    default: null
  },
  room: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'tenantAssigned', 'bedReserved', 'bedReleased'])

const { onboardTenant, recordPayment, reserveBedSpace, releaseBedSpace } = useStore()

// Tabs: 'reserve' | 'move_in' | 'reserved_details'
const activeTab = ref('reserve')

const reserveForm = ref({
  name: '',
  phone: '',
  notes: ''
})

const newTenantForm = ref({
  name: '',
  phone: '',
  idNumber: '',
  emergencyName: '',
  emergencyPhone: ''
})

const isSubmitting = ref(false)

// Reset or prefill form when modal opens or bed changes
watch([() => props.isOpen, () => props.bed], ([open, bed]) => {
  if (open && bed) {
    if (bed.status === 'reserved') {
      activeTab.value = 'reserved_details'
      reserveForm.value = {
        name: bed.tenantName || '',
        phone: bed.tenantPhone || '',
        notes: bed.reservationNotes || ''
      }
      newTenantForm.value.name = bed.tenantName && bed.tenantName !== 'Reserved (Deposit Pending)' ? bed.tenantName : ''
      newTenantForm.value.phone = bed.tenantPhone || ''
    } else {
      activeTab.value = 'reserve'
      reserveForm.value = {
        name: '',
        phone: '',
        notes: ''
      }
      newTenantForm.value = {
        name: '',
        phone: '',
        idNumber: '',
        emergencyName: '',
        emergencyPhone: ''
      }
    }
  }
})

const handleClose = () => {
  emit('close')
}

// 1. Handle Unpaid Reservation
const handleReserveBed = async () => {
  if (!reserveForm.value.name || !props.bed) return

  isSubmitting.value = true
  try {
    await reserveBedSpace({
      bedSpaceId: props.bed.id,
      studentName: reserveForm.value.name,
      studentPhone: reserveForm.value.phone,
      notes: reserveForm.value.notes
    })

    emit('bedReserved', {
      bed: props.bed,
      studentName: reserveForm.value.name,
      phone: reserveForm.value.phone
    })

    handleClose()
  } catch (err) {
    console.error('Failed to reserve bed:', err)
  } finally {
    isSubmitting.value = false
  }
}

// 2. Handle Immediate Move-In (Onboard + Initial Payment)
const assignTenant = async () => {
  if (!newTenantForm.value.name || !props.bed) return

  isSubmitting.value = true
  try {
    const onboardResult = await onboardTenant({
      name: newTenantForm.value.name,
      phone: newTenantForm.value.phone,
      idNumber: newTenantForm.value.idNumber,
      emergencyName: newTenantForm.value.emergencyName,
      emergencyPhone: newTenantForm.value.emergencyPhone,
      bedSpaceId: props.bed.id,
      rentAmount: props.bed.rent_amount
    })

    // Record initial move-in payment
    await recordPayment({
      tenancyId: onboardResult?.tenancyId,
      tenantId: onboardResult?.tenantId,
      tenantName: newTenantForm.value.name,
      bedLabel: props.bed.label,
      amount: props.bed.rent_amount,
      paymentMethod: 'momo_mtn',
      paymentMethodLabel: 'MTN MoMo',
      reference: `LNC-INIT-${Date.now().toString().slice(-6)}`
    })

    emit('tenantAssigned', {
      bed: props.bed,
      tenantName: newTenantForm.value.name
    })

    handleClose()
  } catch (err) {
    console.error('Failed to assign tenant:', err)
  } finally {
    isSubmitting.value = false
  }
}

// 3. Handle Release Reservation (Revert to Vacant)
const handleReleaseBed = async () => {
  if (!props.bed) return

  isSubmitting.value = true
  try {
    await releaseBedSpace(props.bed.id)
    emit('bedReleased', { bed: props.bed })
    handleClose()
  } catch (err) {
    console.error('Failed to release reservation:', err)
  } finally {
    isSubmitting.value = false
  }
}

// 4. Switch from Reserved Details to Move-In
const proceedToMoveIn = () => {
  if (props.bed?.tenantName && props.bed.tenantName !== 'Reserved (Deposit Pending)') {
    newTenantForm.value.name = props.bed.tenantName
  }
  if (props.bed?.tenantPhone) {
    newTenantForm.value.phone = props.bed.tenantPhone
  }
  activeTab.value = 'move_in'
}
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-xs"
  >
    <div class="card-bento w-full max-w-lg p-6 bg-surface shadow-2xl space-y-4 border border-outline-variant/60 max-h-[90vh] overflow-y-auto">
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-outline-variant/60 pb-3">
        <div>
          <div class="flex items-center gap-2 mb-0.5">
            <span class="badge-pill bg-primary/10 text-primary border border-primary/20 text-[10px]">
              {{ bed?.label }}
            </span>
            <span v-if="bed?.status === 'reserved'" class="badge-pill bg-hatch-diagonal text-tertiary border border-tertiary/30 text-[10px]">
              Currently Reserved
            </span>
            <span v-else class="badge-pill bg-surface-dim text-on-surface-variant border border-border-card text-[10px]">
              Vacant
            </span>
          </div>
          <h3 class="font-bold text-lg text-on-surface">
            {{ bed?.status === 'reserved' && activeTab === 'reserved_details' ? 'Manage Bed Reservation' : 'Bed Allocation & Reservation' }}
          </h3>
          <p class="text-xs text-on-surface-variant">
            Room {{ bed?.label?.match(/\d+/)?.[0] || '101' }} &bull; ZMW {{ Number(bed?.rent_amount || 2500).toLocaleString() }}/month
          </p>
        </div>
        <button 
          @click="handleClose" 
          class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <!-- Mode Selector Tabs (when not inspecting existing reservation, or when toggling) -->
      <div v-if="bed?.status !== 'reserved' || activeTab !== 'reserved_details'" class="flex p-1 bg-surface-dim rounded-xl border border-border-card gap-1">
        <button
          type="button"
          @click="activeTab = 'reserve'"
          class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          :class="activeTab === 'reserve' ? 'bg-surface text-primary shadow-xs border border-primary/20' : 'text-on-surface-variant hover:text-on-surface'"
        >
          <span class="material-symbols-outlined text-[16px]">lock_clock</span>
          <span>Reserve Bed (Unpaid Hold)</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'move_in'"
          class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          :class="activeTab === 'move_in' ? 'bg-surface text-primary shadow-xs border border-primary/20' : 'text-on-surface-variant hover:text-on-surface'"
        >
          <span class="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Full Move-In (Paid)</span>
        </button>
      </div>

      <!-- VIEW 1: MANAGE EXISTING RESERVATION -->
      <div v-if="bed?.status === 'reserved' && activeTab === 'reserved_details'" class="space-y-4">
        <div class="p-4 rounded-xl bg-hatch-diagonal border border-primary/20 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">lock_clock</span>
              Active Reservation
            </span>
            <span class="badge-pill bg-tertiary/15 text-tertiary border border-tertiary/20 text-[10px]">
              Deposit Pending &bull; Unpaid
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <div>
              <p class="text-[10px] text-on-surface-muted uppercase font-bold">Prospective Student</p>
              <p class="text-sm font-bold text-on-surface mt-0.5">
                {{ bed.tenantName || 'Holding Prospect' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] text-on-surface-muted uppercase font-bold">Contact Phone</p>
              <p class="text-sm font-data-mono font-medium text-on-surface mt-0.5">
                {{ bed.tenantPhone || 'Not provided' }}
              </p>
            </div>
          </div>

          <div v-if="bed.reservationNotes" class="pt-1 border-t border-primary/10">
            <p class="text-[10px] text-on-surface-muted uppercase font-bold">Reservation Notes</p>
            <p class="text-xs text-on-surface-variant mt-0.5 italic">
              "{{ bed.reservationNotes }}"
            </p>
          </div>
        </div>

        <div class="bg-surface-dim/70 p-3 rounded-xl border border-border-card text-xs text-on-surface-variant space-y-1">
          <p class="font-semibold text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-primary">info</span>
            What would you like to do?
          </p>
          <p>
            When the student pays or arrives with their deposit, click <strong>"Complete Move-In"</strong> to record their tenancy and mobile money payment. If they cancel, release the bed back to vacant.
          </p>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-outline-variant/60 gap-3">
          <button 
            @click="handleReleaseBed"
            :disabled="isSubmitting"
            type="button"
            class="btn-pill-outline text-xs text-error border-error/30 hover:bg-error/10 hover:border-error flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-[15px]">event_busy</span>
            <span>Cancel & Release Bed</span>
          </button>
          
          <div class="flex items-center gap-2">
            <button 
              @click="handleClose"
              type="button"
              class="btn-pill-outline text-xs"
            >
              Close
            </button>
            <button 
              @click="proceedToMoveIn"
              type="button"
              class="btn-pill-primary text-xs flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-[16px]">how_to_reg</span>
              <span>Complete Move-In</span>
            </button>
          </div>
        </div>
      </div>

      <!-- VIEW 2: ADD RESERVATION (UNPAID HOLD) -->
      <div v-else-if="activeTab === 'reserve'" class="space-y-3.5">
        <div class="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-on-surface-variant flex items-start gap-2.5">
          <span class="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">lock</span>
          <div>
            <p class="font-bold text-on-surface">No upfront payment required</p>
            <p class="text-[11px] mt-0.5">
              Lock this bed space for a student while they arrange tuition or travel. The bed status will update to <span class="font-semibold text-primary">Reserved ▨</span> across the floorplan.
            </p>
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
            Student / Prospect Name <span class="text-error">*</span>
          </label>
          <input 
            v-model="reserveForm.name"
            type="text" 
            placeholder="e.g. Sarah Mwamba"
            class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none transition-all"
            required
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
            Phone Number (WhatsApp)
          </label>
          <input 
            v-model="reserveForm.phone"
            type="text" 
            placeholder="+260 97 1234567"
            class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono transition-all"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
            Notes / Holding Terms (Optional)
          </label>
          <textarea 
            v-model="reserveForm.notes"
            rows="2"
            placeholder="e.g. Held until Friday 10:00 AM; paying via MTN MoMo upon campus arrival."
            class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none transition-all resize-none"
          ></textarea>
        </div>

        <!-- Rent Pricing Info -->
        <div class="p-3 rounded-xl bg-surface-dim border border-border-card flex items-center justify-between text-xs">
          <div>
            <p class="font-bold text-on-surface">Agreed Monthly Rent</p>
            <p class="text-on-surface-variant text-[11px]">Payable upon check-in</p>
          </div>
          <p class="font-data-mono font-bold text-sm text-primary">
            ZMW {{ Number(bed?.rent_amount || 2500).toLocaleString() }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/60">
          <button 
            type="button"
            @click="handleClose"
            class="btn-pill-outline text-xs"
          >
            Cancel
          </button>
          <button 
            type="button"
            @click="handleReserveBed"
            :disabled="!reserveForm.name || isSubmitting"
            class="btn-pill-primary text-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
            <span class="material-symbols-outlined text-[16px]" v-else>lock_clock</span>
            <span>{{ isSubmitting ? 'Reserving...' : 'Confirm Reservation (Unpaid)' }}</span>
          </button>
        </div>
      </div>

      <!-- VIEW 3: FULL IMMEDIATE MOVE-IN (PAID) -->
      <div v-else-if="activeTab === 'move_in'" class="space-y-3.5">
        <div>
          <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
            Full Name <span class="text-error">*</span>
          </label>
          <input 
            v-model="newTenantForm.name"
            type="text" 
            placeholder="e.g. Mwelwa Mwansa"
            class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none transition-all"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">Phone (WhatsApp)</label>
            <input 
              v-model="newTenantForm.phone"
              type="text" 
              placeholder="+260 97 1234567"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono transition-all"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">NRC / Student ID</label>
            <input 
              v-model="newTenantForm.idNumber"
              type="text" 
              placeholder="409182/11/1"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">Emergency Contact</label>
            <input 
              v-model="newTenantForm.emergencyName"
              type="text" 
              placeholder="Parent / Guardian"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">Emergency Phone</label>
            <input 
              v-model="newTenantForm.emergencyPhone"
              type="text" 
              placeholder="+260 96 7654321"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono transition-all"
            />
          </div>
        </div>

        <!-- Rent Pricing Confirmation -->
        <div class="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
          <div>
            <p class="font-bold text-primary">Move-In Rent Payment</p>
            <p class="text-on-surface-variant text-[11px]">Will create active tenancy and record receipt</p>
          </div>
          <p class="font-data-mono font-bold text-base text-primary">
            ZMW {{ Number(bed?.rent_amount || 2500).toLocaleString() }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/60">
          <button 
            type="button"
            @click="handleClose"
            class="btn-pill-outline text-xs"
          >
            Cancel
          </button>
          <button 
            type="button"
            @click="assignTenant"
            :disabled="!newTenantForm.name || isSubmitting"
            class="btn-pill-primary text-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
            <span class="material-symbols-outlined text-[16px]" v-else>check_circle</span>
            <span>{{ isSubmitting ? 'Assigning...' : 'Confirm & Move-In (Paid)' }}</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
