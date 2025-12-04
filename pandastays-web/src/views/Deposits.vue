<script setup>
import { ref } from 'vue'

const totalDepositsHeld = ref('ZMW 4,500')
const monthlyIncrease = ref('+ZMW 1,200 this month')

const deposits = ref([
  {
    name: 'Chileshe Mubanga',
    room: 'Room 4',
    deposit: 'ZMW 1,200',
    moveInDate: '15 Jan 2026',
    status: 'Good',
    statusClass: 'bg-primary/10 text-primary',
    dotClass: 'bg-primary'
  },
  {
    name: 'John Banda',
    room: 'Room 1',
    deposit: 'ZMW 1,200',
    moveInDate: '20 Jan 2026',
    status: 'Pending Inspection',
    statusClass: 'bg-tertiary-container/15 text-tertiary',
    dotClass: 'bg-tertiary-container'
  },
  {
    name: 'Sarah Musonda',
    room: 'Room 7',
    deposit: 'ZMW 1,100',
    moveInDate: '02 Feb 2026',
    status: 'Good',
    statusClass: 'bg-primary/10 text-primary',
    dotClass: 'bg-primary'
  }
])
</script>

<template>
  <div class="flex flex-col gap-stack-default">
    <!-- Page Header -->
    <div class="mb-4">
      <h1 class="font-display-lg text-display-lg text-on-background font-bold">Deposits &amp; Escrow</h1>
      <p class="font-body-md text-body-md text-on-surface-variant mt-2">Manage tenant security deposits, damages, and refunds.</p>
    </div>

    <!-- Bento Layout -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-gutter">
      <!-- Summary Card -->
      <div class="md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-center">
        <div class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2 flex justify-between items-center">
          Total Deposits Held
          <span class="material-symbols-outlined text-primary text-xl">account_balance</span>
        </div>
        <div class="font-display-lg text-display-lg text-on-background mt-1 font-bold">{{ totalDepositsHeld }}</div>
        <div class="flex items-center gap-1 mt-4 text-primary bg-primary/10 w-max px-2 py-1 rounded-md">
          <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">trending_up</span>
          <span class="font-body-sm text-body-sm font-medium">{{ monthlyIncrease }}</span>
        </div>
      </div>

      <!-- Deposits Table Container -->
      <div class="md:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden mt-2">
        <div class="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h2 class="font-title-sm text-title-sm text-on-background font-semibold">Active Deposits</h2>
          <button class="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg font-body-sm text-body-sm font-medium transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">filter_list</span> Filter
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-outline-variant bg-surface-container-low/50">
                <th class="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-medium">Tenant Name</th>
                <th class="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-medium">Room #</th>
                <th class="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-medium">Initial Deposit (ZMW)</th>
                <th class="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-medium">Move-in Date</th>
                <th class="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-medium">Condition Status</th>
                <th class="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant font-body-md text-body-md">
              <tr v-for="item in deposits" :key="item.name" class="hover:bg-surface-container-low transition-colors group">
                <td class="px-6 py-4">
                  <div class="font-medium text-on-background">{{ item.name }}</div>
                </td>
                <td class="px-6 py-4 text-on-surface-variant">{{ item.room }}</td>
                <td class="px-6 py-4 font-data-mono text-data-mono">{{ item.deposit }}</td>
                <td class="px-6 py-4 text-on-surface-variant text-body-sm">{{ item.moveInDate }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body-sm text-body-sm font-medium" :class="item.statusClass">
                    <span class="w-1.5 h-1.5 rounded-full" :class="item.dotClass"></span>
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button class="inline-flex items-center justify-center w-8 h-8 rounded-full border border-tertiary-container text-tertiary-container hover:bg-tertiary-container/10 transition-colors" title="Deduct Damage Fee">
                    <span class="material-symbols-outlined text-[18px]">edit_notifications</span>
                  </button>
                  <button class="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors" title="Refund Full Deposit via MoMo">
                    <span class="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
