<script setup>
import { ref } from 'vue'
import { useStore, roomsWithBeds, occupancyStats } from '../lib/store'
import BedGrid from '../components/BedGrid.vue'
import BedIcon from '../components/BedIcon.vue'
import AssignTenantModal from '../components/AssignTenantModal.vue'
import AddRoomModal from '../components/AddRoomModal.vue'

const { state } = useStore()

const selectedBed = ref(null)
const selectedRoom = ref(null)
const isAssignModalOpen = ref(false)
const isAddRoomModalOpen = ref(false)

const handleSelectBed = ({ bed, room }) => {
  selectedBed.value = bed
  selectedRoom.value = room
  if (bed.status === 'vacant') {
    isAssignModalOpen.value = true
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-1">
          <span>{{ state.currentProperty.name }}</span>
          <span>&bull;</span>
          <span class="text-primary font-medium">Rentable Unit Architecture</span>
        </div>
        <h2 class="text-2xl font-bold text-on-surface tracking-tight">Rooms & Bed-Spaces</h2>
        <p class="text-sm text-on-surface-variant mt-0.5">
          The bed-space is the fundamental rentable unit. Manage rooms, individual beds, and pricing.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="isAddRoomModalOpen = true"
          class="flex items-center gap-2 px-3.5 py-2 bg-primary text-on-primary text-xs font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-xs"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          Add New Room
        </button>
      </div>
    </div>

    <!-- Summary Metrics Cards (Section 5.3 rules: tight 4px radius, no heavy drop shadows) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="card-tight p-4 bg-surface-container-lowest">
        <p class="text-xs text-on-surface-variant font-medium">Total Bed-Spaces</p>
        <p class="text-2xl font-bold font-data-mono text-on-surface mt-1">{{ occupancyStats.totalBeds }}</p>
        <p class="text-[11px] text-on-surface-variant mt-0.5">Across {{ state.rooms.length }} rooms</p>
      </div>

      <div class="card-tight p-4 bg-surface-container-lowest card-accent-paid">
        <p class="text-xs text-on-surface-variant font-medium">Occupied Beds</p>
        <p class="text-2xl font-bold font-data-mono text-primary mt-1">{{ occupancyStats.occupiedBeds }}</p>
        <p class="text-[11px] text-primary mt-0.5">{{ occupancyStats.percentage }}% occupancy rate</p>
      </div>

      <div class="card-tight p-4 bg-surface-container-lowest">
        <p class="text-xs text-on-surface-variant font-medium">Vacant Beds</p>
        <p class="text-2xl font-bold font-data-mono text-on-surface mt-1">{{ occupancyStats.vacantBeds }}</p>
        <p class="text-[11px] text-on-surface-variant mt-0.5">Ready for immediate lease</p>
      </div>

      <div class="card-tight p-4 bg-surface-container-lowest card-accent-partial">
        <p class="text-xs text-on-surface-variant font-medium">Reserved Beds</p>
        <p class="text-2xl font-bold font-data-mono text-tertiary mt-1">{{ occupancyStats.reservedBeds }}</p>
        <p class="text-[11px] text-tertiary mt-0.5">Deposit pending</p>
      </div>
    </div>

    <!-- Centerpiece: Bed-Grid Architectural Floorplan -->
    <div class="card-tight p-5 bg-surface-container-lowest">
      <BedGrid 
        :rooms="roomsWithBeds" 
        title="Mukuba House — Bed-Space Floorplan Layout" 
        @select-bed="handleSelectBed"
      />
    </div>

    <!-- Detailed Bed-Space Table Breakdown -->
    <div class="card-tight p-5 bg-surface-container-lowest space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-base text-on-surface">Bed-Space Inventory & Pricing</h3>
          <p class="text-xs text-on-surface-variant">Each bed-space carries its own independent rent amount and tenant tenancy.</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="border-b border-outline-variant text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold bg-surface-container-low/50">
              <th class="py-2.5 px-3">Bed Silhouette</th>
              <th class="py-2.5 px-3">Bed Label</th>
              <th class="py-2.5 px-3">Room</th>
              <th class="py-2.5 px-3">Rent / Month</th>
              <th class="py-2.5 px-3">Status</th>
              <th class="py-2.5 px-3">Current Tenant</th>
              <th class="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/60">
            <tr 
              v-for="bed in state.bedSpaces" 
              :key="bed.id"
              class="hover:bg-surface-container-low/30 transition-colors"
            >
              <td class="py-3 px-3">
                <BedIcon :bed="bed" size="sm" :interactive="false" />
              </td>
              <td class="py-3 px-3 font-semibold text-on-surface">
                {{ bed.label }}
              </td>
              <td class="py-3 px-3 text-on-surface-variant font-data-mono">
                Room {{ bed.label.match(/\d+/)?.[0] || '101' }}
              </td>
              <td class="py-3 px-3 font-data-mono font-medium text-on-surface">
                ZMW {{ Number(bed.rent_amount).toLocaleString() }}
              </td>
              <td class="py-3 px-3">
                <span 
                  class="badge-pill"
                  :class="{
                    'bg-primary-container text-primary': bed.status === 'occupied',
                    'bg-tertiary-container text-tertiary': bed.status === 'reserved',
                    'bg-surface-container-low text-on-surface-variant border border-outline': bed.status === 'vacant'
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="{
                    'bg-primary': bed.status === 'occupied',
                    'bg-tertiary-accent': bed.status === 'reserved',
                    'bg-outline': bed.status === 'vacant'
                  }"></span>
                  <span class="capitalize">{{ bed.status }}</span>
                </span>
              </td>
              <td class="py-3 px-3 text-on-surface">
                <span v-if="bed.tenantName" class="font-medium text-primary">
                  {{ bed.tenantName }}
                </span>
                <span v-else class="text-on-surface-variant/60 italic text-xs">
                  None (Vacant)
                </span>
              </td>
              <td class="py-3 px-3 text-right">
                <button 
                  v-if="bed.status === 'vacant'"
                  @click="handleSelectBed({ bed, room: { room_number: bed.label.match(/\d+/)?.[0] } })"
                  class="px-2.5 py-1 text-xs font-medium text-primary bg-primary-container hover:bg-primary hover:text-on-primary rounded-sm transition-colors"
                >
                  Assign Tenant
                </button>
                <button 
                  v-else
                  class="px-2.5 py-1 text-xs font-medium text-on-surface-variant hover:text-on-surface rounded-sm border border-outline-variant hover:bg-surface-container-low transition-colors"
                >
                  View Tenancy
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Assign Tenant to Bed-Space -->
    <AssignTenantModal
      :is-open="isAssignModalOpen"
      :bed="selectedBed"
      :room="selectedRoom"
      @close="isAssignModalOpen = false"
    />

    <!-- Modal: Add New Room -->
    <AddRoomModal
      :is-open="isAddRoomModalOpen"
      @close="isAddRoomModalOpen = false"
    />
  </div>
</template>
