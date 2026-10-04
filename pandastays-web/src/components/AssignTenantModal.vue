<script setup>
import { ref } from 'vue'
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

const emit = defineEmits(['close', 'tenantAssigned'])

const { onboardTenant, recordPayment } = useStore()

const newTenantForm = ref({
  name: '',
  phone: '',
  idNumber: '',
  emergencyName: '',
  emergencyPhone: ''
})

const isSubmitting = ref(false)

const handleClose = () => {
  newTenantForm.value = {
    name: '',
    phone: '',
    idNumber: '',
    emergencyName: '',
    emergencyPhone: ''
  }
  emit('close')
}

const assignTenant = async () => {
  if (!newTenantForm.value.name || !props.bed) return

  isSubmitting.value = true
  try {
    await onboardTenant({
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
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-xs"
  >
    <div class="card-tight w-full max-w-md p-6 bg-surface-container-lowest shadow-lg space-y-4">
      <div class="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h3 class="font-bold text-lg text-on-surface">Assign Tenant to {{ bed?.label }}</h3>
          <p class="text-xs text-on-surface-variant">Creates active tenancy and records first rent payment.</p>
        </div>
        <button @click="handleClose" class="text-on-surface-variant hover:text-on-surface">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Full Name</label>
          <input 
            v-model="newTenantForm.name"
            type="text" 
            placeholder="e.g. Mwelwa Mwansa"
            class="w-full px-3 py-2 text-sm rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Phone (WhatsApp)</label>
            <input 
              v-model="newTenantForm.phone"
              type="text" 
              placeholder="+260 97 1234567"
              class="w-full px-3 py-2 text-sm rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">NRC / Student ID</label>
            <input 
              v-model="newTenantForm.idNumber"
              type="text" 
              placeholder="409182/11/1"
              class="w-full px-3 py-2 text-sm rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Emergency Contact</label>
            <input 
              v-model="newTenantForm.emergencyName"
              type="text" 
              placeholder="Parent / Guardian"
              class="w-full px-3 py-2 text-sm rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Emergency Phone</label>
            <input 
              v-model="newTenantForm.emergencyPhone"
              type="text" 
              placeholder="+260 96 7654321"
              class="w-full px-3 py-2 text-sm rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono"
            />
          </div>
        </div>

        <!-- Rent Pricing Confirmation -->
        <div class="p-3 rounded-sm bg-primary-container/40 border border-primary/20 flex items-center justify-between text-xs">
          <div>
            <p class="font-semibold text-primary">Monthly Rent Rate</p>
            <p class="text-on-surface-variant">Billed monthly via Mobile Money</p>
          </div>
          <p class="font-data-mono font-bold text-base text-primary">
            ZMW {{ Number(bed?.rent_amount || 2500).toLocaleString() }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
        <button 
          @click="handleClose"
          class="px-4 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface"
        >
          Cancel
        </button>
        <button 
          @click="assignTenant"
          :disabled="!newTenantForm.name || isSubmitting"
          class="px-4 py-2 text-xs font-semibold bg-primary text-on-primary rounded-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
        >
          <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
          <span>{{ isSubmitting ? 'Assigning...' : 'Confirm & Assign Bed' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
