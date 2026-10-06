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
    <div class="card-bento w-full max-w-sm p-6 bg-surface-container-lowest shadow-xl space-y-4 border border-outline-variant/60">
      <div class="flex items-center justify-between border-b border-outline-variant/60 pb-3">
        <div>
          <h3 class="font-bold text-lg text-on-surface">Add New Room</h3>
          <p class="text-xs text-on-surface-variant">Initialize room and its bed-space slots.</p>
        </div>
        <button @click="handleClose" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="space-y-3.5">
        <div>
          <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">Room Number / Name</label>
          <input 
            v-model="newRoomNumber"
            type="text" 
            placeholder="e.g. 105 or Annex 1"
            class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none transition-all"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">Capacity (Beds)</label>
            <input 
              v-model="newRoomCapacity"
              type="number" 
              min="1"
              max="8"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono transition-all"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">Rent / Bed (ZMW)</label>
            <input 
              v-model="newRoomBedRent"
              type="number" 
              step="50"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono transition-all"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/60">
        <button 
          @click="handleClose"
          class="btn-pill-outline text-xs"
        >
          Cancel
        </button>
        <button 
          @click="createRoom"
          :disabled="!newRoomNumber || isSubmitting"
          class="btn-pill-primary text-xs disabled:opacity-50 flex items-center gap-1.5"
        >
          <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
          <span>{{ isSubmitting ? 'Creating...' : 'Create Room' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
