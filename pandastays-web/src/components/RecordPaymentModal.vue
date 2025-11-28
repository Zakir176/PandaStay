<script setup>
import { ref } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'paymentSuccess'])

const paymentForm = ref({
  tenantId: 'e0000001-0000-4000-8000-000000000001',
  phoneNumber: '+260971234567',
  amount: '1200',
  operator: 'mtn',
  paymentMethod: 'Mobile Money',
  generateReceipt: true
})

const isSubmitting = ref(false)
const statusMessage = ref('')
const isError = ref(false)

const handleClose = () => {
  statusMessage.value = ''
  isError.value = false
  emit('close')
}

const submitPayment = async () => {
  isSubmitting.value = true
  statusMessage.value = ''
  isError.value = false

  try {
    const payload = {
      tenant_id: paymentForm.value.tenantId,
      phone_number: paymentForm.value.phoneNumber,
      amount: Number(paymentForm.value.amount),
      operator: paymentForm.value.operator
    }

    const response = await fetch('http://localhost:3001/api/payments/momo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.success) {
      statusMessage.value = `STK push prompt sent to ${paymentForm.value.phoneNumber}! Ref: ${data.reference}`
      isError.value = false
      setTimeout(() => {
        emit('paymentSuccess', data)
        handleClose()
      }, 1500)
    } else {
      statusMessage.value = data.error || 'Failed to initiate Mobile Money collection'
      isError.value = true
    }
  } catch (err) {
    console.error('Error triggering Mobile Money payment:', err)
    statusMessage.value = 'Failed to connect to Lenco Payment Service'
    isError.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Slide-over Background Overlay -->
    <div 
      class="fixed inset-0 bg-inverse-surface/40 z-50 transition-opacity duration-300"
      :class="isOpen ? 'opacity-100 block' : 'opacity-0 hidden'"
      @click="handleClose"
    ></div>

    <!-- Payment Slide-over -->
    <div 
      class="fixed inset-y-0 right-0 w-full md:w-100 bg-surface-container-lowest z-50 transform transition-transform duration-300 shadow-[-10px_0_15px_-3px_rgba(33,49,69,0.2)] border-l border-outline-variant flex flex-col"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex items-center justify-between p-4 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
        <h2 class="font-title-sm text-title-sm text-on-surface">Record Payment</h2>
        <button @click="handleClose" class="text-on-surface-variant hover:text-on-surface transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-stack-default">
        <!-- Status Notification -->
        <div v-if="statusMessage" class="p-3 rounded-lg text-body-sm font-medium" :class="isError ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'">
          {{ statusMessage }}
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-label-caps text-label-caps text-on-surface-variant uppercase">Tenant Name</label>
          <div class="relative">
            <select 
              v-model="paymentForm.tenantId"
              class="w-full h-10 px-3 bg-surface border border-outline-variant rounded text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none"
            >
              <option value="e0000001-0000-4000-8000-000000000001">Chileshe Mubanga - Room 104</option>
              <option value="e0000001-0000-4000-8000-000000000002">John Phiri - Room 101</option>
              <option value="e0000001-0000-4000-8000-000000000003">Mary Banda - Room 101</option>
              <option value="e0000001-0000-4000-8000-000000000004">David Mulenga - Room 102</option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-2.5 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-label-caps text-label-caps text-on-surface-variant uppercase">Phone Number</label>
          <input 
            v-model="paymentForm.phoneNumber"
            class="w-full h-10 px-3 bg-surface border border-outline-variant rounded text-on-surface font-data-mono text-data-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" 
            placeholder="+260 97 1234567" 
            type="text"
          >
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-label-caps text-label-caps text-on-surface-variant uppercase">Amount (ZMW)</label>
          <input 
            v-model="paymentForm.amount"
            class="w-full h-10 px-3 bg-surface border border-outline-variant rounded text-on-surface font-data-mono text-data-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" 
            placeholder="0.00" 
            type="number"
          >
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-label-caps text-label-caps text-on-surface-variant uppercase">Mobile Operator</label>
          <select 
            v-model="paymentForm.operator"
            class="w-full h-10 px-3 bg-surface border border-outline-variant rounded text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option value="mtn">MTN Mobile Money</option>
            <option value="airtel">Airtel Money</option>
            <option value="zamtel">Zamtel Kwacha</option>
          </select>
        </div>

        <div class="flex items-center gap-3 mt-4">
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              v-model="paymentForm.generateReceipt"
              class="sr-only peer" 
              type="checkbox"
            >
            <div class="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            <span class="ml-3 font-body-sm text-body-sm text-on-surface">Generate Digital Receipt</span>
          </label>
        </div>
      </div>

      <div class="p-4 border-t border-outline-variant sticky bottom-0 bg-surface-container-lowest z-10 flex gap-3 justify-end">
        <button 
          @click="handleClose" 
          class="px-4 py-2 border border-outline-variant text-on-surface font-title-sm text-title-sm rounded hover:bg-surface-variant transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="submitPayment"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-primary text-on-primary font-title-sm text-title-sm rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-on-primary-fixed-variant transition-colors active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span>Pay via Mobile Money</span>
        </button>
      </div>
    </div>
  </div>
</template>
