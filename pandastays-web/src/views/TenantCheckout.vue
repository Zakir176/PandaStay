<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../lib/store'
import { ReceiptVoucher } from '../components'

const router = useRouter()
const { state, recordPayment } = useStore()

const selectedTenantId = ref(state.tenants[0]?.id || '')
const selectedOperator = ref('mtn')
const phoneNumber = ref('+260 97 1122334')
const isProcessing = ref(false)
const isSuccess = ref(false)
const generatedReceipt = ref(null)

const tenant = computed(() => {
  return state.tenants.find(t => t.id === selectedTenantId.value) || state.tenants[0]
})

const bed = computed(() => {
  return state.bedSpaces.find(b => b.tenantId === tenant.value?.id || b.tenantName === tenant.value?.name) || state.bedSpaces[0]
})

const onTenantChange = () => {
  if (tenant.value) {
    phoneNumber.value = tenant.value.phone
  }
}

const initiateMobileMoneyPayment = async () => {
  isProcessing.value = true
  isSuccess.value = false

  try {
    const operatorLabels = {
      mtn: 'MTN Mobile Money',
      airtel: 'Airtel Money',
      zamtel: 'Zamtel Kwacha'
    }

    let gatewayRef = `LNC-${selectedOperator.value.toUpperCase()}-${Date.now().toString().slice(-6)}`

    // Attempt live backend call
    try {
      const response = await fetch('http://localhost:3001/api/payments/momo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant.value.id,
          phone_number: phoneNumber.value,
          amount: Number(bed.value?.rent_amount || 2500),
          operator: selectedOperator.value
        })
      })
      const data = await response.json()
      if (data.reference) gatewayRef = data.reference
    } catch {
      // Fallback
    }

    // Simulate STK push interaction
    await new Promise(r => setTimeout(r, 2000))

    const paymentRecord = await recordPayment({
      tenantName: tenant.value.name,
      bedLabel: bed.value.label,
      amount: Number(bed.value.rent_amount),
      paymentMethod: `momo_${selectedOperator.value}`,
      paymentMethodLabel: operatorLabels[selectedOperator.value],
      reference: gatewayRef
    })

    generatedReceipt.value = paymentRecord
    isSuccess.value = true
  } finally {
    isProcessing.value = false
  }
}

const printReceipt = () => {
  window.print()
}
</script>

<template>
  <div class="min-h-screen bg-surface py-6 sm:py-8 px-3 sm:px-4 flex flex-col items-center justify-center">
    <!-- PandaStays Brand Header -->
    <div class="mb-5 sm:mb-6 text-center">
      <div class="inline-flex items-center gap-2 mb-1">
        <div class="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
          PS
        </div>
        <span class="font-bold text-lg text-primary tracking-tight">PandaStays</span>
      </div>
      <p class="text-xs text-on-surface-variant font-medium">Official Student Housing Rent Checkout</p>
    </div>

    <!-- Main Payment Container (Checkout form when not yet paid) -->
    <div v-if="!isSuccess" class="w-full max-w-md receipt-paper rounded-2xl p-4 sm:p-6 shadow-md border border-border-card space-y-4 sm:space-y-5">
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-outline-variant pb-3">
          <div>
            <span class="text-[10px] uppercase font-bold text-on-surface-variant">TENANCY INVOICE</span>
            <h2 class="font-bold text-lg text-on-surface">{{ state.currentProperty.name }}</h2>
          </div>
          <span class="badge-pill bg-primary-container text-primary font-data-mono text-xs">
            TERM 1 2026
          </span>
        </div>

        <!-- Tenant Selector for demo purposes -->
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Select Your Name</label>
          <select 
            v-model="selectedTenantId"
            @change="onTenantChange"
            class="w-full px-3 py-2 text-xs rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
          >
            <option v-for="t in state.tenants" :key="t.id" :value="t.id">
              {{ t.name }} — {{ t.bed_label }}
            </option>
          </select>
        </div>

        <!-- Bed-Space Rental Invoice Breakdown -->
        <div class="bg-surface-container-low/60 rounded-sm p-3.5 border border-outline-variant/60 font-data-mono text-xs space-y-1.5">
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Rentable Unit:</span>
            <span class="font-semibold text-on-surface">{{ bed?.label || 'Standard Bed-Space' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Billing Cycle:</span>
            <span class="text-on-surface">Monthly Lease</span>
          </div>
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Landlord:</span>
            <span class="text-on-surface">{{ state.currentLandlord?.name || 'Mukuba Accommodations' }}</span>
          </div>
          <div class="border-t border-outline-variant pt-2 mt-2 flex justify-between text-sm font-bold text-primary">
            <span>TOTAL RENT:</span>
            <span>ZMW {{ Number(bed?.rent_amount || 2500).toLocaleString() }}</span>
          </div>
        </div>

        <!-- Mobile Money Operator Selection -->
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">
            Select Mobile Money Operator
          </label>
          <div class="grid grid-cols-3 gap-1.5 sm:gap-2">
            <label 
              class="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-sm border cursor-pointer transition-colors"
              :class="selectedOperator === 'mtn' ? 'border-primary bg-primary-container/40 text-primary font-bold' : 'border-outline-variant bg-surface-container-low text-on-surface-variant'"
            >
              <input type="radio" value="mtn" v-model="selectedOperator" class="sr-only" />
              <span class="text-[11px] sm:text-xs">MTN MoMo</span>
            </label>

            <label 
              class="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-sm border cursor-pointer transition-colors"
              :class="selectedOperator === 'airtel' ? 'border-primary bg-primary-container/40 text-primary font-bold' : 'border-outline-variant bg-surface-container-low text-on-surface-variant'"
            >
              <input type="radio" value="airtel" v-model="selectedOperator" class="sr-only" />
              <span class="text-[11px] sm:text-xs">Airtel Money</span>
            </label>

            <label 
              class="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-sm border cursor-pointer transition-colors"
              :class="selectedOperator === 'zamtel' ? 'border-primary bg-primary-container/40 text-primary font-bold' : 'border-outline-variant bg-surface-container-low text-on-surface-variant'"
            >
              <input type="radio" value="zamtel" v-model="selectedOperator" class="sr-only" />
              <span class="text-[11px] sm:text-xs">Zamtel</span>
            </label>
          </div>
        </div>

        <!-- Mobile Money Phone Number -->
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
            Mobile Money Phone Number
          </label>
          <input 
            v-model="phoneNumber"
            type="text" 
            placeholder="+260 97 1234567"
            class="w-full px-3 py-2 text-sm rounded-sm border border-outline bg-surface-container-low text-on-surface font-data-mono focus:border-primary focus:outline-none"
          />
          <p class="text-[10px] text-on-surface-variant mt-1">
            You will receive a USSD prompt on this phone to enter your PIN.
          </p>
        </div>

        <!-- Pay Button -->
        <button 
          @click="initiateMobileMoneyPayment"
          :disabled="isProcessing"
          class="w-full py-3 px-3 bg-primary text-on-primary font-semibold text-xs sm:text-sm rounded-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-center"
        >
          <span v-if="isProcessing" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-if="!isProcessing">Pay ZMW {{ Number(bed?.rent_amount || 2500).toLocaleString() }} via STK Push</span>
          <span v-else>Waiting for phone prompt confirmation...</span>
        </button>
      </div>
    </div>

    <!-- Success & Official Executive Voucher with Scannable QR -->
    <div v-else class="w-full max-w-145 animate-fade-in">
      <ReceiptVoucher
        :receipt="generatedReceipt"
        :property-name="state.currentProperty?.name || 'Mukuba House'"
        :show-actions="true"
        @close="router.push('/tenant/portal')"
      />
    </div>

    <!-- Back to Portal Footer -->
    <div class="mt-6 text-center">
      <router-link to="/tenant/portal" class="text-xs text-on-surface-variant hover:text-primary transition-colors">
        &larr; Return to Resident Portal
      </router-link>
    </div>
  </div>
</template>
