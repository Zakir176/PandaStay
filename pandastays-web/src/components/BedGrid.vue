<script setup>
import BedIcon from './BedIcon.vue'

const props = defineProps({
  rooms: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'Room & Bed-Space Floorplan'
  },
  showMetrics: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['select-bed', 'add-bed', 'assign-tenant'])

const handleBedClick = (bed, room) => {
  emit('select-bed', { bed, room })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header with quick capsule legend -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border-card pb-3.5">
      <div>
        <h3 class="font-bold text-base text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">floor</span>
          {{ title }}
        </h3>
        <p class="text-xs text-on-surface-variant mt-0.5">
          Live architectural bed-space occupancy &bull; Fundamental rentable unit
        </p>
      </div>

      <!-- Occupancy Visual Legend with Bento Capsule Badges -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <div class="badge-pill bg-primary-container text-primary border border-primary/20">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          <span>Occupied</span>
        </div>
        <div class="badge-pill bg-tertiary-container text-tertiary border border-tertiary/20">
          <span class="w-2 h-2 rounded-full bg-tertiary"></span>
          <span>Partial</span>
        </div>
        <div class="badge-pill bg-error-container text-error border border-error/20">
          <span class="w-2 h-2 rounded-full bg-error"></span>
          <span>Overdue</span>
        </div>
        <div class="badge-pill bg-hatch-diagonal text-primary border border-primary/30">
          <span class="w-2 h-2 rounded-full bg-primary-accent"></span>
          <span>Reserved (▨)</span>
        </div>
        <div class="badge-pill bg-surface-dim text-on-surface-variant border border-border-card">
          <span class="w-2 h-2 rounded-full border border-dashed border-outline"></span>
          <span>Vacant</span>
        </div>
      </div>
    </div>

    <!-- Room Floorplan Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      <div 
        v-for="room in rooms" 
        :key="room.id"
        class="card-bento p-4 bg-surface hover:border-primary/40 flex flex-col justify-between"
        :class="{
          'border-t-3 border-t-primary': room.status === 'Paid',
          'border-t-3 border-t-tertiary': room.status === 'Partial',
          'border-t-3 border-t-error': room.status === 'Overdue',
          'border-t-3 border-t-border-card': !room.status
        }"
      >
        <!-- Room Header -->
        <div class="flex items-center justify-between border-b border-border-card pb-2.5 mb-2.5">
          <div>
            <span class="text-[10px] font-bold text-on-surface-muted tracking-wider uppercase">ROOM</span>
            <h4 class="font-bold text-lg text-on-surface leading-tight">{{ room.room_number }}</h4>
          </div>
          <div class="text-right">
            <span class="badge-pill bg-surface-dim text-on-surface-variant border border-border-card text-[10px]">
              {{ room.beds?.filter(b => b.status === 'occupied').length || 0 }}/{{ room.capacity || room.beds?.length || 2 }} Beds
            </span>
          </div>
        </div>

        <!-- Bed-Grid Layout (Architectural Floor Plan View) -->
        <div class="py-2.5 flex items-center justify-around gap-2 bg-surface-dim/60 rounded-xl p-2 border border-border-card/60 my-1">
          <BedIcon
            v-for="bed in room.beds" 
            :key="bed.id"
            :bed="bed"
            size="md"
            :show-details="false"
            @click="handleBedClick(bed, room)"
          />
        </div>

        <!-- Room Details Footer -->
        <div class="pt-2 border-t border-border-card text-xs flex items-center justify-between text-on-surface-variant mt-2">
          <span class="font-data-mono font-medium text-[11px]">
            K{{ (room.beds?.[0]?.rent_amount || 2500).toLocaleString() }}/bed
          </span>
          <span 
            v-if="room.status"
            class="font-semibold text-[11px]"
            :class="{
              'text-primary': room.status === 'Paid',
              'text-tertiary': room.status === 'Partial',
              'text-error': room.status === 'Overdue'
            }"
          >
            {{ room.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
