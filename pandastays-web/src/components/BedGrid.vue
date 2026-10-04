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
    <!-- Header with quick legend -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant pb-3">
      <div>
        <h3 class="font-semibold text-base text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-xl">single_bed</span>
          {{ title }}
        </h3>
        <p class="text-xs text-on-surface-variant">
          The bed-space is the fundamental rentable unit.
        </p>
      </div>

      <!-- Occupancy Visual Legend -->
      <div class="flex items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-xs bg-primary-container border border-primary"></span>
          <span class="text-on-surface-variant">Occupied (Paid)</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-xs bg-tertiary-container border border-tertiary-accent"></span>
          <span class="text-on-surface-variant">Partial</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-xs bg-error-container border border-error"></span>
          <span class="text-on-surface-variant">Overdue</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-xs border border-dashed border-outline"></span>
          <span class="text-on-surface-variant">Vacant</span>
        </div>
      </div>
    </div>

    <!-- Room Floorplan Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        v-for="room in rooms" 
        :key="room.id"
        class="card-tight p-4 bg-surface-container-lowest transition-shadow hover:shadow-xs flex flex-col justify-between"
        :class="{
          'card-accent-paid': room.status === 'Paid',
          'card-accent-partial': room.status === 'Partial',
          'card-accent-overdue': room.status === 'Overdue',
          'card-accent-neutral': !room.status
        }"
      >
        <!-- Room Header -->
        <div class="flex items-center justify-between border-b border-outline-variant/60 pb-2 mb-3">
          <div>
            <span class="text-[10px] font-semibold text-on-surface-variant tracking-wider uppercase">ROOM</span>
            <h4 class="font-bold text-lg text-on-surface leading-tight">{{ room.room_number }}</h4>
          </div>
          <div class="text-right">
            <span class="badge-pill bg-surface-container-low text-on-surface-variant border border-outline-variant text-[11px]">
              {{ room.beds?.filter(b => b.status === 'occupied').length || 0 }}/{{ room.capacity || room.beds?.length || 2 }} Beds
            </span>
          </div>
        </div>

        <!-- Bed-Grid Layout (Architectural Floor Plan View) -->
        <div class="py-2 flex items-center justify-around gap-2 bg-surface-container-low/40 rounded-[3px] p-2 border border-outline-variant/40 my-2">
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
        <div class="pt-2 border-t border-outline-variant/60 text-xs flex items-center justify-between text-on-surface-variant mt-2">
          <span class="font-data-mono">
            K{{ (room.beds?.[0]?.rent_amount || 2500).toLocaleString() }}/bed
          </span>
          <span 
            v-if="room.status"
            class="font-medium text-[11px]"
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
