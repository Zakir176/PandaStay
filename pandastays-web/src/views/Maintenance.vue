<script setup>
import { ref } from 'vue'

const summaryStats = ref({
  openIssues: 12,
  openIssuesGrowth: '+3 this week',
  pendingCost: 'ZMW 4,250',
  resolvedCount: 28,
  resolvedGrowth: '+15%'
})

const requests = ref([
  {
    room: '104',
    title: 'Leaking Bathroom Pipe',
    desc: 'Water spreading to hallway carpet.',
    priority: 'Urgent',
    priorityClass: 'bg-error/10 text-error',
    isUrgent: true,
    reportedDate: 'Oct 25, 2023',
    cost: 'ZMW 0',
    status: 'Open',
    statusClass: 'border-tertiary-container/30 bg-tertiary-container/10 text-tertiary-container',
    resolved: false
  },
  {
    room: '201',
    title: 'Broken Bed Frame',
    desc: 'Slats collapsed on one side.',
    priority: 'Normal',
    priorityClass: 'bg-secondary-container text-on-secondary-container',
    isUrgent: false,
    reportedDate: 'Oct 22, 2023',
    cost: 'ZMW 450',
    status: 'In Progress',
    statusClass: 'border-secondary/30 bg-secondary/10 text-secondary',
    resolved: false
  },
  {
    room: '112',
    title: 'Flickering Lights',
    desc: 'Main room light bulb needs replacing.',
    priority: 'Normal',
    priorityClass: 'bg-secondary-container text-on-secondary-container',
    isUrgent: false,
    reportedDate: 'Oct 26, 2023',
    cost: 'ZMW 0',
    status: 'Open',
    statusClass: 'border-tertiary-container/30 bg-tertiary-container/10 text-tertiary-container',
    resolved: false
  },
  {
    room: '305',
    title: 'Broken Window Pane',
    desc: 'Security risk, ground floor.',
    priority: 'Urgent',
    priorityClass: 'bg-error/10 text-error',
    isUrgent: true,
    reportedDate: 'Oct 20, 2023',
    cost: 'ZMW 850',
    status: 'Fixed',
    statusClass: 'border-primary/30 bg-primary/10 text-primary',
    resolved: true
  }
])
</script>

<template>
  <div class="flex flex-col gap-stack-default">
    <div class="mb-2">
      <h2 class="font-display-lg text-display-lg text-on-surface mb-2 font-bold">Maintenance Requests</h2>
      <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">Manage and track property repairs, tenant complaints, and associated costs across Mukuba House.</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-4">
      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-error/5 rounded-bl-full -mr-4 -mt-4"></div>
        <span class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2 flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px] text-error">warning</span>
          Total Open Issues
        </span>
        <div class="flex items-end justify-between mt-1">
          <span class="font-data-mono text-data-mono text-3xl font-bold text-on-surface">{{ summaryStats.openIssues }}</span>
          <span class="font-body-sm text-body-sm text-error flex items-center bg-error/10 px-2 py-0.5 rounded">
            <span class="material-symbols-outlined text-[14px]">arrow_upward</span>
            {{ summaryStats.openIssuesGrowth }}
          </span>
        </div>
      </div>

      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-tertiary-container/10 rounded-bl-full -mr-4 -mt-4"></div>
        <span class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2 flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px] text-tertiary-container">payments</span>
          Pending Repairs Cost
        </span>
        <div class="flex items-end justify-between mt-1">
          <span class="font-data-mono text-data-mono text-3xl font-bold text-on-surface">{{ summaryStats.pendingCost }}</span>
          <span class="font-body-sm text-body-sm text-on-surface-variant">Est. total</span>
        </div>
      </div>

      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4"></div>
        <span class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2 flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px] text-primary">task_alt</span>
          Resolved This Month
        </span>
        <div class="flex items-end justify-between mt-1">
          <span class="font-data-mono text-data-mono text-3xl font-bold text-on-surface">{{ summaryStats.resolvedCount }}</span>
          <span class="font-body-sm text-body-sm text-primary flex items-center bg-primary/10 px-2 py-0.5 rounded">
            <span class="material-symbols-outlined text-[14px]">arrow_upward</span>
            {{ summaryStats.resolvedGrowth }}
          </span>
        </div>
      </div>
    </div>

    <!-- Maintenance Table -->
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <h3 class="font-title-sm text-title-sm text-on-surface flex items-center gap-2 font-semibold">
          <span class="material-symbols-outlined text-outline">list_alt</span>
          Active Requests
        </h3>
        <div class="flex gap-2">
          <button class="px-3 py-1.5 border border-outline-variant rounded text-on-surface-variant font-body-sm text-body-sm hover:bg-surface-variant transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">filter_list</span> Filter
          </button>
          <button class="px-3 py-1.5 border border-outline-variant rounded text-on-surface-variant font-body-sm text-body-sm hover:bg-surface-variant transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">sort</span> Sort
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low border-b border-outline-variant">
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Room #</th>
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Issue Title</th>
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Priority</th>
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Reported Date</th>
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">Repairs Cost</th>
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-center">Status</th>
              <th class="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="font-body-sm text-body-sm divide-y divide-outline-variant">
            <tr v-for="req in requests" :key="req.room + req.title" class="hover:bg-surface-bright transition-colors group" :class="{ 'bg-surface-container-low/30': req.resolved }">
              <td class="py-3 px-6 font-data-mono text-data-mono font-bold text-on-surface" :class="{ 'line-through opacity-70': req.resolved }">{{ req.room }}</td>
              <td class="py-3 px-6" :class="{ 'opacity-70': req.resolved }">
                <div class="font-medium text-on-surface" :class="{ 'line-through': req.resolved }">{{ req.title }}</div>
                <div class="text-on-surface-variant text-xs truncate max-w-50 mt-0.5">{{ req.desc }}</div>
              </td>
              <td class="py-3 px-6" :class="{ 'opacity-70': req.resolved }">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded font-medium text-xs" :class="req.priorityClass">
                  <span v-if="req.isUrgent" class="material-symbols-outlined text-[14px]">priority_high</span>
                  {{ req.priority }}
                </span>
              </td>
              <td class="py-3 px-6 font-data-mono text-data-mono text-on-surface-variant" :class="{ 'opacity-70': req.resolved }">{{ req.reportedDate }}</td>
              <td class="py-3 px-6 font-data-mono text-data-mono text-right text-on-surface" :class="{ 'opacity-70': req.resolved }">{{ req.cost }}</td>
              <td class="py-3 px-6 text-center">
                <span class="inline-block px-2.5 py-1 rounded border font-medium text-xs whitespace-nowrap" :class="req.statusClass">
                  {{ req.status }}
                </span>
              </td>
              <td class="py-3 px-6 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="text-on-surface-variant hover:text-primary transition-colors p-1" title="View Details">
                    <span class="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                  <button v-if="!req.resolved" class="text-on-surface-variant hover:text-primary transition-colors p-1" title="Edit Request">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-outline-variant bg-surface-bright flex justify-between items-center">
        <span class="font-body-sm text-body-sm text-on-surface-variant">Showing 1 to 4 of 12 requests</span>
        <div class="flex items-center gap-1">
          <button class="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-variant text-outline transition-colors disabled:opacity-50" disabled>
            <span class="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button class="w-8 h-8 flex items-center justify-center rounded bg-primary/10 text-primary font-body-sm font-medium transition-colors">1</button>
          <button class="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-variant text-on-surface-variant font-body-sm transition-colors">2</button>
          <button class="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-variant text-on-surface-variant font-body-sm transition-colors">3</button>
          <button class="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-variant text-on-surface-variant transition-colors">
            <span class="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
