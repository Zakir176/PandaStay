<script setup>
import { computed } from 'vue'

const props = defineProps({
  bed: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'md' // 'sm', 'md', 'lg'
  },
  showDetails: {
    type: Boolean,
    default: false
  },
  interactive: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click'])

// Status styling according to Bento architecture & Section 5 rules
const statusColorClass = computed(() => {
  if (props.bed.status === 'vacant') {
    return 'border-dashed border-outline text-on-surface-muted bg-surface hover:border-primary hover:text-primary hover:bg-primary-container/20'
  }
  if (props.bed.status === 'reserved') {
    return 'border-primary/60 bg-hatch-diagonal text-primary hover:border-primary'
  }
  // Occupied: check payment status if present
  const payStatus = props.bed.paymentStatus || 'paid'
  if (payStatus === 'overdue') {
    return 'border-error bg-error-container/60 text-error hover:ring-2 hover:ring-error/20'
  }
  if (payStatus === 'partial') {
    return 'border-tertiary bg-tertiary-container/60 text-tertiary hover:ring-2 hover:ring-tertiary/20'
  }
  return 'border-primary bg-primary-container text-primary hover:ring-2 hover:ring-primary/20 shadow-xs'
})

const sizeDimensions = computed(() => {
  switch (props.size) {
    case 'xs':
      return {
        box: 'w-8 h-12',
        pillow: 'w-5 h-2.5',
        text: 'text-[8px]',
        icon: 'text-[12px]'
      }
    case 'sm':
      return {
        box: 'w-10 h-14',
        pillow: 'w-6 h-3',
        text: 'text-[9px]',
        icon: 'text-[14px]'
      }
    case 'lg':
      return {
        box: 'w-16 h-24 sm:w-18 sm:h-26',
        pillow: 'w-10 h-5',
        text: 'text-xs',
        icon: 'text-[20px]'
      }
    case 'md':
    default:
      return {
        box: 'w-12 h-16',
        pillow: 'w-7 h-3.5',
        text: 'text-[10px]',
        icon: 'text-[16px]'
      }
  }
})
</script>

<template>
  <div 
    class="group relative inline-flex flex-col items-center shrink-0 hover:z-40"
    :class="{ 'cursor-pointer': interactive }"
    @click="interactive && emit('click', bed)"
  >
    <!-- Bed Architectural Silhouette Card (Top-Down Floorplan View) -->
    <div 
      class="relative flex flex-col items-center justify-between p-1 rounded-lg border transition-all duration-150 select-none overflow-hidden"
      :class="[statusColorClass, sizeDimensions.box]"
    >
      <!-- Headboard Top Rail -->
      <div 
        class="w-full h-1.5 rounded-t-sm opacity-90 shrink-0"
        :class="{
          'bg-primary': bed.status === 'occupied' && (bed.paymentStatus !== 'overdue' && bed.paymentStatus !== 'partial'),
          'bg-error': bed.status === 'occupied' && bed.paymentStatus === 'overdue',
          'bg-tertiary': bed.status === 'occupied' && bed.paymentStatus === 'partial',
          'bg-primary-accent': bed.status === 'reserved',
          'bg-outline': bed.status === 'vacant'
        }"
      ></div>

      <!-- Pillow Element -->
      <div 
        class="rounded-sm border opacity-95 transition-transform group-hover:scale-105 shrink-0"
        :class="[
          sizeDimensions.pillow,
          bed.status === 'occupied' 
            ? 'bg-surface border-current shadow-xs' 
            : bed.status === 'reserved'
            ? 'bg-surface border-primary/50'
            : 'border-dashed border-outline/80 bg-surface/80'
        ]"
      ></div>

      <!-- Center Content: Initials, Icon, or Add Sign -->
      <div class="flex-1 min-h-0 flex flex-col items-center justify-center my-0.5 overflow-hidden">
        <template v-if="bed.status === 'occupied'">
          <span class="font-bold tracking-tight uppercase truncate" :class="sizeDimensions.text">
            {{ bed.tenantInitials || bed.tenantName?.split(' ').map(n=>n[0]).join('') || 'OCC' }}
          </span>
        </template>
        <template v-else-if="bed.status === 'reserved'">
          <span class="material-symbols-outlined text-primary" :class="sizeDimensions.icon">lock_clock</span>
        </template>
        <template v-else>
          <span class="material-symbols-outlined opacity-60 group-hover:opacity-100 group-hover:text-primary transition-opacity" :class="sizeDimensions.icon">add</span>
        </template>
      </div>

      <!-- Footboard Bottom Rail -->
      <div 
        class="w-full text-center truncate px-0.5 font-data-mono font-medium leading-none shrink-0"
        :class="sizeDimensions.text"
      >
        {{ bed.shortLabel || bed.label?.replace(/Bed\s*/i, '') || 'BED' }}
      </div>
    </div>

    <!-- Optional Label below bed -->
    <div v-if="showDetails" class="mt-1 text-center max-w-20">
      <p class="text-[11px] font-medium truncate text-on-surface leading-tight">
        {{ bed.tenantName || (bed.status === 'vacant' ? 'Vacant' : 'Reserved') }}
      </p>
      <p class="font-data-mono text-[10px] text-on-surface-variant">
        K{{ Number(bed.rent_amount || 0).toLocaleString() }}
      </p>
    </div>

    <!-- Hover Tooltip (Interactive floorplan mode) -->
    <div 
      v-if="interactive"
      class="pointer-events-none absolute bottom-full mb-2.5 hidden group-hover:flex flex-col z-50 min-w-48 max-w-64 px-3 py-2 bg-hero-dark text-white text-[11px] rounded-xl shadow-2xl border border-white/20 left-1/2 -translate-x-1/2 whitespace-nowrap"
    >
      <div class="flex items-center justify-between gap-3 border-b border-white/15 pb-1 mb-1 font-semibold">
        <span>{{ bed.label }}</span>
        <span class="capitalize text-[10px] px-1.5 py-0.5 rounded-full" :class="{
          'bg-primary-accent text-hero-dark font-bold': bed.status === 'occupied',
          'bg-tertiary text-white': bed.status === 'reserved',
          'bg-white/20 text-white': bed.status === 'vacant'
        }">{{ bed.status }}</span>
      </div>
      <div v-if="bed.status === 'occupied'" class="space-y-1">
        <p class="flex items-center justify-between gap-3">
          <span class="opacity-70 text-[10px]">Tenant:</span> 
          <span class="font-bold text-white">{{ bed.tenantName || 'Assigned Tenant' }}</span>
        </p>
        <p class="flex items-center justify-between gap-3">
          <span class="opacity-70 text-[10px]">Rent:</span> 
          <span class="font-data-mono text-primary-accent font-semibold">ZMW {{ Number(bed.rent_amount || 0).toLocaleString() }}/mo</span>
        </p>
        <p v-if="bed.paymentStatus" class="flex items-center justify-between gap-3">
          <span class="opacity-70 text-[10px]">Status:</span> 
          <span :class="{
            'text-primary-accent font-semibold': bed.paymentStatus === 'paid',
            'text-tertiary-accent font-semibold': bed.paymentStatus === 'partial',
            'text-error-container font-bold': bed.paymentStatus === 'overdue'
          }" class="capitalize">{{ bed.paymentStatus }}</span>
        </p>
      </div>
      <div v-else-if="bed.status === 'reserved'" class="space-y-1">
        <p class="flex items-center justify-between gap-3">
          <span class="opacity-70 text-[10px]">Prospect:</span> 
          <span class="font-bold text-white">{{ bed.tenantName || 'Holding Prospect' }}</span>
        </p>
        <p v-if="bed.tenantPhone" class="flex items-center justify-between gap-3">
          <span class="opacity-70 text-[10px]">Phone:</span> 
          <span class="font-data-mono text-white/90">{{ bed.tenantPhone }}</span>
        </p>
        <p class="flex items-center justify-between gap-3">
          <span class="opacity-70 text-[10px]">Rent:</span> 
          <span class="font-data-mono text-primary-accent font-semibold">ZMW {{ Number(bed.rent_amount || 0).toLocaleString() }}/mo</span>
        </p>
        <p class="text-[10px] text-tertiary-accent mt-0.5 flex items-center gap-1 font-medium">
          <span class="material-symbols-outlined text-[13px]">lock_clock</span>
          <span>Unpaid hold &bull; Click to manage</span>
        </p>
      </div>
      <div v-else class="space-y-1">
        <p class="flex items-center justify-between gap-3">
          <span class="opacity-70 text-[10px]">Rent:</span> 
          <span class="font-data-mono text-primary-accent font-semibold">ZMW {{ Number(bed.rent_amount || 0).toLocaleString() }}/mo</span>
        </p>
        <p class="text-[10px] text-primary-accent mt-0.5 flex items-center gap-1 font-medium">
          <span class="material-symbols-outlined text-[13px]">add_circle</span>
          <span>Click to reserve or assign</span>
        </p>
      </div>
      <!-- Triangle Indicator pointing down to the bed -->
      <div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-hero-dark"></div>
    </div>
  </div>
</template>
