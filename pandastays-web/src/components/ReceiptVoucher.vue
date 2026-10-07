<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import QRCode from 'qrcode'
import { openPrintReceipt, generateDigitalHash } from '../lib/receiptPrinter.js'

const props = defineProps({
  receipt: {
    type: Object,
    required: true
  },
  propertyName: {
    type: String,
    default: 'Mukuba House'
  },
  showActions: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: 'Official Rent Payment Receipt'
  }
})

const emit = defineEmits(['close'])

const qrDataUrl = ref('')
const isCopied = ref(false)
const isPrinting = ref(false)

const recordId = computed(() => {
  return props.receipt?.receipt_number || props.receipt?.reference || props.receipt?.id || 'REC-UNKNOWN'
})

const formattedAmount = computed(() => {
  return Number(props.receipt?.amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})

const digitalHash = computed(() => {
  return generateDigitalHash(props.receipt || {})
})

const verifyUrl = computed(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pandastays.zm'
  const recId = recordId.value
  const amt = props.receipt?.amount || '0'
  const tenant = props.receipt?.tenant_name || props.receipt?.tenant?.name || 'Resident'
  const prop = props.propertyName || 'Mukuba House'
  const unit = props.receipt?.bed_label || 'Bed Space'
  return `${origin}/verify/${encodeURIComponent(recId)}?amt=${amt}&tenant=${encodeURIComponent(tenant)}&property=${encodeURIComponent(prop)}&unit=${encodeURIComponent(unit)}&status=PAID`
})

// Generate crisp QR code
const generateQRCode = async () => {
  if (!props.receipt) return
  try {
    qrDataUrl.value = await QRCode.toDataURL(verifyUrl.value, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0A6640', // Deep emerald
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
  } catch (err) {
    console.error('Failed to generate receipt QR code:', err)
  }
}

watch(() => props.receipt, generateQRCode, { immediate: true })
onMounted(generateQRCode)

const copyReceiptNumber = () => {
  if (!recordId.value) return
  navigator.clipboard.writeText(recordId.value)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

const handleDownloadPdf = async () => {
  isPrinting.value = true
  try {
    await openPrintReceipt(props.receipt, {
      propertyName: props.propertyName,
      type: 'RECEIPT'
    })
  } finally {
    isPrinting.value = false
  }
}
</script>

<template>
  <div class="receipt-executive-wrapper w-full max-w-145 mx-auto text-left px-1 sm:px-0">
    
    <!-- Top Success State Header with Bouncing Success Badge -->
    <div class="text-center pb-3 pt-1">
      <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-1.5 animate-bounce shadow-xs">
        <span class="material-symbols-outlined text-2xl font-bold">verified</span>
      </div>
      <h3 class="font-bold text-sm sm:text-base text-on-surface">Payment Reconciled & Confirmed</h3>
      <p class="text-xs text-on-surface-variant mt-0.5">Official Accommodation Voucher Issued</p>
    </div>

    <!-- Executive Printable Voucher Card -->
    <div class="bg-surface rounded-xl sm:rounded-2xl border border-border-card shadow-xl overflow-hidden print:shadow-none print:border-black/30">
      
      <!-- Branded Header Banner (Deep Emerald Accent with Decorative Rings) -->
      <div class="relative bg-linear-to-br from-[#0A6640] to-[#064E3B] text-white p-4.5 sm:p-7 overflow-hidden">
        <!-- Decorative semi-transparent backdrop rings -->
        <div class="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none"></div>
        <div class="absolute -bottom-10 right-14 w-28 h-28 rounded-full bg-white/5 pointer-events-none"></div>

        <div class="relative z-10 flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-white/15 border border-white/25 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              PS
            </div>
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-200">
                PandaStays &bull; Student Housing PropTech
              </span>
            </div>
          </div>

          <!-- Pulsing Status Pill -->
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 uppercase tracking-wide shrink-0">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>VERIFIED PAID</span>
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white relative z-10">
          {{ title }}
        </h2>
        <p class="text-xs sm:text-sm text-emerald-100/90 mt-0.5 relative z-10">
          {{ propertyName }} &bull; Lusaka, Republic of Zambia
        </p>
      </div>

      <!-- Reference Code Strip -->
      <div class="bg-emerald-50 border-b border-emerald-100 px-4 sm:px-7 py-2.5 flex flex-wrap items-center justify-between gap-1.5 text-sm font-data-mono">
        <div class="flex items-center gap-2">
          <span class="text-emerald-900 font-bold tracking-wide">#{{ recordId }}</span>
          <button 
            @click="copyReceiptNumber"
            class="text-emerald-700 hover:text-emerald-900 transition-colors p-0.5 rounded cursor-pointer"
            title="Copy Reference Code"
          >
            <span class="material-symbols-outlined text-[16px]">
              {{ isCopied ? 'done' : 'content_copy' }}
            </span>
          </button>
        </div>
        <span class="text-emerald-700 text-xs">
          Issued: {{ receipt?.paid_at || new Date().toISOString().replace('T', ' ').slice(0, 16) }}
        </span>
      </div>

      <!-- Content Body -->
      <div class="p-4 sm:p-7 space-y-4">
        
        <!-- Highlight Item/Date Card -->
        <div class="bg-surface-container-low border border-border-card rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
          <div class="flex-1">
            <span class="text-xs uppercase font-bold text-on-surface-muted tracking-wider block">Allocated Space</span>
            <div class="font-bold text-sm sm:text-base text-on-surface mt-0.5">{{ receipt?.bed_label || 'Standard Bed-Space' }}</div>
            <div class="text-xs sm:text-sm text-on-surface-variant">{{ propertyName }}</div>
          </div>
          <div class="hidden sm:block w-px h-9 bg-border-card"></div>
          <div class="block sm:hidden w-full h-px bg-border-card/60"></div>
          <div class="sm:text-right">
            <span class="text-xs uppercase font-bold text-on-surface-muted tracking-wider block">Residency Term</span>
            <div class="font-bold text-sm text-primary mt-0.5">Term 1 2026</div>
            <div class="text-xs text-on-surface-muted">Monthly Lease</div>
          </div>
        </div>

        <!-- Structured Data Sections -->
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-on-surface-muted block mb-2">
            Tenancy & Payment Record
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
            <div class="p-3 rounded-lg bg-surface-container border border-border-card">
              <span class="text-xs uppercase font-bold text-on-surface-muted block">Resident Tenant</span>
              <span class="font-bold text-on-surface mt-0.5 block truncate">
                {{ receipt?.tenant_name || receipt?.tenant?.name || 'Resident' }}
              </span>
            </div>
            <div class="p-3 rounded-lg bg-surface-container border border-border-card">
              <span class="text-xs uppercase font-bold text-on-surface-muted block">Payment Channel</span>
              <span class="font-semibold text-on-surface mt-0.5 block truncate">
                {{ receipt?.method_label || 'MTN Mobile Money' }}
              </span>
            </div>
            <div class="p-3 rounded-lg bg-surface-container border border-border-card">
              <span class="text-xs uppercase font-bold text-on-surface-muted block">Gateway Reference</span>
              <span class="font-data-mono text-xs text-on-surface mt-0.5 block truncate">
                {{ receipt?.gateway_reference || 'MANUAL-REC' }}
              </span>
            </div>
            <div class="p-3 rounded-lg bg-surface-container border border-border-card">
              <span class="text-xs uppercase font-bold text-on-surface-muted block">Verification Status</span>
              <span class="font-semibold text-primary mt-0.5 block">Cleared & Reconciled</span>
            </div>
          </div>
        </div>

        <!-- High-Contrast Total Box -->
        <div class="bg-hero-dark text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
              Total Kwacha Amount Paid
            </span>
            <div class="text-xs text-emerald-400 font-medium">Reconciled via Lenco STK Push</div>
          </div>
          <div class="text-2xl sm:text-3xl font-bold font-data-mono text-white">
            <span class="text-sm text-neutral-400 font-semibold mr-1">ZMW</span>{{ formattedAmount }}
          </div>
        </div>

        <!-- Dedicated "Scan to Verify" Card -->
        <div class="p-3.5 sm:p-4 rounded-xl bg-surface-container border border-border-card flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 sm:gap-4">
          <div class="shrink-0 w-24 h-24 sm:w-22 sm:h-22 bg-white p-1 rounded-lg border border-border-card flex items-center justify-center mx-auto sm:mx-0">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="Scannable Verification QR Code" class="w-full h-full object-contain" />
            <span v-else class="material-symbols-outlined animate-spin text-primary">sync</span>
          </div>
          <div class="flex-1 space-y-1 w-full">
            <div class="flex items-center justify-center sm:justify-start gap-1.5 text-sm font-bold text-[#0A6640]">
              <span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>Scan to Verify</span>
            </div>
            <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Scan with any mobile camera to verify this accommodation payment directly against the PandaStays registry.
            </p>
            <a :href="verifyUrl" target="_blank" class="font-data-mono text-xs text-[#0A6640] hover:underline font-semibold block break-all sm:truncate max-w-full">
              {{ verifyUrl }}
            </a>
            <div class="font-data-mono text-xs text-on-surface-muted break-all sm:truncate" :title="digitalHash">
              {{ digitalHash }}
            </div>
          </div>
        </div>

        <!-- Official Footer -->
        <div class="pt-1 text-center text-xs text-on-surface-muted leading-relaxed">
          <p>Official cryptographic voucher issued by <a href="https://pandastays.zm" target="_blank" class="text-primary font-medium hover:underline">PandaStays Housing Management</a>.</p>
          <p>&copy; 2026 PandaStays Technologies Ltd. Republic of Zambia.</p>
        </div>

      </div>

      <!-- Action Buttons -->
      <div v-if="showActions" class="p-3.5 sm:p-4 bg-surface-container border-t border-border-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 print:hidden">
        <button
          @click="handleDownloadPdf"
          :disabled="isPrinting"
          class="btn-pill-primary text-xs sm:text-sm py-2.5 px-4 flex-1 justify-center cursor-pointer shadow-xs w-full sm:w-auto"
        >
          <span v-if="isPrinting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
          <span v-else class="material-symbols-outlined text-[16px]">download</span>
          <span>Download Receipt (PDF)</span>
        </button>

        <button
          @click="$emit('close')"
          class="btn-pill-outline text-xs sm:text-sm py-2.5 px-5 justify-center cursor-pointer w-full sm:w-auto"
        >
          <span>Done</span>
        </button>
      </div>

    </div>
  </div>
</template>
