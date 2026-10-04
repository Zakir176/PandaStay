<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../lib/store'
import LogMaintenanceModal from '../components/LogMaintenanceModal.vue'

const { state, reorderReport, updateReportStatus } = useStore()

const activeCategory = ref('All')
const isNewReportModalOpen = ref(false)

const categories = ['All', 'Plumbing', 'Electrical', 'Furniture', 'Security/Locks']

const filteredReports = computed(() => {
  if (activeCategory.value === 'All') {
    return state.reports
  }
  return state.reports.filter(r => r.category.toLowerCase() === activeCategory.value.toLowerCase())
})

const moveUp = (reportId) => {
  reorderReport(reportId, 'up')
}

const moveDown = (reportId) => {
  reorderReport(reportId, 'down')
}

const handleStatusChange = (reportId, status) => {
  updateReportStatus(reportId, status)
}

// Drag and drop HTML5 implementation
const draggedIndex = ref(null)

const onDragStart = (index) => {
  draggedIndex.value = index
}

const onDrop = (targetIndex) => {
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) return
  const item = state.reports.splice(draggedIndex.value, 1)[0]
  state.reports.splice(targetIndex, 0, item)
  // Re-rank 1..N
  state.reports.forEach((r, idx) => {
    r.priority_rank = idx + 1
  })
  draggedIndex.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-medium">
          <span>{{ state.currentProperty.name }}</span>
          <span>&bull;</span>
          <span class="text-primary font-semibold">Maintenance Dispatch</span>
        </div>
        <h2 class="text-2xl font-bold text-on-surface tracking-tight">Maintenance & Repairs</h2>
        <p class="text-xs text-on-surface-variant mt-0.5">
          Manual priority ranking — landlords drag and order tickets by actual urgency.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="isNewReportModalOpen = true"
          class="flex items-center gap-2 px-3.5 py-2 bg-primary text-on-primary text-xs font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-xs"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          Log Maintenance Ticket
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="card-tight p-4 bg-surface-container-lowest card-accent-overdue">
        <p class="text-xs text-on-surface-variant font-medium">Open Tickets</p>
        <p class="text-2xl font-bold font-data-mono text-error mt-1">
          {{ state.reports.filter(r => r.status === 'open').length }}
        </p>
        <p class="text-[11px] text-on-surface-variant mt-0.5">Awaiting landlord attention</p>
      </div>

      <div class="card-tight p-4 bg-surface-container-lowest card-accent-partial">
        <p class="text-xs text-on-surface-variant font-medium">In Progress</p>
        <p class="text-2xl font-bold font-data-mono text-tertiary mt-1">
          {{ state.reports.filter(r => r.status === 'in_progress').length }}
        </p>
        <p class="text-[11px] text-on-surface-variant mt-0.5">Artisan / contractor assigned</p>
      </div>

      <div class="card-tight p-4 bg-surface-container-lowest card-accent-paid">
        <p class="text-xs text-on-surface-variant font-medium">Resolved</p>
        <p class="text-2xl font-bold font-data-mono text-primary mt-1">
          {{ state.reports.filter(r => r.status === 'resolved').length }}
        </p>
        <p class="text-[11px] text-on-surface-variant mt-0.5">Inspected & cleared</p>
      </div>
    </div>

    <!-- Category Filters Bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-3 card-tight">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-on-surface-variant mr-1">Filter:</span>
        <button 
          v-for="cat in categories" 
          :key="cat"
          @click="activeCategory = cat"
          class="px-3 py-1.5 rounded-sm text-xs font-medium transition-colors"
          :class="activeCategory === cat ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'"
        >
          {{ cat }}
        </button>
      </div>

      <div class="text-xs text-on-surface-variant flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[16px]">drag_indicator</span>
        <span>Drag tickets or use arrows to adjust priority rank</span>
      </div>
    </div>

    <!-- Priority Ranked Tickets List (Manual Ordering) -->
    <div class="space-y-3">
      <div 
        v-for="(report, index) in filteredReports" 
        :key="report.id"
        draggable="true"
        @dragstart="onDragStart(index)"
        @dragover.prevent
        @drop="onDrop(index)"
        class="card-tight p-4 bg-surface-container-lowest transition-all duration-150 hover:border-primary flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-move"
        :class="{
          'card-accent-paid': report.status === 'resolved',
          'card-accent-partial': report.status === 'in_progress',
          'card-accent-overdue': report.status === 'open'
        }"
      >
        <!-- Rank Pill & Drag Handle -->
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-center justify-center w-8 h-8 rounded-sm bg-surface-container font-data-mono font-bold text-sm text-on-surface">
            #{{ report.priority_rank || index + 1 }}
          </div>

          <div class="flex flex-col gap-0.5">
            <button 
              @click.stop="moveUp(report.id)"
              :disabled="index === 0"
              class="w-6 h-4 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-30"
              title="Move Up in Priority"
            >
              <span class="material-symbols-outlined text-[16px]">keyboard_arrow_up</span>
            </button>
            <button 
              @click.stop="moveDown(report.id)"
              :disabled="index === filteredReports.length - 1"
              class="w-6 h-4 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-30"
              title="Move Down in Priority"
            >
              <span class="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
            </button>
          </div>

          <!-- Ticket Content -->
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge-pill bg-surface-container text-on-surface-variant font-medium text-[10px]">
                {{ report.category }}
              </span>
              <span class="font-data-mono text-xs text-on-surface-variant font-semibold">
                Room {{ report.room_number }}
              </span>
              <span class="text-xs text-on-surface-variant">&bull;</span>
              <span class="text-xs text-on-surface font-medium">Reported by {{ report.tenant_name }}</span>
            </div>

            <p class="text-sm font-semibold text-on-surface">
              {{ report.description }}
            </p>

            <p class="text-[11px] text-on-surface-variant font-data-mono">
              Reported: {{ report.created_at }} &bull; Contact: {{ report.tenant_phone }}
            </p>
          </div>
        </div>

        <!-- Status Management Actions -->
        <div class="flex items-center gap-2 self-end md:self-center">
          <button 
            @click="handleStatusChange(report.id, 'open')"
            class="px-2.5 py-1 text-xs rounded-sm font-medium transition-colors"
            :class="report.status === 'open' ? 'bg-error-container text-error font-bold border border-error/30' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'"
          >
            Open
          </button>

          <button 
            @click="handleStatusChange(report.id, 'in_progress')"
            class="px-2.5 py-1 text-xs rounded-sm font-medium transition-colors"
            :class="report.status === 'in_progress' ? 'bg-tertiary-container text-tertiary font-bold border border-tertiary-accent/30' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'"
          >
            In Progress
          </button>

          <button 
            @click="handleStatusChange(report.id, 'resolved')"
            class="px-2.5 py-1 text-xs rounded-sm font-medium transition-colors"
            :class="report.status === 'resolved' ? 'bg-primary-container text-primary font-bold border border-primary/30' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'"
          >
            Resolved
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Log Maintenance Ticket -->
    <LogMaintenanceModal
      :is-open="isNewReportModalOpen"
      @close="isNewReportModalOpen = false"
    />
  </div>
</template>
