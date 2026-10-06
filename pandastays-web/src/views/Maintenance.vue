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
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
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
          class="btn-pill-primary"
        >
          <span class="material-symbols-outlined text-[16px]">add</span>
          <span>Log Maintenance Ticket</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats in Bento Row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card-bento p-5 bg-surface border-t-3 border-t-error flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-error">Open Tickets</span>
          <p class="text-2xl font-bold font-data-mono text-error mt-2">
            {{ state.reports.filter(r => r.status === 'open').length }}
          </p>
        </div>
        <p class="text-[11px] text-on-surface-variant mt-2 pt-2 border-t border-border-card">Awaiting landlord attention</p>
      </div>

      <div class="card-bento p-5 bg-surface border-t-3 border-t-tertiary flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-tertiary">In Progress</span>
          <p class="text-2xl font-bold font-data-mono text-tertiary mt-2">
            {{ state.reports.filter(r => r.status === 'in_progress').length }}
          </p>
        </div>
        <p class="text-[11px] text-on-surface-variant mt-2 pt-2 border-t border-border-card">Artisan assigned on site</p>
      </div>

      <div class="card-bento p-5 bg-surface border-t-3 border-t-primary flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-primary">Resolved</span>
          <p class="text-2xl font-bold font-data-mono text-primary mt-2">
            {{ state.reports.filter(r => r.status === 'resolved').length }}
          </p>
        </div>
        <p class="text-[11px] text-on-surface-variant mt-2 pt-2 border-t border-border-card">Inspected & cleared</p>
      </div>
    </div>

    <!-- Category Filters Bar (Capsule Strip) -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 card-bento">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-bold text-on-surface-muted mr-1.5 uppercase text-[10px] tracking-wider">Filter:</span>
        <button 
          v-for="cat in categories" 
          :key="cat"
          @click="activeCategory = cat"
          class="badge-pill text-xs py-1 px-3 transition-colors cursor-pointer"
          :class="activeCategory === cat ? 'bg-primary text-white font-bold' : 'bg-surface-dim text-on-surface-variant hover:bg-surface-dim/80'"
        >
          {{ cat }}
        </button>
      </div>

      <div class="text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
        <span class="material-symbols-outlined text-[16px]">drag_indicator</span>
        <span>Drag tickets or use arrows to adjust priority rank</span>
      </div>
    </div>

    <!-- Priority Ranked Tickets List (Bento Task Cards) -->
    <div class="space-y-3">
      <div 
        v-for="(report, index) in filteredReports" 
        :key="report.id"
        draggable="true"
        @dragstart="onDragStart(index)"
        @dragover.prevent
        @drop="onDrop(index)"
        class="card-bento p-4 bg-surface transition-all duration-150 hover:border-primary/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-move"
        :class="{
          'border-l-4 border-l-primary': report.status === 'resolved',
          'border-l-4 border-l-tertiary': report.status === 'in_progress',
          'border-l-4 border-l-error': report.status === 'open'
        }"
      >
        <!-- Rank Pill & Drag Handle -->
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-center justify-center w-8 h-8 rounded-xl bg-surface-dim font-data-mono font-bold text-xs text-on-surface border border-border-card">
            #{{ report.priority_rank || index + 1 }}
          </div>

          <div class="flex flex-col gap-0.5">
            <button 
              @click.stop="moveUp(report.id)"
              :disabled="index === 0"
              class="w-6 h-4 flex items-center justify-center text-on-surface-muted hover:text-primary disabled:opacity-30 cursor-pointer"
              title="Move Up in Priority"
            >
              <span class="material-symbols-outlined text-[16px]">keyboard_arrow_up</span>
            </button>
            <button 
              @click.stop="moveDown(report.id)"
              :disabled="index === filteredReports.length - 1"
              class="w-6 h-4 flex items-center justify-center text-on-surface-muted hover:text-primary disabled:opacity-30 cursor-pointer"
              title="Move Down in Priority"
            >
              <span class="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
            </button>
          </div>

          <!-- Ticket Content -->
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge-pill bg-surface-dim text-on-surface-variant font-semibold text-[10px] border border-border-card">
                {{ report.category }}
              </span>
              <span class="font-data-mono text-xs text-on-surface font-bold">
                Room {{ report.room_number }}
              </span>
              <span class="text-xs text-on-surface-muted">&bull;</span>
              <span class="text-xs text-on-surface-variant font-medium">Reported by {{ report.tenant_name }}</span>
            </div>

            <p class="text-sm font-bold text-on-surface">
              {{ report.description }}
            </p>

            <p class="text-[11px] text-on-surface-muted font-data-mono">
              Reported: {{ report.created_at }} &bull; Contact: {{ report.tenant_phone }}
            </p>
          </div>
        </div>

        <!-- Status Management Capsule Action Buttons -->
        <div class="flex items-center gap-1.5 self-end md:self-center">
          <button 
            @click="handleStatusChange(report.id, 'open')"
            class="badge-pill py-1 px-3 text-[11px] transition-colors cursor-pointer"
            :class="report.status === 'open' ? 'bg-error-container text-error font-bold border border-error/30' : 'bg-surface-dim text-on-surface-variant hover:bg-surface-dim/80'"
          >
            Open
          </button>

          <button 
            @click="handleStatusChange(report.id, 'in_progress')"
            class="badge-pill py-1 px-3 text-[11px] transition-colors cursor-pointer"
            :class="report.status === 'in_progress' ? 'bg-tertiary-container text-tertiary font-bold border border-tertiary/30' : 'bg-surface-dim text-on-surface-variant hover:bg-surface-dim/80'"
          >
            In Progress
          </button>

          <button 
            @click="handleStatusChange(report.id, 'resolved')"
            class="badge-pill py-1 px-3 text-[11px] transition-colors cursor-pointer"
            :class="report.status === 'resolved' ? 'bg-primary-container text-primary font-bold border border-primary/30' : 'bg-surface-dim text-on-surface-variant hover:bg-surface-dim/80'"
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
