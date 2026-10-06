<script setup>
import { ref, computed } from 'vue'
import { useStore, roomsWithBeds, occupancyStats } from '../lib/store'
import BedGrid from '../components/BedGrid.vue'
import BedIcon from '../components/BedIcon.vue'
import AssignTenantModal from '../components/AssignTenantModal.vue'
import AddRoomModal from '../components/AddRoomModal.vue'
import EditRoomModal from '../components/EditRoomModal.vue'

const { state, deleteRoom } = useStore()

const selectedBed = ref(null)
const selectedRoom = ref(null)
const isAssignModalOpen = ref(false)
const isAddRoomModalOpen = ref(false)

// Edit & Delete Room Modals State
const selectedRoomToEdit = ref(null)
const isEditRoomModalOpen = ref(false)
const roomToDelete = ref(null)
const isDeleteConfirmModalOpen = ref(false)
const isDeleting = ref(false)

// Inventory per-room filter & view controls
const selectedRoomFilter = ref('all') // 'all' or room_number
const statusFilter = ref('all') // 'all' | 'vacant' | 'reserved' | 'occupied'
const searchQuery = ref('')
const collapsedRooms = ref({})

const toggleRoomCollapse = (roomId) => {
  collapsedRooms.value[roomId] = !collapsedRooms.value[roomId]
}

const expandAllRooms = () => {
  collapsedRooms.value = {}
}

const collapseAllRooms = () => {
  const map = {}
  roomsWithBeds.value.forEach(r => {
    map[r.id] = true
  })
  collapsedRooms.value = map
}

const getRoomStats = (room) => {
  const beds = room.beds || []
  const total = beds.length
  const occupied = beds.filter(b => b.status === 'occupied').length
  const reserved = beds.filter(b => b.status === 'reserved').length
  const vacant = beds.filter(b => b.status === 'vacant').length
  const totalMonthly = beds.reduce((sum, b) => sum + Number(b.rent_amount || 0), 0)
  return { total, occupied, reserved, vacant, totalMonthly }
}

const filteredRooms = computed(() => {
  let list = roomsWithBeds.value || []

  // Filter by selected room tab
  if (selectedRoomFilter.value !== 'all') {
    list = list.filter(r => r.room_number === selectedRoomFilter.value || r.id === selectedRoomFilter.value)
  }

  // Filter by status if specified
  if (statusFilter.value !== 'all') {
    list = list.map(r => ({
      ...r,
      beds: (r.beds || []).filter(b => b.status === statusFilter.value)
    })).filter(r => r.beds.length > 0)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.map(r => {
      const matchingBeds = (r.beds || []).filter(b => 
        b.label?.toLowerCase().includes(q) ||
        b.tenantName?.toLowerCase().includes(q) ||
        b.tenantPhone?.toLowerCase().includes(q) ||
        r.room_number?.toLowerCase().includes(q)
      )
      return {
        ...r,
        beds: matchingBeds
      }
    }).filter(r => r.beds.length > 0)
  }

  return list
})

const handleSelectBed = ({ bed, room }) => {
  selectedBed.value = bed
  selectedRoom.value = room
  if (bed.status === 'vacant' || bed.status === 'reserved') {
    isAssignModalOpen.value = true
  }
}

// Room CRUD Handlers
const openEditRoom = (room) => {
  selectedRoomToEdit.value = room
  isEditRoomModalOpen.value = true
}

const promptDeleteRoom = (room) => {
  roomToDelete.value = room
  isDeleteConfirmModalOpen.value = true
}

const roomToDeleteHasTenants = computed(() => {
  if (!roomToDelete.value?.beds) return false
  return roomToDelete.value.beds.some(b => b.status === 'occupied')
})

const executeDeleteRoom = async () => {
  if (!roomToDelete.value) return
  isDeleting.value = true
  try {
    await deleteRoom(roomToDelete.value.id)
    if (selectedRoomFilter.value === roomToDelete.value.room_number) {
      selectedRoomFilter.value = 'all'
    }
    isDeleteConfirmModalOpen.value = false
    roomToDelete.value = null
  } catch (err) {
    console.error('Failed to delete room:', err)
  } finally {
    isDeleting.value = false
  }
}

const handleRoomUpdated = (updatedRoom) => {
  if (selectedRoomToEdit.value && selectedRoomFilter.value === selectedRoomToEdit.value.room_number) {
    selectedRoomFilter.value = updatedRoom.room_number
  }
}

const handleRoomDeleted = (deletedRoom) => {
  if (selectedRoomFilter.value === deletedRoom.room_number) {
    selectedRoomFilter.value = 'all'
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

    <!-- Section: Bed-Space Inventory & Pricing (Grouped per room) -->
    <div class="space-y-4">
      
      <!-- Section Header & Filter Toolbar -->
      <div class="card-bento p-5 bg-surface border-border-card space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border-card">
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <span class="badge-pill bg-primary/10 text-primary border border-primary/20 text-[10px]">
                Modular Inventory
              </span>
              <span class="text-xs text-on-surface-variant font-medium">Grouped per room</span>
            </div>
            <h3 class="font-bold text-lg text-on-surface">Bed-Space Inventory & Pricing</h3>
            <p class="text-xs text-on-surface-variant">
              Organized by room unit. View independent rates, edit room details, and manage reservations without clutter.
            </p>
          </div>

          <!-- Search & Expand/Collapse Controls -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Search Input -->
            <div class="relative min-w-48 sm:min-w-64">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                search
              </span>
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search tenant or bed..."
                class="w-full pl-9 pr-8 py-1.5 text-xs rounded-full border border-border-card bg-surface-dim/50 text-on-surface focus:border-primary focus:bg-surface focus:outline-none transition-all"
              />
              <button 
                v-if="searchQuery" 
                @click="searchQuery = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span class="material-symbols-outlined text-[14px]">cancel</span>
              </button>
            </div>

            <!-- Expand / Collapse All -->
            <div class="flex items-center rounded-full border border-border-card p-0.5 bg-surface-dim/40 text-xs">
              <button 
                @click="expandAllRooms"
                type="button"
                class="px-2.5 py-1 rounded-full text-[11px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
                title="Expand all rooms"
              >
                Expand All
              </button>
              <span class="text-border-card">|</span>
              <button 
                @click="collapseAllRooms"
                type="button"
                class="px-2.5 py-1 rounded-full text-[11px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
                title="Collapse all rooms"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        <!-- Room Selector Tabs & Status Quick Filters -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-0.5">
          <!-- Room Selector Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <button 
              @click="selectedRoomFilter = 'all'"
              type="button"
              class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
              :class="selectedRoomFilter === 'all' 
                ? 'bg-primary text-white border-primary shadow-xs' 
                : 'bg-surface-dim/60 text-on-surface-variant border-border-card hover:bg-surface-dim hover:text-on-surface'"
            >
              All Rooms ({{ roomsWithBeds.length }})
            </button>
            <button 
              v-for="room in roomsWithBeds" 
              :key="room.id"
              @click="selectedRoomFilter = room.room_number"
              type="button"
              class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1.5"
              :class="selectedRoomFilter === room.room_number 
                ? 'bg-primary text-white border-primary shadow-xs' 
                : 'bg-surface-dim/60 text-on-surface-variant border-border-card hover:bg-surface-dim hover:text-on-surface'"
            >
              <span>Room {{ room.room_number }}</span>
              <span class="text-[10px] opacity-80 font-data-mono">({{ room.beds.length }})</span>
            </button>
          </div>

          <!-- Status Filter Toggle Pills -->
          <div class="flex items-center gap-1 text-[11px] shrink-0 overflow-x-auto">
            <span class="text-on-surface-muted text-[10px] font-bold uppercase tracking-wider mr-1">Filter:</span>
            <button 
              @click="statusFilter = 'all'"
              type="button"
              class="px-2.5 py-1 rounded-full font-medium transition-colors"
              :class="statusFilter === 'all' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'"
            >
              All
            </button>
            <button 
              @click="statusFilter = 'vacant'"
              type="button"
              class="px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1"
              :class="statusFilter === 'vacant' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'"
            >
              <span>Vacant</span>
              <span class="font-data-mono text-[10px]">({{ occupancyStats.vacantBeds }})</span>
            </button>
            <button 
              @click="statusFilter = 'reserved'"
              type="button"
              class="px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1"
              :class="statusFilter === 'reserved' ? 'bg-tertiary/15 text-tertiary font-bold' : 'text-on-surface-variant hover:text-on-surface'"
            >
              <span>Reserved</span>
              <span class="font-data-mono text-[10px]">({{ occupancyStats.reservedBeds }})</span>
            </button>
            <button 
              @click="statusFilter = 'occupied'"
              type="button"
              class="px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1"
              :class="statusFilter === 'occupied' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'"
            >
              <span>Occupied</span>
              <span class="font-data-mono text-[10px]">({{ occupancyStats.occupiedBeds }})</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State when filtering yields no results -->
      <div 
        v-if="filteredRooms.length === 0" 
        class="card-bento p-12 text-center bg-surface border-border-card space-y-3"
      >
        <div class="w-12 h-12 rounded-full bg-surface-dim text-on-surface-variant flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-[24px]">filter_alt_off</span>
        </div>
        <p class="font-bold text-on-surface text-sm">No bed spaces match your filter criteria</p>
        <p class="text-xs text-on-surface-variant max-w-sm mx-auto">
          Try selecting "All Rooms", clearing your search query, or resetting the status filter.
        </p>
        <button 
          @click="selectedRoomFilter = 'all'; statusFilter = 'all'; searchQuery = ''" 
          type="button"
          class="btn-pill-primary text-xs"
        >
          Reset All Filters
        </button>
      </div>

      <!-- Grouped Per-Room Bento Cards -->
      <div 
        v-for="room in filteredRooms" 
        :key="room.id"
        class="card-bento p-5 bg-surface border-border-card space-y-3.5 transition-all duration-200"
      >
        <!-- Room Header Bar -->
        <div 
          @click="toggleRoomCollapse(room.id)"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-card cursor-pointer select-none group"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-[20px]">meeting_room</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                  Room {{ room.room_number }}
                </h3>
                <span class="badge-pill bg-surface-dim text-on-surface-variant border border-border-card text-[10px]">
                  Floor {{ room.room_number?.charAt(0) || '1' }}
                </span>
                <span class="badge-pill bg-surface-dim text-on-surface-variant border border-border-card text-[10px]">
                  {{ room.beds.length }} Bed Spaces
                </span>
              </div>
              <!-- Room Breakdown Summary -->
              <div class="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
                <span class="font-medium text-on-surface">
                  {{ getRoomStats(room).occupied }}/{{ getRoomStats(room).total }} Occupied
                </span>
                <span>&bull;</span>
                <span v-if="getRoomStats(room).reserved > 0" class="text-tertiary font-semibold flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[13px]">lock_clock</span>
                  {{ getRoomStats(room).reserved }} Reserved &bull;
                </span>
                <span :class="getRoomStats(room).vacant > 0 ? 'text-primary font-semibold' : 'text-on-surface-muted'">
                  {{ getRoomStats(room).vacant }} Vacant
                </span>
              </div>
            </div>
          </div>

          <!-- Right side: Revenue, CRUD Action Buttons & Collapse Trigger -->
          <div class="flex items-center justify-between sm:justify-end gap-2.5">
            <div class="text-right mr-1">
              <p class="text-[10px] uppercase font-bold text-on-surface-muted tracking-wider">Room Potential</p>
              <p class="font-data-mono font-bold text-sm text-primary">
                ZMW {{ getRoomStats(room).totalMonthly.toLocaleString() }} <span class="text-[10px] font-normal text-on-surface-variant">/mo</span>
              </p>
            </div>

            <!-- Edit Room Button -->
            <button 
              @click.stop="openEditRoom(room)"
              type="button"
              class="btn-pill-outline py-1 px-2.5 text-[11px] flex items-center gap-1 hover:border-primary hover:text-primary transition-colors"
              title="Edit room credentials & beds"
            >
              <span class="material-symbols-outlined text-[14px]">edit</span>
              <span>Edit</span>
            </button>

            <!-- Delete Room Button -->
            <button 
              @click.stop="promptDeleteRoom(room)"
              type="button"
              class="btn-pill-outline py-1 px-2 text-[11px] text-error border-error/30 hover:bg-error/10 hover:border-error flex items-center transition-colors"
              title="Delete room"
            >
              <span class="material-symbols-outlined text-[14px]">delete</span>
            </button>

            <!-- Collapse Chevron -->
            <div class="w-8 h-8 rounded-full flex items-center justify-center bg-surface-dim text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all">
              <span class="material-symbols-outlined text-[18px] transition-transform duration-200" :class="{ 'rotate-180': !collapsedRooms[room.id] }">
                expand_more
              </span>
            </div>
          </div>
        </div>

        <!-- Collapsed Mini Preview Strip -->
        <div 
          v-if="collapsedRooms[room.id]"
          class="py-2.5 px-3.5 bg-surface-dim/40 rounded-xl flex items-center justify-between gap-3 text-xs text-on-surface-variant"
        >
          <div class="flex items-center gap-3 overflow-x-auto">
            <span class="text-[11px] font-semibold text-on-surface shrink-0">Beds:</span>
            <div class="flex items-center gap-2">
              <div 
                v-for="b in room.beds" 
                :key="b.id"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] shrink-0"
                :class="{
                  'bg-primary-container/40 border-primary/30 text-primary font-semibold': b.status === 'occupied',
                  'bg-hatch-diagonal border-tertiary/40 text-tertiary font-semibold': b.status === 'reserved',
                  'border-dashed border-border-card text-on-surface-muted bg-surface/50': b.status === 'vacant'
                }"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="{
                  'bg-primary': b.status === 'occupied',
                  'bg-tertiary': b.status === 'reserved',
                  'bg-outline': b.status === 'vacant'
                }"></span>
                <span>{{ b.shortLabel || b.label }}</span>
                <span v-if="b.tenantName" class="text-[10px] opacity-80 font-normal">({{ b.tenantName.split(' ')[0] }})</span>
              </div>
            </div>
          </div>
          <span 
            @click.stop="toggleRoomCollapse(room.id)" 
            class="text-[11px] text-primary font-semibold hover:underline cursor-pointer shrink-0 ml-2"
          >
            Expand Details
          </span>
        </div>

        <!-- Expanded Dedicated Bed Spaces Table for this Room -->
        <div v-else class="overflow-x-auto pt-0.5">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-border-card text-[11px] uppercase tracking-wider text-on-surface-muted font-bold bg-surface-dim/50">
                <th class="py-2.5 px-3 rounded-l-xl">Silhouette</th>
                <th class="py-2.5 px-3">Bed Space</th>
                <th class="py-2.5 px-3">Monthly Rent</th>
                <th class="py-2.5 px-3">Status</th>
                <th class="py-2.5 px-3">Assigned Student / Prospect</th>
                <th class="py-2.5 px-3 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-card/60">
              <tr 
                v-for="bed in room.beds" 
                :key="bed.id"
                class="hover:bg-surface-dim/40 transition-colors"
              >
                <td class="py-3 px-3 align-middle">
                  <BedIcon :bed="bed" size="sm" :interactive="false" />
                </td>
                <td class="py-3 px-3 align-middle font-bold text-on-surface text-xs">
                  {{ bed.label }}
                </td>
                <td class="py-3 px-3 align-middle font-data-mono font-bold text-xs text-on-surface">
                  ZMW {{ Number(bed.rent_amount).toLocaleString() }}
                </td>
                <td class="py-3 px-3 align-middle">
                  <span 
                    class="badge-pill"
                    :class="{
                      'bg-primary-container text-primary border border-primary/20': bed.status === 'occupied',
                      'bg-hatch-diagonal text-tertiary border border-tertiary/30': bed.status === 'reserved',
                      'bg-surface-dim text-on-surface-variant border border-border-card': bed.status === 'vacant'
                    }"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="{
                      'bg-primary': bed.status === 'occupied',
                      'bg-tertiary': bed.status === 'reserved',
                      'bg-outline': bed.status === 'vacant'
                    }"></span>
                    <span class="capitalize">{{ bed.status }}</span>
                  </span>
                </td>
                <td class="py-3 px-3 align-middle text-xs text-on-surface">
                  <div v-if="bed.status === 'occupied'" class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                      {{ bed.tenantInitials || bed.tenantName?.substring(0, 2).toUpperCase() || 'ST' }}
                    </div>
                    <span class="font-semibold text-primary">
                      {{ bed.tenantName }}
                    </span>
                  </div>
                  <div v-else-if="bed.status === 'reserved'" class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[15px] text-tertiary shrink-0">lock_clock</span>
                    <div>
                      <p class="font-semibold text-tertiary leading-tight">{{ bed.tenantName || 'Holding Prospect' }}</p>
                      <p v-if="bed.tenantPhone" class="text-[10px] font-data-mono text-on-surface-variant">{{ bed.tenantPhone }}</p>
                    </div>
                  </div>
                  <span v-else class="text-on-surface-muted italic">
                    None (Vacant)
                  </span>
                </td>
                <td class="py-3 px-3 align-middle text-right">
                  <button 
                    v-if="bed.status === 'vacant'"
                    @click="handleSelectBed({ bed, room })"
                    type="button"
                    class="btn-pill-primary py-1 px-3 text-[11px]"
                  >
                    Reserve / Assign
                  </button>
                  <button 
                    v-else-if="bed.status === 'reserved'"
                    @click="handleSelectBed({ bed, room })"
                    type="button"
                    class="btn-pill-outline py-1 px-3 text-[11px] text-tertiary border-tertiary/40 hover:bg-tertiary/10 font-medium inline-flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[13px]">lock_clock</span>
                    <span>Manage</span>
                  </button>
                  <router-link
                    v-else-if="bed.tenantId"
                    :to="`/app/tenants/${bed.tenantId}`"
                    class="btn-pill-outline py-1 px-3 text-[11px] inline-flex items-center gap-1"
                  >
                    <span>View Tenancy</span>
                    <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </router-link>
                  <button 
                    v-else
                    type="button"
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
    </div>

    <!-- Modal: Edit Room & Bed Credentials -->
    <EditRoomModal
      :is-open="isEditRoomModalOpen"
      :room="selectedRoomToEdit"
      @close="isEditRoomModalOpen = false"
      @room-updated="handleRoomUpdated"
      @room-deleted="handleRoomDeleted"
    />

    <!-- Modal: Confirm Direct Delete Room -->
    <div 
      v-if="isDeleteConfirmModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-xs"
    >
      <div class="card-bento w-full max-w-sm p-6 bg-surface shadow-2xl space-y-4 border border-outline-variant/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[20px]">delete_forever</span>
          </div>
          <div>
            <h3 class="font-bold text-base text-on-surface">Delete Room {{ roomToDelete?.room_number }}?</h3>
            <p class="text-xs text-on-surface-variant">Permanent unit removal</p>
          </div>
        </div>

        <div v-if="roomToDeleteHasTenants" class="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
          <p class="font-bold flex items-center gap-1 mb-1">
            <span class="material-symbols-outlined text-[15px]">block</span>
            Active Tenants Detected
          </p>
          <p>
            Room {{ roomToDelete?.room_number }} cannot be deleted because it contains occupied beds with active tenancies. Please vacate or reassign tenants first.
          </p>
        </div>
        <div v-else class="text-xs text-on-surface-variant space-y-2">
          <p>
            Are you sure you want to delete <strong>Room {{ roomToDelete?.room_number }}</strong>?
          </p>
          <p class="text-[11px] text-on-surface-muted">
            This will permanently remove the room and its {{ roomToDelete?.beds?.length || 0 }} bed space(s) from the architectural floorplan and inventory.
          </p>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-border-card">
          <button 
            @click="isDeleteConfirmModalOpen = false"
            type="button"
            class="btn-pill-outline text-xs"
          >
            Cancel
          </button>
          <button 
            v-if="!roomToDeleteHasTenants"
            @click="executeDeleteRoom"
            :disabled="isDeleting"
            type="button"
            class="btn-pill-primary text-xs bg-error hover:bg-error/90 text-white flex items-center gap-1"
          >
            <span v-if="isDeleting" class="material-symbols-outlined animate-spin text-[14px]">sync</span>
            <span v-else class="material-symbols-outlined text-[14px]">delete</span>
            <span>{{ isDeleting ? 'Deleting...' : 'Confirm Delete' }}</span>
          </button>
        </div>
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
