<script setup>
import { ref } from 'vue'
import { useStore } from '../lib/store'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'roomCreated'])

const { addRoomWithBeds } = useStore()

const newRoomNumber = ref('')
const newRoomCapacity = ref(2)
const newRoomBedRent = ref(2500)
const isSubmitting = ref(false)

const handleClose = () => {
  newRoomNumber.value = ''
  newRoomCapacity.value = 2
  newRoomBedRent.value = 2500
  emit('close')
}

const createRoom = async () => {
  if (!newRoomNumber.value) return
  isSubmitting.value = true
  try {
    const room = await addRoomWithBeds({
      roomNumber: newRoomNumber.value,
      capacity: newRoomCapacity.value,
      bedRent: newRoomBedRent.value
    })
    emit('roomCreated', room)
    handleClose()
  } catch (err) {
    console.error('Failed to create room:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-xs"
  >
    <div class="card-tight w-full max-w-sm p-6 bg-surface-container-lowest shadow-lg space-y-4">
      <div class="flex items-center justify-between border-b border-outline-variant pb-3">
        <h3 class="font-bold text-lg text-on-surface">Add New Room</h3>
        <button @click="handleClose" class="text-on-surface-variant hover:text-on-surface">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Room Number / Name</label>
          <input 
            v-model="newRoomNumber"
            type="text" 
            placeholder="e.g. 105 or Annex 1"
            class="w-full px-3 py-2 text-sm rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Capacity (Beds)</label>
            <input 
              v-model="newRoomCapacity"
              type="number" 
              min="1"
              max="8"
              class="w-full px-3 py-2 text-sm rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Rent / Bed (ZMW)</label>
            <input 
              v-model="newRoomBedRent"
              type="number" 
              step="50"
              class="w-full px-3 py-2 text-sm rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
        <button 
          @click="handleClose"
          class="px-4 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface"
        >
          Cancel
        </button>
        <button 
          @click="createRoom"
          :disabled="!newRoomNumber || isSubmitting"
          class="px-4 py-2 text-xs font-semibold bg-primary text-on-primary rounded-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
        >
          <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
          <span>{{ isSubmitting ? 'Creating...' : 'Create Room & Bed-Spaces' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
