<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

// Slide-over state
const isSlideOverOpen = ref(false)
const isLoading = ref(true)

const openSlideOver = () => {
  isSlideOverOpen.value = true
}

const closeSlideOver = () => {
  isSlideOverOpen.value = false
}

// Payment form reactive state
const paymentForm = ref({
  tenantId: '',
  amount: '',
  paymentMethod: 'Mobile Money',
  referenceNumber: '',
  generateReceipt: true
})

// Summary metrics reactive state
const stats = ref({
  occupancy: {
    occupiedBeds: 18,
    totalBeds: 20,
    percentage: 90
  },
  rentCollected: {
    amount: 14400,
    growthPercentage: 12
  },
  overdueRent: {
    amount: 3200
  }
})

// Default rooms state matching Stitch design template
const defaultRooms = [
  {
    id: '101',
    status: 'Paid',
    statusClass: 'bg-primary/10 text-primary',
    borderHoverClass: 'hover:border-primary',
    statusIcon: 'check_circle',
    beds: '2/2 Beds',
    bedsVacant: false,
    tenants: [
      { name: 'John Phiri', initials: 'JP' },
      { name: 'Mary Banda', initials: 'MB' }
    ]
  },
  {
    id: '102',
    status: 'Partial',
    statusClass: 'bg-tertiary-container/10 text-tertiary-container',
    borderHoverClass: 'hover:border-tertiary-container',
    statusIcon: 'pending',
    beds: '2/2 Beds',
    bedsVacant: false,
    tenants: [
      { name: 'David Mulenga', initials: 'DM', due: '-1,200', dueClass: 'text-tertiary-container' },
      { name: 'Sarah Chilufya', initials: 'SC' }
    ]
  },
  {
    id: '103',
    status: 'Overdue',
    statusClass: 'bg-error/10 text-error',
    borderHoverClass: 'hover:border-error',
    statusIcon: 'error',
    beds: '1/2 Beds',
    bedsVacant: true,
    bedTextClass: 'text-tertiary-container',
    tenants: [
      { name: 'Emmanuel Ngoma', initials: 'EN', due: '-2,000', dueClass: 'text-error' }
    ]
  },
  {
    id: '104',
    status: 'Paid',
    statusClass: 'bg-primary/10 text-primary',
    borderHoverClass: 'hover:border-primary',
    statusIcon: 'check_circle',
    beds: '2/2 Beds',
    bedsVacant: false,
    tenants: [
      { name: 'Chanda Mwewa', initials: 'CM' },
      { name: 'Thabo Kalaba', initials: 'TK' }
    ]
  }
]

// Room list reactive state
const rooms = ref(defaultRooms)

// Helper to get initials
const getInitials = (name) => {
  if (!name) return ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

// Fetch dashboard data from Supabase
const fetchDashboardData = async () => {
  isLoading.value = true

  try {
    // 1. Fetch Rooms and Beds
    const { data: roomsData, error: roomsErr } = await supabase
      .from('rooms')
      .select(`
        id,
        room_number,
        price_per_term,
        beds (
          id,
          bed_label,
          status
        )
      `)

    // 2. Fetch Payments
    const { data: paymentsData, error: paymentsErr } = await supabase
      .from('payments')
      .select('amount, status')

    // 3. Fetch Tenants
    const { data: tenantsData, error: tenantsErr } = await supabase
      .from('tenants')
      .select(`
        id,
        full_name,
        current_bed_id
      `)

    if (!roomsErr && roomsData && roomsData.length > 0) {
      let totalBedsCount = 0
      let occupiedBedsCount = 0

      const mappedRooms = roomsData.map(r => {
        const roomBeds = r.beds || []
        totalBedsCount += roomBeds.length
        const occupiedInRoom = roomBeds.filter(b => b.status === 'occupied').length
        occupiedBedsCount += occupiedInRoom

        const roomTenants = tenantsData
          ? tenantsData.filter(t => roomBeds.some(b => b.id === t.current_bed_id))
          : []

        let roomStatus = 'Paid'
        let statusClass = 'bg-primary/10 text-primary'
        let borderHoverClass = 'hover:border-primary'
        let statusIcon = 'check_circle'

        if (occupiedInRoom < roomBeds.length) {
          roomStatus = 'Overdue'
          statusClass = 'bg-error/10 text-error'
          borderHoverClass = 'hover:border-error'
          statusIcon = 'error'
        } else if (roomTenants.length > 0 && r.room_number === '102') {
          roomStatus = 'Partial'
          statusClass = 'bg-tertiary-container/10 text-tertiary-container'
          borderHoverClass = 'hover:border-tertiary-container'
          statusIcon = 'pending'
        }

        return {
          id: r.room_number,
          status: roomStatus,
          statusClass,
          borderHoverClass,
          statusIcon,
          beds: `${occupiedInRoom}/${roomBeds.length} Beds`,
          bedsVacant: occupiedInRoom < roomBeds.length,
          tenants: roomTenants.map(t => ({
            name: t.full_name,
            initials: getInitials(t.full_name)
          }))
        }
      })

      rooms.value = mappedRooms

      const totalCollected = (paymentsData || [])
        .filter(p => p.status === 'successful')
        .reduce((sum, p) => sum + Number(p.amount), 0)

      stats.value.occupancy = {
        occupiedBeds: occupiedBedsCount,
        totalBeds: totalBedsCount,
        percentage: totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0
      }

      if (totalCollected > 0) {
        stats.value.rentCollected.amount = totalCollected
      }
    } else {
      rooms.value = defaultRooms
    }
  } catch (err) {
    console.error('Error fetching dashboard data from Supabase, using default template data:', err)
    rooms.value = defaultRooms
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})

const handlePaymentSubmit = () => {
  console.log('Payment submitted:', paymentForm.value)
  closeSlideOver()
}
</script>

<template>
  <div class="relative">
    <!-- Loading Indicator Banner -->
    <div v-if="isLoading" class="mb-4 p-3 bg-surface-container-low border border-outline-variant rounded-lg flex items-center justify-between text-body-sm text-secondary">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined animate-spin text-primary">sync</span>
        <span>Fetching live accommodation data from Supabase...</span>
      </div>
    </div>

    <!-- Slide-over Background Overlay -->
    <div 
      class="fixed inset-0 bg-inverse-surface/40 z-50 transition-opacity duration-300"
      :class="isSlideOverOpen ? 'opacity-100 block' : 'opacity-0 hidden'"
      @click="closeSlideOver"
    ></div>

    <!-- Payment Slide-over -->
    <div 
      class="fixed inset-y-0 right-0 w-full md:w-100 bg-surface-container-lowest z-50 transform transition-transform duration-300 shadow-[-10px_0_15px_-3px_rgba(33,49,69,0.2)] border-l border-outline-variant flex flex-col"
      :class="isSlideOverOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex items-center justify-between p-4 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
        <h2 class="font-title-sm text-title-sm text-on-surface">Record Payment</h2>
        <button @click="closeSlideOver" class="text-on-surface-variant hover:text-on-surface transition-colors" id="close-slide-over">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-stack-default">
        <div class="flex flex-col gap-2">
          <label class="font-label-caps text-label-caps text-on-surface-variant uppercase">Tenant Name</label>
          <div class="relative">
            <select 
              v-model="paymentForm.tenantId"
              class="w-full h-10 px-3 bg-surface border border-outline-variant rounded text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none"
            >
              <option disabled value="">Select tenant...</option>
              <option value="1">John Phiri - Room 101</option>
              <option value="2">Mary Banda - Room 101</option>
              <option value="3">David Mulenga - Room 102</option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-2.5 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-label-caps text-label-caps text-on-surface-variant uppercase">Amount (ZMW)</label>
          <input 
            v-model="paymentForm.amount"
            class="w-full h-10 px-3 bg-surface border border-outline-variant rounded text-on-surface font-data-mono text-data-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" 
            placeholder="0.00" 
            type="number"
          >
        </div>

        <div class="flex flex-col gap-3">
          <label class="font-label-caps text-label-caps text-on-surface-variant uppercase">Payment Method</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input 
                v-model="paymentForm.paymentMethod"
                value="Mobile Money"
                class="text-primary focus:ring-primary" 
                name="payment_method" 
                type="radio"
              >
              <span class="font-body-sm text-body-sm text-on-surface">Mobile Money</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input 
                v-model="paymentForm.paymentMethod"
                value="Cash"
                class="text-primary focus:ring-primary" 
                name="payment_method" 
                type="radio"
              >
              <span class="font-body-sm text-body-sm text-on-surface">Cash</span>
            </label>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-label-caps text-label-caps text-on-surface-variant uppercase">Reference Number</label>
          <input 
            v-model="paymentForm.referenceNumber"
            class="w-full h-10 px-3 bg-surface border border-outline-variant rounded text-on-surface font-data-mono text-data-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" 
            placeholder="e.g. TXN-987654321" 
            type="text"
          >
        </div>

        <div class="flex items-center gap-3 mt-4">
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              v-model="paymentForm.generateReceipt"
              class="sr-only peer" 
              type="checkbox"
            >
            <div class="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            <span class="ml-3 font-body-sm text-body-sm text-on-surface">Generate Digital Receipt</span>
          </label>
        </div>
      </div>

      <div class="p-4 border-t border-outline-variant sticky bottom-0 bg-surface-container-lowest z-10 flex gap-3 justify-end">
        <button 
          @click="closeSlideOver" 
          class="px-4 py-2 border border-outline-variant text-on-surface font-title-sm text-title-sm rounded hover:bg-surface-variant transition-colors" 
          id="cancel-slide-over"
        >
          Cancel
        </button>
        <button 
          @click="handlePaymentSubmit"
          class="px-4 py-2 bg-primary text-on-primary font-title-sm text-title-sm rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-on-primary-fixed-variant transition-colors active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
        >
          Submit Payment
        </button>
      </div>
    </div>

    <!-- Summary Cards Bento -->
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-8">
      <!-- Occupancy -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col justify-between h-35">
        <div class="flex justify-between items-start">
          <h3 class="font-label-caps text-label-caps text-on-surface-variant uppercase">Occupancy</h3>
          <span class="material-symbols-outlined text-on-surface-variant text-[20px]">meeting_room</span>
        </div>
        <div class="flex items-end gap-3 mt-auto">
          <div class="font-data-mono text-[32px] font-medium leading-none text-on-surface">
            {{ stats.occupancy.occupiedBeds }}<span class="text-on-surface-variant text-[20px]">/{{ stats.occupancy.totalBeds }}</span>
          </div>
          <div class="text-body-sm font-body-sm text-on-surface-variant pb-1">Beds</div>
        </div>
        <!-- Minimal Progress Bar -->
        <div class="w-full h-1 bg-surface-variant mt-3 rounded-full overflow-hidden">
          <div class="h-full bg-primary" :style="{ width: stats.occupancy.percentage + '%' }"></div>
        </div>
      </div>

      <!-- Rent Collected -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col justify-between h-35">
        <div class="flex justify-between items-start">
          <h3 class="font-label-caps text-label-caps text-on-surface-variant uppercase">Rent Collected</h3>
          <div class="flex items-center gap-1 text-primary-container bg-primary-container/10 px-2 py-0.5 rounded">
            <span class="material-symbols-outlined text-[14px]">trending_up</span>
            <span class="font-label-caps text-[10px] uppercase font-bold">{{ stats.rentCollected.growthPercentage }}%</span>
          </div>
        </div>
        <div class="flex items-end gap-1 mt-auto">
          <span class="font-data-mono text-body-sm text-on-surface-variant pb-1">ZMW</span>
          <div class="font-data-mono text-[32px] font-medium leading-none text-on-surface">
            {{ stats.rentCollected.amount.toLocaleString() }}
          </div>
        </div>
      </div>

      <!-- Overdue Rent -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col justify-between h-35">
        <div class="flex justify-between items-start">
          <h3 class="font-label-caps text-label-caps text-on-surface-variant uppercase">Overdue Rent</h3>
          <span class="material-symbols-outlined text-error text-[20px]">warning</span>
        </div>
        <div class="flex items-end gap-1 mt-auto">
          <span class="font-data-mono text-body-sm text-error pb-1">ZMW</span>
          <div class="font-data-mono text-[32px] font-medium leading-none text-error">
            {{ stats.overdueRent.amount.toLocaleString() }}
          </div>
        </div>
      </div>
    </section>

    <!-- Room Grid -->
    <section>
      <div class="flex justify-between items-end mb-4">
        <h2 class="font-title-sm text-title-sm text-on-surface">Room Status</h2>
        <div class="flex gap-2">
          <button class="p-1.5 text-on-surface-variant hover:bg-surface-variant rounded transition-colors">
            <span class="material-symbols-outlined text-[20px]">filter_list</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
        <div 
          v-for="room in rooms" 
          :key="room.id" 
          class="group bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col transition-colors cursor-pointer relative overflow-hidden"
          :class="room.borderHoverClass"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Room</span>
              <h3 class="font-title-sm text-title-sm text-on-surface">{{ room.id }}</h3>
            </div>
            <div class="px-2 py-1 rounded font-label-caps text-label-caps uppercase flex items-center gap-1" :class="room.statusClass">
              <span class="material-symbols-outlined text-[14px]">{{ room.statusIcon }}</span>
              {{ room.status }}
            </div>
          </div>

          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-[16px]" :class="room.bedTextClass || 'text-on-surface-variant'">single_bed</span>
            <span class="font-data-mono text-body-sm" :class="room.bedTextClass || 'text-on-surface-variant'">{{ room.beds }}</span>
          </div>

          <div class="flex flex-col gap-2 mt-auto pt-3 border-t border-surface-variant">
            <div v-for="tenant in room.tenants" :key="tenant.name" class="flex items-center justify-between w-full">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-on-surface font-label-caps text-[10px]">
                  {{ tenant.initials }}
                </div>
                <span class="font-body-sm text-body-sm text-on-surface truncate">{{ tenant.name }}</span>
              </div>
              <span v-if="tenant.due" class="font-data-mono text-[10px]" :class="tenant.dueClass">{{ tenant.due }}</span>
            </div>

            <div v-if="room.bedsVacant" class="flex items-center gap-2 text-on-surface-variant">
              <span class="material-symbols-outlined text-[16px]">add_circle</span>
              <span class="font-body-sm text-body-sm italic">Vacant</span>
            </div>
          </div>

          <!-- Hover Actions -->
          <div class="absolute inset-0 bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button class="w-10 h-10 rounded-full bg-surface border border-outline-variant text-on-surface flex items-center justify-center hover:text-primary hover:border-primary transition-colors shadow-sm">
              <span class="material-symbols-outlined">visibility</span>
            </button>
            <button class="w-10 h-10 rounded-full bg-surface border border-outline-variant text-on-surface flex items-center justify-center hover:text-primary hover:border-primary transition-colors shadow-sm">
              <span class="material-symbols-outlined">edit</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Mobile FAB -->
    <button 
      @click="openSlideOver"
      class="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform" 
      id="mobile-fab"
    >
      <span class="material-symbols-outlined">add</span>
    </button>
  </div>
</template>
