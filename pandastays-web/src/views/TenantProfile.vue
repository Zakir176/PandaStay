<script setup>
import { ref } from 'vue'

const tenant = ref({
  name: 'Chileshe Mubanga',
  university: 'UNZA (University of Zambia)',
  room: 'Room 4 - Bed A',
  statusText: 'Paid Partial (ZMW 400 balance)',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARCnlZwzgs9hN5AD21rweVNDPTfDEupP6i0p7ghTeYXzR7V2YtIqi_T7z7MFwwKGUcQLA89EaNZdNoXw9gsKK1amZTyJO2gjRYMJKuJtXS-0Y78iPi4HTekix1LYAmOaxslFI82yQKFP0Gcmqx3CDfFcfzx9hSzjNt97ynBGsPgbpxfe_DxLqsQfHXhRUwRzc-vgRpzhbRY9V1DZSUsZ3qbZYpnXARPeEyOocMej9ZUCKc69Iskaw6',
  leaseTerm: 'Semester Lease',
  leaseDates: 'Jan 1, 2024 - June 30, 2024',
  emergencyContact: 'Parent',
  emergencyPhone: '+260 97 1234567',
  nrc: '123456/78/9',
  dob: '14 Aug 2002'
})

const paymentHistory = ref([
  {
    date: '15 May 2024',
    amount: '1,200',
    method: 'MTN MoMo',
    methodClass: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    receiptNo: 'REC-8821'
  },
  {
    date: '12 Apr 2024',
    amount: '1,600',
    method: 'Airtel Money',
    methodClass: 'bg-red-50 text-red-800 border-red-200',
    receiptNo: 'REC-7742'
  },
  {
    date: '10 Mar 2024',
    amount: '1,600',
    method: 'Cash',
    methodClass: 'bg-green-50 text-green-800 border-green-200',
    receiptNo: 'REC-6510'
  }
])
</script>

<template>
  <div class="flex flex-col gap-stack-default">
    <!-- Header Back Action & Options -->
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center gap-4">
        <router-link to="/tenants" class="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          <span class="font-label-caps text-label-caps uppercase">Back to Tenants</span>
        </router-link>
        <div class="h-4 w-px bg-outline-variant"></div>
        <div class="font-title-sm text-title-sm text-primary font-semibold">{{ tenant.name }}</div>
      </div>
      <div class="flex items-center gap-4">
        <button class="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition-colors font-body-md text-body-md shadow-sm">
          <span class="material-symbols-outlined text-sm">edit</span> Edit Profile
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-surface-tint transition-all font-body-md text-body-md font-semibold">
          <span class="material-symbols-outlined text-sm">chat</span> Send Message
        </button>
      </div>
    </div>

    <!-- Header Profile Card -->
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-tertiary-fixed/20 to-transparent rounded-bl-full z-0 pointer-events-none"></div>
      <div class="relative z-10 shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-surface shadow-sm bg-surface-container">
        <img :src="tenant.avatar" alt="Tenant Profile Photo" class="w-full h-full object-cover" />
      </div>
      <div class="relative z-10 flex-1 flex flex-col gap-2">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="font-display-lg text-display-lg text-on-surface mb-1 font-bold">{{ tenant.name }}</h2>
            <div class="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md">
              <span class="material-symbols-outlined text-[16px]">school</span>
              <span>{{ tenant.university }}</span>
              <span class="mx-2">•</span>
              <span class="material-symbols-outlined text-[16px]">bed</span>
              <span>{{ tenant.room }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 bg-tertiary-container/10 border border-tertiary-container/20 px-4 py-2 rounded-lg">
            <span class="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
            <span class="font-body-sm text-body-sm font-semibold text-tertiary-container">{{ tenant.statusText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Two Column Layout for Details & Quick Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
      <!-- Tenant Information Bento Box -->
      <div class="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-6">
        <div class="flex items-center justify-between border-b border-outline-variant pb-4">
          <h3 class="font-title-sm text-title-sm text-on-surface flex items-center gap-2 font-semibold">
            <span class="material-symbols-outlined text-primary">badge</span> Tenant Information
          </h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-1">
            <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Lease Term</span>
            <span class="font-body-md text-body-md text-on-surface font-semibold">{{ tenant.leaseTerm }}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">{{ tenant.leaseDates }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Emergency Contact</span>
            <span class="font-body-md text-body-md text-on-surface font-semibold">{{ tenant.emergencyContact }}</span>
            <span class="font-data-mono text-data-mono text-on-surface-variant">{{ tenant.emergencyPhone }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">ID Number (NRC)</span>
            <span class="font-data-mono text-data-mono text-on-surface">{{ tenant.nrc }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Date of Birth</span>
            <span class="font-body-md text-body-md text-on-surface">{{ tenant.dob }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions / Status Summary -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4">
        <h3 class="font-title-sm text-title-sm text-on-surface flex items-center gap-2 mb-2 font-semibold">
          <span class="material-symbols-outlined text-primary">bolt</span> Quick Actions
        </h3>
        <button class="w-full flex items-center justify-between p-3 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-sm">receipt_long</span>
            </div>
            <span class="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">Generate Invoice</span>
          </div>
          <span class="material-symbols-outlined text-outline-variant group-hover:text-primary">chevron_right</span>
        </button>
        <button class="w-full flex items-center justify-between p-3 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary-container">
              <span class="material-symbols-outlined text-sm">warning</span>
            </div>
            <span class="font-body-md text-body-md text-on-surface group-hover:text-tertiary-container transition-colors">Send Reminder (ZMW 400)</span>
          </div>
          <span class="material-symbols-outlined text-outline-variant group-hover:text-tertiary-container">chevron_right</span>
        </button>
        <button class="w-full flex items-center justify-between p-3 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span class="material-symbols-outlined text-sm">history</span>
            </div>
            <span class="font-body-md text-body-md text-on-surface group-hover:text-secondary transition-colors">View Lease Agreement</span>
          </div>
          <span class="material-symbols-outlined text-outline-variant group-hover:text-secondary">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Payment History Data Grid -->
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
      <div class="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <h3 class="font-title-sm text-title-sm text-on-surface flex items-center gap-2 font-semibold">
          <span class="material-symbols-outlined text-primary">account_balance_wallet</span> Payment History
        </h3>
        <button class="flex items-center gap-1 font-body-sm text-body-sm text-primary hover:underline">
          <span class="material-symbols-outlined text-sm">add</span> Record Payment
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low border-b border-outline-variant">
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Date</th>
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Amount (ZMW)</th>
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Method</th>
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Receipt No.</th>
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant">
            <tr v-for="item in paymentHistory" :key="item.receiptNo" class="hover:bg-slate-50 transition-colors group">
              <td class="py-3 px-6 font-body-sm text-body-sm text-on-surface whitespace-nowrap">{{ item.date }}</td>
              <td class="py-3 px-6 font-data-mono text-data-mono text-on-surface font-semibold">{{ item.amount }}</td>
              <td class="py-3 px-6">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-body-sm text-body-sm border" :class="item.methodClass">
                  {{ item.method }}
                </span>
              </td>
              <td class="py-3 px-6 font-data-mono text-data-mono text-on-surface-variant">{{ item.receiptNo }}</td>
              <td class="py-3 px-6 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors" title="Download PDF">
                    <span class="material-symbols-outlined text-[18px]">download</span>
                  </button>
                  <button class="p-1.5 text-on-surface-variant hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Resend WhatsApp">
                    <span class="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
