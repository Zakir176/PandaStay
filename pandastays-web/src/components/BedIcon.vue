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

// Status styling according to Section 5.1 & 5.3
const statusColorClass = computed(() => {
  if (props.bed.status === 'vacant') {
    return 'border-dashed border-outline text-on-surface-variant/60 bg-transparent hover:border-primary hover:bg-primary-container/20'
  }
  if (props.bed.status === 'reserved') {
    return 'border-tertiary-accent/60 bg-tertiary-container/30 text-tertiary hover:border-tertiary'
  }
  // Occupied: check payment status if present
  const payStatus = props.bed.paymentStatus || 'paid'
  if (payStatus === 'overdue') {
    return 'border-error bg-error-container/40 text-error hover:ring-1 hover:ring-error'
  }
  if (payStatus === 'partial') {
    return 'border-tertiary-accent bg-tertiary-container/50 text-tertiary hover:ring-1 hover:ring-tertiary-accent'
  }
  return 'border-primary bg-primary-container/60 text-primary hover:ring-1 hover:ring-primary'
})

const sizeDimensions = computed(() => {
  switch (props.size) {
    case 'sm':
      return {
        box: 'w-10 h-14',
        pillow: 'w-6 h-3',
        text: 'text-[9px]',
        icon: 'text-[14px]'
      }
    case 'lg':
      return {
        box: 'w-20 h-28',
        pillow: 'w-14 h-6',
        text: 'text-xs',
        icon: 'text-[24px]'
      }
    case 'md':
    default:
      return {
        box: 'w-14 h-20',
        pillow: 'w-9 h-4',
        text: 'text-[10px]',
        icon: 'text-[18px]'
      }
  }
})
</script>

<template>
  <div 
    class="group relative inline-flex flex-col items-center"
    :class="{ 'cursor-pointer': interactive }"
    @click="interactive && emit('click', bed)"
  >
    <!-- Bed Architectural Silhouette Card (Top-Down Floorplan View) -->
    <div 
      class="relative flex flex-col items-center justify-between p-1 rounded-sm border transition-all duration-150 select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      :class="[statusColorClass, sizeDimensions.box]"
    >
      <!-- Headboard Top Rail -->
      <div 
        class="w-full h-1 rounded-t-xs opacity-80"
        :class="{
          'bg-primary': bed.status === 'occupied' && (bed.paymentStatus !== 'overdue' && bed.paymentStatus !== 'partial'),
          'bg-error': bed.status === 'occupied' && bed.paymentStatus === 'overdue',
          'bg-tertiary-accent': (bed.status === 'occupied' && bed.paymentStatus === 'partial') || bed.status === 'reserved',
          'bg-outline': bed.status === 'vacant'
        }"
      ></div>

      <!-- Pillow Element -->
      <div 
        class="rounded-xs border opacity-90 transition-transform group-hover:scale-105"
        :class="[
          sizeDimensions.pillow,
          bed.status === 'occupied' 
            ? 'bg-surface-container-lowest border-current shadow-xs' 
            : 'border-dashed border-outline-variant bg-surface/50'
        ]"
      ></div>

      <!-- Center Content: Initials, Icon, or Add Sign -->
      <div class="flex-1 flex flex-col items-center justify-center my-0.5">
        <template v-if="bed.status === 'occupied'">
          <span class="font-bold tracking-tight uppercase" :class="sizeDimensions.text">
            {{ bed.tenantInitials || bed.tenantName?.split(' ').map(n=>n[0]).join('') || 'OCC' }}
          </span>
        </template>
        <template v-else-if="bed.status === 'reserved'">
          <span class="material-symbols-outlined" :class="sizeDimensions.icon">lock_clock</span>
        </template>
        <template v-else>
          <span class="material-symbols-outlined opacity-60 group-hover:opacity-100 group-hover:text-primary transition-opacity" :class="sizeDimensions.icon">add</span>
        </template>
      </div>

      <!-- Footboard Bottom Rail -->
      <div 
        class="w-full text-center truncate px-0.5 font-data-mono font-medium leading-none"
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

    <!-- Hover Tooltip -->
    <div 
      class="pointer-events-none absolute bottom-full mb-2 hidden group-hover:flex flex-col z-30 min-w-35 px-2.5 py-1.5 bg-inverse-surface text-inverse-on-surface text-[11px] rounded-sm shadow-md border border-outline/30"
    >
      <div class="flex items-center justify-between gap-2 border-b border-inverse-on-surface/20 pb-1 mb-1 font-semibold">
        <span>{{ bed.label }}</span>
        <span class="capitalize text-[10px] px-1 rounded" :class="{
          'bg-primary text-on-primary': bed.status === 'occupied',
          'bg-tertiary-accent text-on-primary': bed.status === 'reserved',
          'bg-surface-variant text-on-surface': bed.status === 'vacant'
        }">{{ bed.status }}</span>
      </div>
      <div v-if="bed.status === 'occupied'" class="space-y-0.5">
        <p><span class="opacity-70">Tenant:</span> {{ bed.tenantName || 'Assigned Tenant' }}</p>
        <p><span class="opacity-70">Rent:</span> <span class="font-data-mono">ZMW {{ Number(bed.rent_amount || 0).toLocaleString() }}/mo</span></p>
        <p v-if="bed.paymentStatus">
          <span class="opacity-70">Status:</span> 
          <span :class="{
            'text-primary-fixed-dim': bed.paymentStatus === 'paid',
            'text-tertiary-fixed-dim': bed.paymentStatus === 'partial',
            'text-error-container': bed.paymentStatus === 'overdue'
          }" class="font-medium capitalize"> {{ bed.paymentStatus }}</span>
        </p>
      </div>
      <div v-else class="space-y-0.5">
        <p><span class="opacity-70">Rent:</span> <span class="font-data-mono">ZMW {{ Number(bed.rent_amount || 0).toLocaleString() }}/mo</span></p>
        <p class="text-[10px] text-primary-fixed-dim mt-1">Click to assign tenant</p>
      </div>
    </div>
  </div>
</template>
