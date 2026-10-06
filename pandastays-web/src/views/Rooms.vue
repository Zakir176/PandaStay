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
  if (bed.status === 'vacant' || bed.status === 'reserved') {
    isAssignModalOpen.value = true
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-medium">
          <span>{{ state.currentProperty.name }}</span>
          <span>&bull;</span>
          <span class="text-primary font-semibold">Rentable Unit Architecture</span>
        </div>
        <h2 class="text-2xl font-bold text-on-surface tracking-tight">Rooms & Bed-Spaces</h2>
        <p class="text-xs text-on-surface-variant mt-0.5">
          The bed-space is the fundamental rentable unit. Manage rooms, individual beds, and pricing.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="isAddRoomModalOpen = true"
          class="btn-pill-primary"
        >
          <span class="material-symbols-outlined text-[16px]">add</span>
          <span>Add New Room</span>
        </button>
      </div>
    </div>

    <!-- Summary Metrics Cards (Bento 4-Column Row) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      <div class="card-bento p-4.5 bg-surface">
        <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Total Bed-Spaces</p>
        <p class="text-2xl font-bold font-data-mono text-on-surface mt-1.5">{{ occupancyStats.totalBeds }}</p>
        <p class="text-[11px] text-on-surface-variant mt-0.5">Across {{ state.rooms.length }} rooms</p>
      </div>

      <div class="card-bento p-4.5 bg-surface border-t-3 border-t-primary">
        <p class="text-[10px] font-bold uppercase tracking-wider text-primary">Occupied Beds</p>
        <p class="text-2xl font-bold font-data-mono text-primary mt-1.5">{{ occupancyStats.occupiedBeds }}</p>
        <p class="text-[11px] text-primary font-medium mt-0.5">{{ occupancyStats.percentage }}% occupancy rate</p>
      </div>

      <div class="card-bento p-4.5 bg-surface">
        <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Vacant Beds</p>
        <p class="text-2xl font-bold font-data-mono text-on-surface mt-1.5">{{ occupancyStats.vacantBeds }}</p>
        <p class="text-[11px] text-on-surface-variant mt-0.5">Ready for immediate lease</p>
      </div>

      <div class="card-bento p-4.5 bg-surface border-t-3 border-t-tertiary">
        <p class="text-[10px] font-bold uppercase tracking-wider text-tertiary">Reserved Beds</p>
        <p class="text-2xl font-bold font-data-mono text-tertiary mt-1.5">{{ occupancyStats.reservedBeds }}</p>
        <p class="text-[11px] text-tertiary font-medium mt-0.5">Deposit pending</p>
      </div>
    </div>

    <!-- Centerpiece: Bed-Grid Architectural Floorplan in Bento Container -->
    <div class="card-bento overflow-visible! p-5 bg-surface">
      <BedGrid 
        :rooms="roomsWithBeds" 
        title="Mukuba House — Architectural Bed-Space Layout" 
        @select-bed="handleSelectBed"
      />
    </div>

    <!-- Detailed Bed-Space Table Breakdown in Bento Container -->
    <div class="card-bento p-5 bg-surface space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-border-card">
        <div>
          <h3 class="font-bold text-base text-on-surface">Bed-Space Inventory & Pricing</h3>
          <p class="text-xs text-on-surface-variant">Each bed carries independent rent amounts, status, and tenant tenancy records.</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="border-b border-border-card text-[11px] uppercase tracking-wider text-on-surface-muted font-bold bg-surface-dim/50">
              <th class="py-3 px-3 rounded-l-xl">Silhouette</th>
              <th class="py-3 px-3">Bed Label</th>
              <th class="py-3 px-3">Room</th>
              <th class="py-3 px-3">Rent / Month</th>
              <th class="py-3 px-3">Status</th>
              <th class="py-3 px-3">Current Tenant</th>
              <th class="py-3 px-3 text-right rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-card/60">
            <tr 
              v-for="bed in state.bedSpaces" 
              :key="bed.id"
              class="hover:bg-surface-dim/40 transition-colors"
            >
              <td class="py-3 px-3 align-middle">
                <BedIcon :bed="bed" size="sm" :interactive="false" />
              </td>
              <td class="py-3 px-3 align-middle font-bold text-on-surface text-xs">
                {{ bed.label }}
              </td>
              <td class="py-3 px-3 align-middle text-on-surface-variant font-data-mono text-xs">
                Room {{ bed.label.match(/\d+/)?.[0] || '101' }}
              </td>
              <td class="py-3 px-3 align-middle font-data-mono font-bold text-xs text-on-surface">
                ZMW {{ Number(bed.rent_amount).toLocaleString() }}
              </td>
              <td class="py-3 px-3 align-middle">
                <span 
                  class="badge-pill"
                  :class="{
                    'bg-primary-container text-primary border border-primary/20': bed.status === 'occupied',
                    'bg-hatch-diagonal text-primary border border-primary/30': bed.status === 'reserved',
                    'bg-surface-dim text-on-surface-variant border border-border-card': bed.status === 'vacant'
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="{
                    'bg-primary': bed.status === 'occupied',
                    'bg-primary-accent': bed.status === 'reserved',
                    'bg-outline': bed.status === 'vacant'
                  }"></span>
                  <span class="capitalize">{{ bed.status }}</span>
                </span>
              </td>
              <td class="py-3 px-3 align-middle text-xs text-on-surface">
                <span v-if="bed.status === 'occupied'" class="font-semibold text-primary">
                  {{ bed.tenantName }}
                </span>
                <span v-else-if="bed.status === 'reserved'" class="font-semibold text-tertiary flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">lock_clock</span>
                  {{ bed.tenantName || 'Holding Prospect' }}
                </span>
                <span v-else class="text-on-surface-muted italic">
                  None (Vacant)
                </span>
              </td>
              <td class="py-3 px-3 align-middle text-right">
                <button 
                  v-if="bed.status === 'vacant'"
                  @click="handleSelectBed({ bed, room: { room_number: bed.label.match(/\d+/)?.[0] } })"
                  class="btn-pill-primary py-1 px-3 text-[11px]"
                >
                  Reserve / Assign
                </button>
                <button 
                  v-else-if="bed.status === 'reserved'"
                  @click="handleSelectBed({ bed, room: { room_number: bed.label.match(/\d+/)?.[0] } })"
                  class="btn-pill-outline py-1 px-3 text-[11px] text-tertiary border-tertiary/40 hover:bg-tertiary/10 font-medium inline-flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[13px]">lock_clock</span>
                  <span>Manage</span>
                </button>
                <button 
                  v-else
                  class="btn-pill-outline py-1 px-3 text-[11px]"
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
