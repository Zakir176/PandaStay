<script setup>
import { ref } from 'vue'
import { useStore } from '../lib/store'

const { state } = useStore()

const savedNotification = ref(false)

const settingsForm = ref({
  landlordName: state.currentLandlord.name,
  email: state.currentLandlord.email,
  phone: state.currentLandlord.phone,
  lencoSubaccount: state.currentLandlord.lenco_subaccount_id,
  whatsappDaysBefore: state.currentLandlord.whatsapp_reminder_days_before || 3,
  enableOverdueEscalation: true,
  smsFallback: false
})

const saveSettings = () => {
  state.currentLandlord.name = settingsForm.value.landlordName
  state.currentLandlord.email = settingsForm.value.email
  state.currentLandlord.phone = settingsForm.value.phone
  state.currentLandlord.lenco_subaccount_id = settingsForm.value.lencoSubaccount
  state.currentLandlord.whatsapp_reminder_days_before = Number(settingsForm.value.whatsappDaysBefore)

  savedNotification.value = true
  setTimeout(() => {
    savedNotification.value = false
  }, 3000)
}
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <!-- Save Toast Notification -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div 
        v-if="savedNotification" 
        class="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-sm shadow-md text-xs font-medium"
      >
        <span class="material-symbols-outlined text-[18px]">check_circle</span>
        <span>Settings and WhatsApp reminder rules updated successfully!</span>
      </div>
    </transition>

    <!-- Header -->
    <div class="border-b border-outline-variant pb-4">
      <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-medium">
        <span>{{ state.currentProperty.name }}</span>
        <span>&bull;</span>
        <span class="text-primary font-semibold">Account & Gateway Configuration</span>
      </div>
      <h2 class="text-2xl font-bold text-on-surface tracking-tight">Settings & Automations</h2>
      <p class="text-xs text-on-surface-variant mt-0.5">
        Configure rules-based WhatsApp rent reminders, Lenco sub-account payout routing, and property defaults.
      </p>
    </div>

    <!-- WhatsApp Rent Reminders Engine Configuration -->
    <div class="card-tight p-5 bg-surface-container-lowest space-y-4">
      <div class="border-b border-outline-variant/60 pb-3">
        <h3 class="font-bold text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">chat</span>
          Rules-Based WhatsApp Rent Reminders (Section 4.5)
        </h3>
        <p class="text-xs text-on-surface-variant">
          Driven by scheduled jobs checking tenancy due dates against payment records.
        </p>
      </div>

      <div class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-on-surface-variant uppercase mb-1">
            Dispatch Reminder N Days Before Due Date
          </label>
          <div class="flex items-center gap-3">
            <input 
              v-model="settingsForm.whatsappDaysBefore"
              type="number" 
              min="1" 
              max="14"
              class="w-24 px-3 py-2 border border-outline rounded-sm bg-surface-container-low font-data-mono font-bold text-sm text-on-surface focus:border-primary focus:outline-none"
            />
            <span class="text-on-surface-variant">days prior to rent cycle due date (default: 3 days)</span>
          </div>
        </div>

        <div class="pt-2 border-t border-outline-variant/40 space-y-2">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input 
              v-model="settingsForm.enableOverdueEscalation"
              type="checkbox" 
              class="w-4 h-4 text-primary rounded-xs border-outline focus:ring-primary"
            />
            <span class="font-medium text-on-surface">Enable Escalating Reminders Once Overdue</span>
          </label>
          <p class="text-[11px] text-on-surface-variant pl-6">
            Automatically sends gentle reminder on Day 1 overdue, and formal notice on Day 5 overdue.
          </p>
        </div>

        <div class="pt-2 border-t border-outline-variant/40 space-y-2">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input 
              v-model="settingsForm.smsFallback"
              type="checkbox" 
              class="w-4 h-4 text-primary rounded-xs border-outline focus:ring-primary"
            />
            <span class="font-medium text-on-surface">SMS Fallback (Phase 2)</span>
          </label>
          <p class="text-[11px] text-on-surface-variant pl-6">
            Sends standard SMS if WhatsApp delivery fails or recipient is offline.
          </p>
        </div>
      </div>
    </div>

    <!-- Lenco Payment Gateway Sub-Account Routing -->
    <div class="card-tight p-5 bg-surface-container-lowest space-y-4">
      <div class="border-b border-outline-variant/60 pb-3">
        <h3 class="font-bold text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">account_balance</span>
          Lenco by BoardaPay Payout Routing (Section 2 & 4.4)
        </h3>
        <p class="text-xs text-on-surface-variant">
          Each landlord has their own payout routing rather than pooling into one shared account.
        </p>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-on-surface-variant uppercase mb-1">
            Lenco Landlord Sub-Account ID
          </label>
          <input 
            v-model="settingsForm.lencoSubaccount"
            type="text" 
            class="w-full px-3 py-2 border border-outline rounded-sm bg-surface-container-low font-data-mono text-sm text-on-surface focus:border-primary focus:outline-none"
          />
          <p class="text-[11px] text-on-surface-variant mt-1">
            Rent collected through Mobile Money will be automatically settled into this Lenco wallet.
          </p>
        </div>
      </div>
    </div>

    <!-- Landlord Profile Information -->
    <div class="card-tight p-5 bg-surface-container-lowest space-y-4">
      <div class="border-b border-outline-variant/60 pb-3">
        <h3 class="font-bold text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">badge</span>
          Landlord Account Details
        </h3>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-on-surface-variant uppercase mb-1">Landlord Name</label>
          <input 
            v-model="settingsForm.landlordName"
            type="text" 
            class="w-full px-3 py-2 border border-outline rounded-sm bg-surface-container-low text-sm text-on-surface focus:border-primary focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-on-surface-variant uppercase mb-1">Email</label>
            <input 
              v-model="settingsForm.email"
              type="email" 
              class="w-full px-3 py-2 border border-outline rounded-sm bg-surface-container-low text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label class="block font-semibold text-on-surface-variant uppercase mb-1">Phone Number</label>
            <input 
              v-model="settingsForm.phone"
              type="text" 
              class="w-full px-3 py-2 border border-outline rounded-sm bg-surface-container-low font-data-mono text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end gap-3 pt-2">
      <button 
        @click="saveSettings"
        class="px-5 py-2.5 bg-primary text-on-primary font-semibold text-xs rounded-sm hover:bg-primary/90 transition-colors shadow-xs"
      >
        Save Configuration
      </button>
    </div>
  </div>
</template>
