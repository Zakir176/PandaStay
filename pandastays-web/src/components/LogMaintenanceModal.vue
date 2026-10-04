<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../lib/store'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  rooms: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'reportCreated'])

const { state, addReport } = useStore()

const newReportForm = ref({
  tenantName: '',
  phone: '',
  roomNumber: '101',
  category: 'Plumbing',
  description: ''
})

const isSubmitting = ref(false)

const availableRooms = computed(() => {
  if (props.rooms && props.rooms.length > 0) {
    return props.rooms.map(r => r.room_number || r)
  }
  if (state.rooms && state.rooms.length > 0) {
    return state.rooms.map(r => r.room_number)
  }
  return ['101', '102', '103', '104']
})

const handleClose = () => {
  newReportForm.value = {
    tenantName: '',
    phone: '',
    roomNumber: availableRooms.value[0] || '101',
    category: 'Plumbing',
    description: ''
  }
  emit('close')
}

const submitNewReport = async () => {
  if (!newReportForm.value.description) return

  isSubmitting.value = true
  try {
    const report = await addReport(newReportForm.value)
    emit('reportCreated', report)
    handleClose()
  } catch (err) {
    console.error('Failed to submit maintenance report:', err)
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
    <div class="card-tight w-full max-w-md p-6 bg-surface-container-lowest shadow-lg space-y-4">
      <div class="flex items-center justify-between border-b border-outline-variant pb-3">
        <h3 class="font-bold text-lg text-on-surface">Log Maintenance Report</h3>
        <button @click="handleClose" class="text-on-surface-variant hover:text-on-surface">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Room Number</label>
            <select 
              v-model="newReportForm.roomNumber"
              class="w-full h-10 px-3 bg-surface-container-low border border-outline rounded-sm text-on-surface text-sm focus:border-primary focus:outline-none"
            >
              <option v-for="rNum in availableRooms" :key="rNum" :value="rNum">
                Room {{ rNum }}
              </option>
              <option value="Shared Bathroom">Shared Bathroom</option>
              <option value="Communal Kitchen">Communal Kitchen</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Category</label>
            <select 
              v-model="newReportForm.category"
              class="w-full h-10 px-3 bg-surface-container-low border border-outline rounded-sm text-on-surface text-sm focus:border-primary focus:outline-none"
            >
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Furniture">Furniture</option>
              <option value="Security/Locks">Security/Locks</option>
              <option value="Wi-Fi">Wi-Fi & Internet</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Tenant Name (Reporter)</label>
          <input 
            v-model="newReportForm.tenantName"
            type="text" 
            placeholder="e.g. John Phiri"
            class="w-full px-3 py-2 text-sm rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Issue Description</label>
          <textarea 
            v-model="newReportForm.description"
            rows="3" 
            placeholder="Detailed explanation of the defect or issue..."
            class="w-full px-3 py-2 text-sm rounded-sm border border-outline bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
          ></textarea>
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
          @click="submitNewReport"
          :disabled="!newReportForm.description || isSubmitting"
          class="px-4 py-2 text-xs font-semibold bg-primary text-on-primary rounded-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
        >
          <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
          <span>{{ isSubmitting ? 'Submitting...' : 'Submit Ticket' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
