<script setup>
import { ref } from 'vue'

const dateFilter = ref('This Month')
const methodFilter = ref('All')

const summaryStats = ref({
  totalRevenue: 'ZMW 145,200',
  growth: '+12%',
  pendingArrears: 'ZMW 12,500',
  arrearsGrowth: '-5%',
  transactionsCount: 342
})

const transactions = ref([
  {
    id: 'TXN-10293',
    date: 'Oct 24, 2023',
    time: '09:15 AM',
    tenant: 'Chilufya Mwila',
    room: 'Room 4 - Bed A',
    amount: '2,500.00',
    method: 'MTN MoMo',
    methodClass: 'bg-[#FFCC00]/10 text-[#B38F00] border-[#FFCC00]/30',
    dotClass: 'bg-[#FFCC00]',
    loggedBy: 'Admin (Self)'
  },
  {
    id: 'TXN-10292',
    date: 'Oct 23, 2023',
    time: '14:30 PM',
    tenant: 'Mumba Banda',
    room: 'Room 12 - Bed C',
    amount: '1,250.00',
    method: 'Cash',
    methodClass: 'bg-primary/10 text-primary border-primary/30',
    dotClass: 'bg-primary',
    loggedBy: 'Caretaker John'
  },
  {
    id: 'TXN-10291',
    date: 'Oct 22, 2023',
    time: '11:05 AM',
    tenant: 'Emmanuel Phiri',
    room: 'Room 2 - Bed B',
    amount: '2,500.00',
    method: 'Airtel Money',
    methodClass: 'bg-[#FF0000]/10 text-[#CC0000] border-[#FF0000]/30',
    dotClass: 'bg-[#FF0000]',
    loggedBy: 'Admin (Self)'
  }
])
</script>

<template>
  <div class="flex flex-col gap-stack-default">
    <!-- Page Header & Export Action -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="font-display-lg text-display-lg text-on-surface font-bold">Ledger &amp; Reports</h1>
        <p class="font-body-md text-body-md text-secondary mt-1">Review all financial transactions and payment histories.</p>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-4 py-2 bg-surface-container-highest text-on-surface hover:bg-surface-variant rounded border border-outline-variant transition-colors font-title-sm text-body-sm font-medium shadow-sm">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Export PDF
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary hover:bg-surface-tint rounded transition-colors font-title-sm text-body-sm font-medium shadow-sm">
          <span class="material-symbols-outlined text-[18px]">table_chart</span>
          Export Excel
        </button>
      </div>
    </div>

    <!-- Summary Cards (Bento style) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
      <!-- Card 1 -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <span class="material-symbols-outlined text-4xl text-primary">account_balance</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Total Revenue (This Month)</span>
          <span class="flex items-center text-primary-container bg-primary-container/10 px-2 py-0.5 rounded text-xs font-bold">
            <span class="material-symbols-outlined text-[14px] mr-1">trending_up</span> {{ summaryStats.growth }}
          </span>
        </div>
        <div class="font-data-mono text-display-lg text-on-surface">
          {{ summaryStats.totalRevenue }}
        </div>
      </div>

      <!-- Card 2 -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <span class="material-symbols-outlined text-4xl text-error">warning</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Pending Arrears</span>
          <span class="flex items-center text-error bg-error/10 px-2 py-0.5 rounded text-xs font-bold">
            <span class="material-symbols-outlined text-[14px] mr-1">trending_down</span> {{ summaryStats.arrearsGrowth }}
          </span>
        </div>
        <div class="font-data-mono text-display-lg text-on-surface">
          {{ summaryStats.pendingArrears }}
        </div>
      </div>

      <!-- Card 3 -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <span class="material-symbols-outlined text-4xl text-tertiary-container">receipt_long</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Transactions Logged</span>
          <span class="text-secondary text-xs">This Month</span>
        </div>
        <div class="font-data-mono text-display-lg text-on-surface">
          {{ summaryStats.transactionsCount }}
        </div>
      </div>
    </div>

    <!-- Main Data Section (Filters + Table) -->
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm">
      <!-- Filters Bar -->
      <div class="p-4 border-b border-outline-variant flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center bg-surface/50 rounded-t-xl">
        <!-- Date Filters -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-label-caps text-label-caps text-secondary mr-2">Date Range:</span>
          <button 
            @click="dateFilter = 'This Month'" 
            class="px-3 py-1.5 rounded-full font-body-sm text-body-sm font-medium border transition-colors"
            :class="dateFilter === 'This Month' ? 'bg-primary-container text-on-primary-container border-primary-container' : 'bg-surface text-secondary hover:bg-surface-container border-outline-variant'"
          >
            This Month
          </button>
          <button 
            @click="dateFilter = 'This Semester'" 
            class="px-3 py-1.5 rounded-full font-body-sm text-body-sm border transition-colors"
            :class="dateFilter === 'This Semester' ? 'bg-primary-container text-on-primary-container border-primary-container' : 'bg-surface text-secondary hover:bg-surface-container border-outline-variant'"
          >
            This Semester
          </button>
          <button 
            @click="dateFilter = 'Custom'" 
            class="px-3 py-1.5 rounded-full bg-surface text-secondary hover:bg-surface-container font-body-sm text-body-sm border border-outline-variant transition-colors flex items-center gap-1"
          >
            Custom <span class="material-symbols-outlined text-[14px]">calendar_today</span>
          </button>
        </div>

        <!-- Payment Method Filters -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-label-caps text-label-caps text-secondary mr-2">Method:</span>
          <button 
            @click="methodFilter = 'All'" 
            class="px-3 py-1.5 rounded font-body-sm text-body-sm border font-medium transition-colors"
            :class="methodFilter === 'All' ? 'bg-surface-container-highest text-on-surface border-outline-variant' : 'bg-surface text-secondary border-outline-variant'"
          >
            All
          </button>
          <button 
            @click="methodFilter = 'MTN MoMo'" 
            class="px-3 py-1.5 rounded bg-surface text-secondary hover:bg-surface-container font-body-sm text-body-sm border border-outline-variant transition-colors flex items-center gap-1"
          >
            <div class="w-2 h-2 rounded-full bg-[#FFCC00]"></div> MTN MoMo
          </button>
          <button 
            @click="methodFilter = 'Airtel Money'" 
            class="px-3 py-1.5 rounded bg-surface text-secondary hover:bg-surface-container font-body-sm text-body-sm border border-outline-variant transition-colors flex items-center gap-1"
          >
            <div class="w-2 h-2 rounded-full bg-[#FF0000]"></div> Airtel Money
          </button>
          <button 
            @click="methodFilter = 'Cash'" 
            class="px-3 py-1.5 rounded bg-surface text-secondary hover:bg-surface-container font-body-sm text-body-sm border border-outline-variant transition-colors flex items-center gap-1"
          >
            <div class="w-2 h-2 rounded-full bg-primary"></div> Cash
          </button>
        </div>
      </div>

      <!-- Table Container -->
      <div class="overflow-x-auto">
        <table class="w-full min-w-200 text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant bg-surface-container-low text-secondary font-label-caps text-label-caps">
              <th class="py-3 px-4 font-semibold w-24">Txn ID</th>
              <th class="py-3 px-4 font-semibold">Date/Time</th>
              <th class="py-3 px-4 font-semibold">Tenant</th>
              <th class="py-3 px-4 font-semibold">Room Info</th>
              <th class="py-3 px-4 font-semibold text-right">Amount (ZMW)</th>
              <th class="py-3 px-4 font-semibold text-center">Method</th>
              <th class="py-3 px-4 font-semibold">Logged By</th>
              <th class="py-3 px-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/50">
            <tr v-for="txn in transactions" :key="txn.id" class="hover:bg-slate-50 transition-colors group">
              <td class="py-3 px-4 font-data-mono text-data-mono text-secondary">{{ txn.id }}</td>
              <td class="py-3 px-4">
                <div class="flex flex-col">
                  <span>{{ txn.date }}</span>
                  <span class="text-xs text-outline">{{ txn.time }}</span>
                </div>
              </td>
              <td class="py-3 px-4 font-medium">{{ txn.tenant }}</td>
              <td class="py-3 px-4 text-secondary font-body-sm">{{ txn.room }}</td>
              <td class="py-3 px-4 text-right font-data-mono text-data-mono font-medium">{{ txn.amount }}</td>
              <td class="py-3 px-4 text-center">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border" :class="txn.methodClass">
                  <div class="w-1.5 h-1.5 rounded-full" :class="txn.dotClass"></div> {{ txn.method }}
                </span>
              </td>
              <td class="py-3 px-4 text-secondary">{{ txn.loggedBy }}</td>
              <td class="py-3 px-4 text-center">
                <button class="p-1 text-secondary hover:text-primary rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="material-symbols-outlined text-[20px]">receipt</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-outline-variant flex items-center justify-between text-body-sm font-body-sm text-secondary bg-surface/30 rounded-b-xl">
        <span>Showing 1 to 3 of 342 entries</span>
        <div class="flex gap-1">
          <button class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50" disabled>Prev</button>
          <button class="px-3 py-1 border border-primary bg-primary text-on-primary rounded">1</button>
          <button class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container">2</button>
          <button class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container">3</button>
          <span class="px-2 py-1">...</span>
          <button class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
