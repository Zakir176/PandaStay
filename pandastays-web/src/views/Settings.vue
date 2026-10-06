<script setup>
import { ref } from 'vue'
import { useStore } from '../lib/store'
import { currentAccent, customColor, applyTheme, ACCENT_THEMES } from '../lib/theme'

const { state } = useStore()

const toastMessage = ref('')
const weekStart = ref('Monday')
const customHexInput = ref(customColor.value || '#2563EB')
const selectedCategory = ref('All')

const categories = ['All', 'Nature', 'Corporate', 'Modern', 'Warm', 'Luxury']

const filteredThemes = () => {
  if (selectedCategory.value === 'All') return ACCENT_THEMES
  return ACCENT_THEMES.filter(t => t.category === selectedCategory.value)
}

const handleSelectAccent = (themeName) => {
  applyTheme(themeName)
  toastMessage.value = `Accent theme updated to ${themeName}!`
  setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}

const handleApplyCustomColor = () => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(customHexInput.value)) {
    toastMessage.value = 'Please enter a valid 6-digit hex code (e.g. #2563EB)'
    setTimeout(() => {
      toastMessage.value = ''
    }, 3000)
    return
  }
  applyTheme('Custom', customHexInput.value)
  toastMessage.value = `Custom color ${customHexInput.value.toUpperCase()} applied!`
  setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}

const settingsForm = ref({
  landlordName: state.currentLandlord.name,
  email: state.currentLandlord.email,
  phone: state.currentLandlord.phone,
  lencoSubaccount: state.currentLandlord.lenco_subaccount_id || 'sub_lenco_mukuba_981',
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

  toastMessage.value = 'Settings and WhatsApp reminder rules updated successfully!'
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <!-- Save Toast Notification -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div 
        v-if="toastMessage" 
        class="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-full shadow-lg text-xs font-semibold border border-white/20"
      >
        <span class="material-symbols-outlined text-[18px]">check_circle</span>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- Header -->
    <div class="pb-2">
      <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-medium">
        <span>{{ state.currentProperty.name }}</span>
        <span>&bull;</span>
        <span class="text-primary font-semibold">Account & Gateway Configuration</span>
      </div>
      <h2 class="text-2xl font-bold text-on-surface tracking-tight">Settings & Automations</h2>
      <p class="text-xs text-on-surface-variant mt-0.5">
        Configure rules-based WhatsApp rent reminders, Lenco sub-account payout routing, and workspace appearance.
      </p>
    </div>

    <!-- Appearance & Accent Theme Studio -->
    <div class="card-bento p-5 bg-surface space-y-5">
      <div class="border-b border-border-card pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 class="font-bold text-sm text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">palette</span>
            Workspace Appearance & Color Themes
          </h3>
          <p class="text-xs text-on-surface-variant">
            Select from 10 curated architectural themes or define your own custom brand color.
          </p>
        </div>

        <div class="flex items-center gap-1.5 self-start sm:self-auto">
          <span 
            v-if="currentAccent === 'Custom'"
            class="badge-pill bg-primary text-white text-[10px]"
          >
            Custom Theme Active
          </span>
          <span 
            v-else
            class="badge-pill bg-primary-container text-primary text-[10px]"
          >
            {{ currentAccent }} Active
          </span>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button 
          v-for="cat in categories" 
          :key="cat"
          @click="selectedCategory = cat"
          class="badge-pill py-1 px-3 text-xs transition-colors cursor-pointer"
          :class="selectedCategory === cat 
            ? 'bg-primary text-white font-bold shadow-2xs' 
            : 'bg-surface-dim hover:bg-surface-dim/80 text-on-surface-variant'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Presets Swatches Grid (10 Themes) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
        <div 
          v-for="accent in filteredThemes()" 
          :key="accent.name"
          @click="handleSelectAccent(accent.name)"
          class="p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-sm"
          :class="currentAccent === accent.name 
            ? 'border-primary ring-2 ring-primary/20 bg-primary/8 font-bold' 
            : 'border-border-card bg-surface-dim hover:bg-surface hover:border-border-card/80'"
        >
          <div class="flex items-center justify-between mb-2">
            <!-- Dual Swatch: Primary dot & Mini Dark Pill -->
            <div class="flex items-center gap-1.5">
              <span 
                class="w-4 h-4 rounded-full shadow-xs inline-block" 
                :style="{ backgroundColor: accent.color }"
              ></span>
              <span 
                class="w-2.5 h-4 rounded-full inline-block opacity-80" 
                :style="{ backgroundColor: accent.vars['--color-hero-dark'] }"
                title="Hero Card Tint"
              ></span>
            </div>

            <span 
              v-if="currentAccent === accent.name" 
              class="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[11px]"
            >
              ✓
            </span>
          </div>

          <div>
            <p class="font-bold text-on-surface text-xs leading-tight group-hover:text-primary transition-colors">
              {{ accent.name }}
            </p>
            <p class="text-[10px] text-on-surface-variant truncate mt-0.5">
              {{ accent.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Custom Color Generator Section -->
      <div class="p-4 rounded-2xl bg-surface-dim/60 border border-border-card space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold text-xs text-on-surface flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-primary">colorize</span>
              Custom Brand Accent
            </h4>
            <p class="text-[11px] text-on-surface-variant">
              Pick any color: the system automatically generates matching dark hero tints, hover states, and background canvas.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Color Picker Swatch Input -->
          <div class="flex items-center gap-2 p-1.5 bg-surface rounded-full border border-border-card shadow-2xs">
            <input 
              v-model="customHexInput"
              type="color" 
              class="w-7 h-7 rounded-full border-0 cursor-pointer overflow-hidden p-0 bg-transparent"
              title="Pick color"
            />
            <input 
              v-model="customHexInput"
              type="text" 
              placeholder="#2563EB"
              maxlength="7"
              class="w-20 px-2 py-0.5 text-xs font-data-mono font-bold uppercase bg-transparent text-on-surface focus:outline-none"
            />
          </div>

          <!-- Live Mini Preview Chips -->
          <div class="flex items-center gap-1.5 text-[10px] font-semibold text-on-surface-variant">
            <span>Preview:</span>
            <span 
              class="px-2.5 py-1 rounded-full text-white font-bold" 
              :style="{ backgroundColor: customHexInput }"
            >
              Button
            </span>
          </div>

          <!-- Apply Button -->
          <button 
            @click="handleApplyCustomColor"
            class="btn-pill-primary text-xs py-1.5 px-3.5"
          >
            Apply Custom Color
          </button>
        </div>
      </div>

      <!-- Calendar Setting -->
      <div class="pt-3 border-t border-border-card/60 flex items-center justify-between text-xs">
        <div>
          <label class="block font-bold text-on-surface text-xs">Week Starts On</label>
          <p class="text-[11px] text-on-surface-variant">Controls bed occupancy calendar columns</p>
        </div>
        <div class="flex items-center gap-2">
          <button 
            v-for="d in ['Monday', 'Sunday']" 
            :key="d"
            @click="weekStart = d"
            class="badge-pill py-1 px-3 text-xs transition-colors cursor-pointer"
            :class="weekStart === d ? 'bg-primary text-white font-bold' : 'bg-surface-dim text-on-surface-variant'"
          >
            {{ d }}
          </button>
        </div>
      </div>
    </div>

    <!-- WhatsApp Rent Reminders Engine Configuration -->
    <div class="card-bento p-5 bg-surface space-y-4">
      <div class="border-b border-border-card pb-3">
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
          <label class="block font-bold text-on-surface-muted uppercase text-[10px] tracking-wider mb-1.5">
            Dispatch Reminder N Days Before Due Date
          </label>
          <div class="flex items-center gap-3">
            <input 
              v-model="settingsForm.whatsappDaysBefore"
              type="number" 
              min="1" 
              max="14"
              class="w-20 px-3 py-1.5 border border-border-card rounded-xl bg-surface-dim font-data-mono font-bold text-sm text-on-surface focus:border-primary focus:outline-none"
            />
            <span class="text-on-surface-variant">days prior to rent cycle due date (default: 3 days)</span>
          </div>
        </div>

        <div class="pt-2 border-t border-border-card/60 space-y-2">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input 
              v-model="settingsForm.enableOverdueEscalation"
              type="checkbox" 
              class="w-4 h-4 text-primary rounded border-border-card focus:ring-primary accent-primary"
            />
            <span class="font-semibold text-on-surface">Enable Escalating Reminders Once Overdue</span>
          </label>
          <p class="text-[11px] text-on-surface-variant pl-6">
            Automatically sends gentle reminder on Day 1 overdue, and formal notice on Day 5 overdue.
          </p>
        </div>

        <div class="pt-2 border-t border-border-card/60 space-y-2">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input 
              v-model="settingsForm.smsFallback"
              type="checkbox" 
              class="w-4 h-4 text-primary rounded border-border-card focus:ring-primary accent-primary"
            />
            <span class="font-semibold text-on-surface">SMS Fallback Channel</span>
          </label>
          <p class="text-[11px] text-on-surface-variant pl-6">
            Sends standard SMS if WhatsApp delivery fails or recipient is offline.
          </p>
        </div>
      </div>
    </div>

    <!-- Lenco Payment Gateway Sub-Account Routing -->
    <div class="card-bento p-5 bg-surface space-y-4">
      <div class="border-b border-border-card pb-3">
        <h3 class="font-bold text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">account_balance</span>
          Lenco Payout Sub-Account Routing
        </h3>
        <p class="text-xs text-on-surface-variant">
          Each landlord has their own payout routing rather than pooling into one shared account.
        </p>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-on-surface-muted uppercase text-[10px] tracking-wider mb-1.5">
            Lenco Landlord Sub-Account ID
          </label>
          <input 
            v-model="settingsForm.lencoSubaccount"
            type="text" 
            class="w-full px-3.5 py-2 border border-border-card rounded-xl bg-surface-dim font-data-mono text-sm text-on-surface focus:border-primary focus:outline-none"
          />
          <p class="text-[11px] text-on-surface-variant mt-1.5">
            Rent collected through Mobile Money will be automatically settled into this Lenco wallet.
          </p>
        </div>
      </div>
    </div>

    <!-- Landlord Profile Information -->
    <div class="card-bento p-5 bg-surface space-y-4">
      <div class="border-b border-border-card pb-3">
        <h3 class="font-bold text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">badge</span>
          Landlord Account Details
        </h3>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-on-surface-muted uppercase text-[10px] tracking-wider mb-1.5">Landlord Name</label>
          <input 
            v-model="settingsForm.landlordName"
            type="text" 
            class="w-full px-3.5 py-2 border border-border-card rounded-xl bg-surface-dim text-sm text-on-surface focus:border-primary focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-on-surface-muted uppercase text-[10px] tracking-wider mb-1.5">Email</label>
            <input 
              v-model="settingsForm.email"
              type="email" 
              class="w-full px-3.5 py-2 border border-border-card rounded-xl bg-surface-dim text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label class="block font-bold text-on-surface-muted uppercase text-[10px] tracking-wider mb-1.5">Phone Number</label>
            <input 
              v-model="settingsForm.phone"
              type="text" 
              class="w-full px-3.5 py-2 border border-border-card rounded-xl bg-surface-dim font-data-mono text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end gap-3 pt-2">
      <button 
        @click="saveSettings"
        class="btn-pill-primary px-6 py-2.5 text-xs"
      >
        Save Configuration
      </button>
    </div>
  </div>
</template>
