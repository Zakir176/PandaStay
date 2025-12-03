<script setup>
import { ref } from 'vue'

const currentTerm = ref('Semester 1 (2026)')

const students = ref([
  {
    name: 'Chileshe Mubanga',
    initials: 'CM',
    room: 'Room 4 - Bed A',
    balance: 'ZMW 0',
    leaseEnds: 'Nov 30, 2026',
    program: 'Engineering (Yr 2)',
    hasOutstanding: false
  },
  {
    name: 'John Banda',
    initials: 'JB',
    room: 'Room 1 - Bed B',
    balance: 'Outstanding',
    arrears: 'ZMW 1,200',
    leaseEnds: 'Nov 30, 2026',
    hasOutstanding: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWz4bdsMIe-7sJOY2DL1tatE-fqBwwLmbl2_dZwXYWlmI19JHose9ASc1V2Ix677XpVhzVsyhnA1B_Cd7kxKkz4_OVv9eFGGlKyjfLmX6A_sAjbzkQNeIJp93hfC6sU2jhMlPF_2isTniBiiqaetdAaYyCJ5XCx8dMyi5nwV5dK8YO8KG-aHz3xL4syFzb1AjzEm8ii-6JMp5MBjMfN0EnjRrskz3A8slHVnvGcv05rzU0rbw8kKM'
  },
  {
    name: 'Sarah Musonda',
    initials: 'SM',
    room: 'Room 7 - Bed A',
    balance: 'ZMW 0',
    leaseEnds: 'Nov 30, 2026',
    program: 'Medicine (Yr 4)',
    hasOutstanding: false
  }
])
</script>

<template>
  <div class="space-y-8">
    <!-- Page Header & Banner -->
    <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
      <div>
        <h2 class="font-display-lg text-display-lg text-on-surface mb-2 font-bold">Semester Transition</h2>
        <p class="font-body-md text-body-md text-secondary">Manage lease renewals and bed vacancies.</p>
      </div>
      <!-- Term Selector Dropdown -->
      <div class="relative min-w-50">
        <label class="block font-label-caps text-label-caps text-secondary mb-1">Current Term</label>
        <button class="w-full flex items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
          <span class="font-title-sm text-title-sm">{{ currentTerm }}</span>
          <span class="material-symbols-outlined text-secondary">arrow_drop_down</span>
        </button>
      </div>
    </div>

    <!-- High-visibility Banner -->
    <div class="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
      <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">bed</span>
      </div>
      <div>
        <h3 class="font-title-sm text-title-sm text-on-primary-container font-bold">5 Beds Opening Next Semester</h3>
        <p class="font-body-sm text-body-sm text-primary">Ensure all transitions are processed by Nov 15th.</p>
      </div>
      <button class="ml-auto bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-label-caps hover:bg-surface-tint transition-colors whitespace-nowrap">
        Review Waitlist
      </button>
    </div>

    <!-- Lease List Bento Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div 
        v-for="student in students" 
        :key="student.name" 
        class="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col hover:border-outline transition-colors relative overflow-hidden"
      >
        <div v-if="student.hasOutstanding" class="absolute top-0 left-0 w-full h-1 bg-error"></div>
        <div class="flex justify-between items-start mb-4" :class="{ 'mt-1': student.hasOutstanding }">
          <div class="flex items-center gap-3">
            <img v-if="student.avatar" :src="student.avatar" alt="Student Profile" class="w-10 h-10 rounded-full object-cover border border-outline-variant" />
            <div v-else class="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-title-sm text-title-sm text-secondary font-bold">
              {{ student.initials }}
            </div>
            <div>
              <h4 class="font-title-sm text-title-sm text-on-surface font-semibold">{{ student.name }}</h4>
              <p class="font-data-mono text-data-mono text-secondary">{{ student.room }}</p>
            </div>
          </div>
          <span 
            class="px-2 py-1 rounded font-label-caps text-label-caps border"
            :class="student.hasOutstanding ? 'bg-error/10 text-error border-error/20' : 'bg-primary-container/10 text-primary border-primary-container/20'"
          >
            {{ student.balance }}
          </span>
        </div>

        <div class="mb-6 space-y-2">
          <div class="flex justify-between font-body-sm text-body-sm">
            <span class="text-secondary">Lease Ends</span>
            <span class="text-on-surface font-medium">{{ student.leaseEnds }}</span>
          </div>
          <div v-if="student.hasOutstanding" class="flex justify-between font-body-sm text-body-sm">
            <span class="text-secondary">Arrears</span>
            <span class="text-error font-data-mono text-data-mono font-bold">{{ student.arrears }}</span>
          </div>
          <div v-else class="flex justify-between font-body-sm text-body-sm">
            <span class="text-secondary">Program</span>
            <span class="text-on-surface">{{ student.program }}</span>
          </div>
        </div>

        <div class="mt-auto grid grid-cols-2 gap-3">
          <button class="py-2.5 px-3 rounded-lg border border-error text-error hover:bg-error/10 font-label-caps text-label-caps transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[16px]">exit_to_app</span> Vacate
          </button>
          <button 
            v-if="!student.hasOutstanding" 
            class="py-2.5 px-3 rounded-lg bg-primary text-on-primary hover:bg-surface-tint font-label-caps text-label-caps transition-colors flex items-center justify-center gap-1 shadow-sm active:shadow-inner"
          >
            <span class="material-symbols-outlined text-[16px]">refresh</span> Renew
          </button>
          <button 
            v-else 
            class="py-2.5 px-3 rounded-lg bg-surface-variant text-secondary opacity-50 cursor-not-allowed font-label-caps text-label-caps transition-colors flex items-center justify-center gap-1" 
            title="Clear balance before renewal"
          >
            <span class="material-symbols-outlined text-[16px]">block</span> Renew
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
