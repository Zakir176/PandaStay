<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  receipt: {
    type: Object,
    default: null
  },
  propertyName: {
    type: String,
    default: 'Mukuba House'
  }
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}

const printReceipt = () => {
  window.print()
}
</script>

<template>
  <div 
    v-if="isOpen && receipt" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/50 backdrop-blur-xs"
  >
    <div class="receipt-paper w-full max-w-md p-6 rounded-sm shadow-2xl space-y-4 border border-outline relative">
      <div class="flex items-center justify-between border-b border-outline pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold">
            PS
          </div>
          <div>
            <h3 class="font-bold text-sm text-on-surface">PandaStays Rent Receipt</h3>
            <p class="text-[10px] text-on-surface-variant font-data-mono">Official Accommodation Voucher</p>
          </div>
        </div>
        <button @click="handleClose" class="text-on-surface-variant hover:text-on-surface">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="space-y-2 font-data-mono text-xs">
        <div class="flex justify-between py-1 border-b border-dashed border-outline-variant">
          <span class="text-on-surface-variant">Receipt Number:</span>
          <span class="font-bold text-primary">{{ receipt.receipt_number }}</span>
        </div>

        <div class="flex justify-between py-1 border-b border-dashed border-outline-variant">
          <span class="text-on-surface-variant">Property:</span>
          <span class="font-medium text-on-surface">{{ propertyName }}</span>
        </div>

        <div class="flex justify-between py-1 border-b border-dashed border-outline-variant">
          <span class="text-on-surface-variant">Tenant / Payee:</span>
          <span class="font-bold text-on-surface">{{ receipt.tenant_name }}</span>
        </div>

        <div class="flex justify-between py-1 border-b border-dashed border-outline-variant">
          <span class="text-on-surface-variant">Rentable Bed-Space:</span>
          <span class="font-medium text-on-surface">{{ receipt.bed_label }}</span>
        </div>

        <div class="flex justify-between py-1 border-b border-dashed border-outline-variant">
          <span class="text-on-surface-variant">Date & Timestamp:</span>
          <span>{{ receipt.paid_at }}</span>
        </div>

        <div class="flex justify-between py-1 border-b border-dashed border-outline-variant">
          <span class="text-on-surface-variant">Payment Method:</span>
          <span>{{ receipt.method_label || 'Mobile Money' }}</span>
        </div>

        <div class="flex justify-between py-1 border-b border-dashed border-outline-variant">
          <span class="text-on-surface-variant">Lenco Gateway Ref:</span>
          <span class="text-[11px]">{{ receipt.gateway_reference }}</span>
        </div>

        <div class="flex justify-between py-3 text-base font-bold text-primary border-t-2 border-primary mt-2">
          <span>AMOUNT PAID:</span>
          <span>ZMW {{ Number(receipt.amount).toLocaleString() }}</span>
        </div>
      </div>

      <div class="pt-3 border-t border-outline flex items-center justify-between text-xs">
        <div class="text-[10px] text-on-surface-variant">
          Status: <span class="text-primary font-bold">VERIFIED PAID</span>
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="printReceipt"
            class="px-3 py-1.5 bg-surface-container border border-outline rounded-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Print / Save PDF
          </button>
          <button 
            @click="handleClose"
            class="px-3 py-1.5 bg-primary text-on-primary rounded-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
