<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { paymentService } from '../services/paymentService'
import { openPrintReceipt } from '../lib/receiptPrinter'
import QRCode from 'qrcode'

const route = useRoute()

const token = computed(() => route.params.id || '')
const isLoading = ref(true)
const isVerified = ref(false)
const record = ref(null)
const qrDataUrl = ref('')
const isPrinting = ref(false)

const verificationCode = computed(() => {
  const t = token.value
  if (t && t.length >= 12) {
    return `${t.slice(0, 8).toUpperCase()}-${t.slice(-4).toUpperCase()}`
  }
  return t.toUpperCase()
})

const verifyCurrentReceipt = async () => {
  isLoading.value = true
  isVerified.value = false
  record.value = null
  qrDataUrl.value = ''

  if (!token.value) {
    isLoading.value = false
    return
  }

  try {
    const res = await paymentService.verifyReceipt(token.value)
    if (res && res.verified) {
      isVerified.value = true
      record.value = res

      try {
        qrDataUrl.value = await QRCode.toDataURL(window.location.href, {
          width: 200,
          margin: 1,
          color: {
            dark: '#0A6640',
            light: '#FFFFFF'
          }
        })
      } catch (qrErr) {
        console.error('QR generation error:', qrErr)
      }
    } else {
      isVerified.value = false
      record.value = null
    }
  } catch (err) {
    console.error('Verification request failed:', err)
    isVerified.value = false
    record.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(verifyCurrentReceipt)
watch(() => route.params.id, verifyCurrentReceipt)

const handlePrintReceipt = async () => {
  if (!record.value) return
  isPrinting.value = true
  try {
    await openPrintReceipt({
      receipt_number: record.value.receipt_number,
      amount: record.value.amount,
      paid_at: record.value.paid_at,
      tenant_name: record.value.payer,
      property_name: record.value.property,
      bed_label: record.value.bed,
      method_label: record.value.method,
      verification_token: token.value
    }, {
      propertyName: record.value.property
    })
  } finally {
    isPrinting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-dim/40 py-10 px-4 flex flex-col items-center justify-center">
    <!-- Brand Header -->
    <div class="mb-6 text-center">
      <router-link to="/" class="inline-flex items-center gap-2 mb-1.5 hover:opacity-90 transition-opacity">
        <div class="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
          PS
        </div>
        <span class="font-bold text-lg text-primary tracking-tight font-headline">PandaStays</span>
      </router-link>
      <p class="text-xs text-on-surface-variant font-medium">Public Housing Registry & Verification Gateway</p>
    </div>

    <!-- State 1: Loading Skeleton -->
    <div v-if="isLoading" class="w-full max-w-lg bg-surface rounded-xl sm:rounded-2xl border border-border-card shadow-xl p-8 text-center space-y-4 animate-pulse">
      <div class="w-12 h-12 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-primary">
        <span class="material-symbols-outlined animate-spin text-2xl">sync</span>
      </div>
      <h2 class="text-base font-bold text-on-surface">Verifying Receipt with Ledger...</h2>
      <p class="text-xs text-on-surface-variant">Checking cryptographically signed token against PandaStays payment records</p>
    </div>

    <!-- State 2: Unverified / 404 Failure -->
    <div v-else-if="!isVerified || !record" class="w-full max-w-lg bg-surface rounded-xl sm:rounded-2xl border border-red-200 shadow-xl overflow-hidden animate-fade-in">
      <div class="bg-red-700 text-white p-6 sm:p-7 text-center">
        <div class="w-12 h-12 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-3">
          <span class="material-symbols-outlined text-3xl">cancel</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight">We couldn't verify this receipt</h1>
        <p class="text-xs sm:text-sm text-red-100 mt-1">
          No confirmed payment record was found for the requested verification token.
        </p>
      </div>

      <div class="p-6 sm:p-7 space-y-4 text-xs sm:text-sm text-on-surface-variant">
        <div class="p-4 rounded-lg bg-red-50 border border-red-100 space-y-1">
          <div class="font-bold text-red-900">What does this mean?</div>
          <p class="text-red-800 leading-relaxed text-xs">
            The verification token is either invalid, the payment has not cleared, or the receipt link has been altered. Never accept an accommodation receipt that fails online verification.
          </p>
          <div v-if="token" class="font-data-mono text-[11px] text-red-700 pt-1">
            Token queried: {{ token }}
          </div>
        </div>

        <div class="pt-2 flex flex-col sm:flex-row gap-3">
          <router-link
            to="/"
            class="w-full py-2.5 px-5 bg-primary text-white text-center font-semibold text-xs sm:text-sm rounded-full hover:bg-primary-dark transition-colors shadow-xs"
          >
            Go to PandaStays Home
          </router-link>
        </div>
      </div>
    </div>

    <!-- State 3: Successfully Verified Card -->
    <div v-else class="w-full max-w-lg bg-surface rounded-xl sm:rounded-2xl border border-border-card shadow-xl overflow-hidden animate-fade-in">
      
      <!-- Top Rich Emerald Banner -->
      <div class="relative bg-linear-to-br from-[#0A6640] to-[#064E3B] text-white p-4.5 sm:p-7 overflow-hidden">
        <div class="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none"></div>
        <div class="absolute -bottom-10 right-16 w-28 h-28 rounded-full bg-white/5 pointer-events-none"></div>

        <div class="relative z-10 flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-200">
            PandaStays Official Registry
          </span>

          <!-- Status Pill -->
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 uppercase tracking-wide shrink-0">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>VERIFIED PAID</span>
          </span>
        </div>

        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white relative z-10">
          Official Payment Verification
        </h1>
        <p class="text-xs sm:text-sm text-emerald-100/90 mt-0.5 relative z-10">
          {{ record.property || 'Student Accommodation' }}
        </p>
      </div>

      <!-- Reference Code Strip -->
      <div class="bg-emerald-50 border-b border-emerald-100 px-4 sm:px-7 py-2.5 flex flex-wrap items-center justify-between gap-1.5 text-sm font-data-mono">
        <span class="text-emerald-900 font-bold tracking-wide">#{{ record.receipt_number }}</span>
        <span class="text-emerald-700 text-xs">Paid: {{ record.paid_at }}</span>
      </div>

      <!-- Body Content -->
      <div class="p-4 sm:p-7 space-y-4 sm:space-y-5">
        
        <!-- Highlight Unit / Stay Card -->
        <div class="bg-surface-container-low border border-border-card rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
          <div class="flex-1">
            <span class="text-xs uppercase font-bold text-on-surface-muted tracking-wider block">Allocated Space</span>
            <div class="font-bold text-sm sm:text-base text-on-surface mt-0.5">{{ record.bed || 'Bed Space' }}</div>
            <div class="text-xs sm:text-sm text-on-surface-variant">{{ record.property }}</div>
          </div>
          <div class="hidden sm:block w-px h-9 bg-border-card"></div>
          <div class="block sm:hidden w-full h-px bg-border-card/60"></div>
          <div class="sm:text-right">
            <span class="text-xs uppercase font-bold text-on-surface-muted tracking-wider block">Payer (Privacy Protected)</span>
            <div class="font-bold text-sm text-primary mt-0.5">{{ record.payer || 'Verified Tenant' }}</div>
            <div class="text-xs text-on-surface-muted">Initials Only</div>
          </div>
        </div>

        <!-- Structured Key-Value Data -->
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-on-surface-muted block mb-2">
            Verified Record Metadata
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
            <div class="p-3 rounded-lg bg-surface-container border border-border-card">
              <span class="text-xs uppercase font-bold text-on-surface-muted block">Payment Method</span>
              <span class="font-semibold text-on-surface mt-0.5 block truncate">{{ record.method }}</span>
            </div>
            <div class="p-3 rounded-lg bg-surface-container border border-border-card">
              <span class="text-xs uppercase font-bold text-on-surface-muted block">Ledger Status</span>
              <span class="font-semibold text-primary mt-0.5 block">Cleared & Reconciled</span>
            </div>
          </div>
        </div>

        <!-- High-Contrast Total Box -->
        <div class="bg-hero-dark text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
              Verified Rent Amount Paid
            </span>
            <div class="text-xs text-emerald-400 font-medium">Reconciled via Lenco Payment Rail</div>
          </div>
          <div class="text-2xl sm:text-3xl font-bold font-data-mono text-white">
            <span class="text-sm text-neutral-400 font-semibold mr-1">{{ record.currency || 'ZMW' }}</span>{{ Number(record.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </div>
        </div>

        <!-- Verification Proof & QR Card -->
        <div class="p-3.5 sm:p-4 rounded-xl bg-surface-container border border-border-card flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 sm:gap-4">
          <div class="shrink-0 w-22 h-22 sm:w-20 sm:h-20 bg-white p-1 rounded-lg border border-border-card flex items-center justify-center mx-auto sm:mx-0">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="Verification QR Code" class="w-full h-full object-contain" />
            <span v-else class="material-symbols-outlined animate-spin text-primary">sync</span>
          </div>
          <div class="flex-1 space-y-1 w-full">
            <div class="flex items-center justify-center sm:justify-start gap-1.5 text-sm font-bold text-on-surface">
              <span class="material-symbols-outlined text-[18px] text-primary">verified_user</span>
              <span>Server-Verified Receipt</span>
            </div>
            <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              This record is authenticated directly against the live PandaStays database.
            </p>
            <div class="font-data-mono text-xs text-on-surface-muted break-all sm:truncate">
              Token: {{ verificationCode }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <button 
            @click="handlePrintReceipt"
            :disabled="isPrinting"
            class="w-full sm:flex-1 py-2.5 px-4 bg-primary text-white font-semibold text-xs sm:text-sm rounded-full hover:bg-primary-dark transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span v-if="isPrinting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
            <span v-else class="material-symbols-outlined text-[16px]">download</span>
            <span>Download Official Receipt (PDF)</span>
          </button>

          <router-link 
            to="/" 
            class="w-full sm:w-auto py-2.5 px-5 bg-surface-container hover:bg-surface-container-high border border-border-card text-on-surface text-center font-semibold text-xs sm:text-sm rounded-full transition-colors"
          >
            PandaStays Home
          </router-link>
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-border-card text-center text-xs text-on-surface-muted leading-relaxed">
          <p>&copy; 2026 PandaStays Technologies Ltd. Official Student Housing Management System.</p>
        </div>

      </div>
    </div>
  </div>
</template>
