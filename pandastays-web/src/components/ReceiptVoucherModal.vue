<script setup>
import ReceiptVoucher from './ReceiptVoucher.vue'

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
</script>

<template>
  <div 
    v-if="isOpen && receipt" 
    class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-hero-dark/60 backdrop-blur-xs animate-in fade-in duration-200"
    @click.self="handleClose"
  >
    <div class="relative w-full max-w-155 max-h-[92vh] overflow-y-auto custom-scrollbar">
      <!-- Close button on top right of modal -->
      <button 
        @click="handleClose" 
        class="absolute top-2 right-2 sm:-top-2.5 sm:-right-2.5 z-20 w-8 h-8 rounded-full bg-surface border border-border-card text-on-surface-variant hover:text-on-surface flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 print:hidden"
        title="Close Receipt"
      >
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>

      <ReceiptVoucher 
        :receipt="receipt" 
        :property-name="propertyName" 
        :show-actions="true"
        @close="handleClose" 
      />
    </div>
  </div>
</template>
