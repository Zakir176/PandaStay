<script setup>
import { ref, watch, computed } from 'vue'
import { useStore } from '../lib/store'
import BedIcon from './BedIcon.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  room: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'roomUpdated', 'roomDeleted'])

const { updateRoom, deleteRoom } = useStore()

const editRoomNumber = ref('')
const editCapacity = ref(2)
const editBeds = ref([])
const isSubmitting = ref(false)
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Count occupied and reserved beds in current room
const occupiedBedsCount = computed(() => {
  if (!props.room?.beds) return 0
  return props.room.beds.filter(b => b.status === 'occupied').length
})

const reservedBedsCount = computed(() => {
  if (!props.room?.beds) return 0
  return props.room.beds.filter(b => b.status === 'reserved').length
})

const hasOccupiedBeds = computed(() => occupiedBedsCount.value > 0)

// Populate state when room or modal open changes
watch([() => props.isOpen, () => props.room], ([open, room]) => {
  if (open && room) {
    errorMessage.value = ''
    successMessage.value = ''
    showDeleteConfirm.value = false
    editRoomNumber.value = room.room_number || ''
    editCapacity.value = room.capacity || room.beds?.length || 2
    editBeds.value = (room.beds || []).map(b => ({
      id: b.id,
      label: b.label,
      rent_amount: Number(b.rent_amount || 2500),
      status: b.status,
      tenantName: b.tenantName,
      tenantPhone: b.tenantPhone
    }))
  }
})

const handleClose = () => {
  errorMessage.value = ''
  successMessage.value = ''
  showDeleteConfirm.value = false
  emit('close')
}

// 1. Save Room & Bed Updates
const handleSave = async () => {
  if (!editRoomNumber.value.trim() || !props.room) {
    errorMessage.value = 'Please provide a valid room number.'
    return
  }

  // Check capacity validation
  if (editCapacity.value < occupiedBedsCount.value) {
    errorMessage.value = `Cannot reduce capacity below ${occupiedBedsCount.value} currently occupied bed(s). Please reassign tenants first.`
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  try {
    const updated = await updateRoom({
      roomId: props.room.id,
      roomNumber: editRoomNumber.value.trim(),
      capacity: editCapacity.value,
      bedUpdates: editBeds.value
    })

    emit('roomUpdated', updated)
    handleClose()
  } catch (err) {
    console.error('Failed to update room:', err)
    errorMessage.value = err.message || 'Failed to update room details.'
  } finally {
    isSubmitting.value = false
  }
}

// 2. Delete Room
const handleDelete = async () => {
  if (!props.room) return

  if (hasOccupiedBeds.value) {
    errorMessage.value = 'Cannot delete room with active tenants. Vacate or reassign tenants first.'
    return
  }

  isDeleting.value = true
  errorMessage.value = ''
  try {
    await deleteRoom(props.room.id)
    emit('roomDeleted', props.room)
    handleClose()
  } catch (err) {
    console.error('Failed to delete room:', err)
    errorMessage.value = err.message || 'Failed to delete room.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-xs"
  >
    <div class="card-bento w-full max-w-lg p-6 bg-surface shadow-2xl space-y-4 border border-outline-variant/60 max-h-[92vh] overflow-y-auto">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-outline-variant/60 pb-3">
        <div>
          <div class="flex items-center gap-2 mb-0.5">
            <span class="badge-pill bg-primary/10 text-primary border border-primary/20 text-[10px]">
              Room {{ room?.room_number }}
            </span>
            <span class="badge-pill bg-surface-dim text-on-surface-variant border border-border-card text-[10px]">
              {{ room?.beds?.length || 0 }} Beds
            </span>
          </div>
          <h3 class="font-bold text-lg text-on-surface">Edit Room & Bed Credentials</h3>
          <p class="text-xs text-on-surface-variant">
            Update room identifier, capacity, and bed space details.
          </p>
        </div>
        <button 
          @click="handleClose" 
          class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <!-- Error Notification Banner -->
      <div v-if="errorMessage" class="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-start gap-2">
        <span class="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Room Credentials Form -->
      <div class="space-y-4">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <!-- Room Number -->
          <div>
            <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
              Room Number / Name <span class="text-error">*</span>
            </label>
            <input 
              v-model="editRoomNumber"
              type="text" 
              placeholder="e.g. 101, Annex 2, Block B-10"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none transition-all font-semibold"
              required
            />
          </div>

          <!-- Room Capacity -->
          <div>
            <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
              Capacity (Total Beds) <span class="text-error">*</span>
            </label>
            <div class="flex items-center gap-2">
              <input 
                v-model.number="editCapacity"
                type="number" 
                :min="occupiedBedsCount || 1"
                max="8"
                class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono font-semibold transition-all"
                required
              />
            </div>
            <p class="text-[10px] text-on-surface-variant mt-1">
              {{ occupiedBedsCount }} occupied &bull; {{ reservedBedsCount }} reserved
            </p>
          </div>
        </div>

        <!-- Bed Spaces List & Pricing -->
        <div class="space-y-2 pt-1 border-t border-border-card/60">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-on-surface-muted">
              Bed-Spaces in Room {{ editRoomNumber || room?.room_number }}
            </h4>
            <span class="text-[10px] text-on-surface-variant">Adjust individual labels & rates</span>
          </div>

          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div 
              v-for="(bed, idx) in editBeds" 
              :key="bed.id"
              class="p-2.5 rounded-xl border border-border-card bg-surface-dim/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
            >
              <div class="flex items-center gap-2.5 flex-1 min-w-0">
                <span class="w-6 h-6 rounded-lg bg-surface flex items-center justify-center font-bold text-[10px] border border-border-card text-on-surface">
                  {{ String.fromCharCode(65 + idx) }}
                </span>
                <input 
                  v-model="bed.label"
                  type="text"
                  placeholder="Bed Label"
                  class="flex-1 min-w-32 px-2.5 py-1 text-xs rounded-lg border border-border-card bg-surface text-on-surface focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <div class="flex items-center gap-1">
                  <span class="text-[11px] text-on-surface-variant font-data-mono">ZMW</span>
                  <input 
                    v-model.number="bed.rent_amount"
                    type="number"
                    step="50"
                    placeholder="Rent"
                    class="w-20 px-2 py-1 text-xs rounded-lg border border-border-card bg-surface text-on-surface font-data-mono font-bold focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <!-- Status pill -->
                <span 
                  class="badge-pill text-[10px]"
                  :class="{
                    'bg-primary-container text-primary': bed.status === 'occupied',
                    'bg-hatch-diagonal text-tertiary border border-tertiary/30': bed.status === 'reserved',
                    'bg-surface text-on-surface-variant border border-border-card': bed.status === 'vacant'
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="{
                    'bg-primary': bed.status === 'occupied',
                    'bg-tertiary': bed.status === 'reserved',
                    'bg-outline': bed.status === 'vacant'
                  }"></span>
                  <span class="capitalize">{{ bed.status }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger Zone: Delete Room -->
        <div class="p-3.5 rounded-xl border border-error/20 bg-error/5 space-y-2.5">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-bold text-xs text-error flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">warning</span>
                Delete Room
              </p>
              <p class="text-[11px] text-on-surface-variant mt-0.5">
                Permanently delete this room and all its bed-spaces.
              </p>
            </div>
            
            <button 
              v-if="!showDeleteConfirm"
              @click="showDeleteConfirm = true"
              :disabled="hasOccupiedBeds"
              type="button"
              class="btn-pill-outline text-xs text-error border-error/40 hover:bg-error/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              :title="hasOccupiedBeds ? 'Cannot delete room with active tenants' : 'Delete this room'"
            >
              <span class="material-symbols-outlined text-[15px]">delete</span>
              <span>Delete Room</span>
            </button>
          </div>

          <div v-if="hasOccupiedBeds" class="text-[10px] text-error font-medium">
            ⚠️ This room has {{ occupiedBedsCount }} active tenant(s). You must vacate or reassign tenants before deleting.
          </div>

          <!-- Inline Confirmation Dialog -->
          <div v-if="showDeleteConfirm && !hasOccupiedBeds" class="pt-2 border-t border-error/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p class="text-[11px] text-error font-semibold">
              Are you sure? Room {{ room?.room_number }} and its {{ room?.beds?.length }} bed spaces will be permanently deleted.
            </p>
            <div class="flex items-center gap-2 shrink-0">
              <button 
                @click="showDeleteConfirm = false"
                type="button"
                class="btn-pill-outline text-[11px] py-1 px-2.5"
              >
                Cancel
              </button>
              <button 
                @click="handleDelete"
                :disabled="isDeleting"
                type="button"
                class="btn-pill-primary text-[11px] py-1 px-3 bg-error hover:bg-error/90 text-white flex items-center gap-1"
              >
                <span v-if="isDeleting" class="material-symbols-outlined animate-spin text-[14px]">sync</span>
                <span v-else class="material-symbols-outlined text-[14px]">delete_forever</span>
                <span>{{ isDeleting ? 'Deleting...' : 'Confirm Delete' }}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer Action Buttons -->
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/60">
        <button 
          @click="handleClose"
          type="button"
          class="btn-pill-outline text-xs"
        >
          Cancel
        </button>
        <button 
          @click="handleSave"
          :disabled="!editRoomNumber || isSubmitting"
          type="button"
          class="btn-pill-primary text-xs disabled:opacity-50 flex items-center gap-1.5"
        >
          <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
          <span v-else class="material-symbols-outlined text-[16px]">save</span>
          <span>{{ isSubmitting ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
