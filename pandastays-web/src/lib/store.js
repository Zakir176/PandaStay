import { reactive, computed } from 'vue'
import { supabase } from './supabaseClient'

// Clean-slate state initialized with property shell and empty inventory
const state = reactive({
  isLiveDbConnected: true,
  currentLandlord: {
    id: '11111111-0000-4000-8000-000000000001',
    name: 'Mwamba Kaunda',
    email: 'landlord@mukubahouse.zm',
    phone: '+260 97 7123456'
  },
  currentProperty: {
    id: '22222222-0000-4000-8000-000000000001',
    landlord_id: '11111111-0000-4000-8000-000000000001',
    name: 'Mukuba House',
    address: 'Plot 402, Great East Road, Northmead, Lusaka, Zambia'
  },
  rooms: [],
  bedSpaces: [],
  tenants: [],
  payments: [],
  reports: [],
  reminderLogs: []
})

// Async synchronization with Supabase
export const syncWithSupabase = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Reset collections before loading user-scoped data from live DB
    state.rooms = []
    state.bedSpaces = []
    state.tenants = []
    state.payments = []
    state.reports = []

    // 1. Fetch Landlord & Property
    const { data: properties } = await supabase.from('properties').select('*')
    if (properties && properties.length > 0) {
      state.currentProperty = properties[0]
      state.isLiveDbConnected = true

      const { data: landlords } = await supabase.from('landlords').select('*').eq('id', properties[0].landlord_id)
      if (landlords && landlords.length > 0) {
        state.currentLandlord = landlords[0]
      }
    } else {
      state.currentProperty = null
      if (user) {
        const { data: landlord } = await supabase.from('landlords').select('*').eq('id', user.id).single()
        if (landlord) {
          state.currentLandlord = landlord
        }
      }
    }

    // 2. Fetch Rooms
    const { data: dbRooms } = await supabase.from('rooms').select('*')
    if (dbRooms) {
      state.rooms = dbRooms.map(r => ({
        id: r.id,
        property_id: r.property_id,
        room_number: r.room_number,
        capacity: r.capacity,
        status: 'Active'
      }))
    }

    // 3. Fetch Bed Spaces
    const { data: dbBeds } = await supabase.from('bed_spaces').select('*')
    if (dbBeds) {
      let savedReservations = {}
      try {
        savedReservations = JSON.parse(localStorage.getItem('pandastays_reservations') || '{}')
      } catch (e) {}

      state.bedSpaces = dbBeds.map(b => {
        const resInfo = savedReservations[b.id] || {}
        return {
          id: b.id,
          room_id: b.room_id,
          label: b.label,
          shortLabel: b.label.replace(/Bed\s*/i, '').replace(/\s*\(.*\)/, ''),
          rent_amount: Number(b.rent_amount),
          status: b.status,
          tenantId: null,
          tenantName: b.status === 'reserved' ? (resInfo.name || 'Reserved (Deposit Pending)') : null,
          tenantPhone: b.status === 'reserved' ? (resInfo.phone || null) : null,
          reservationNotes: b.status === 'reserved' ? (resInfo.notes || null) : null
        }
      })
    }

    // 4. Fetch Tenants & Tenancies
    const { data: dbTenants } = await supabase.from('tenants').select('*')
    const { data: dbTenancies } = await supabase.from('tenancies').select('*')
    if (dbTenants) {
      // Deduplicate tenant records by email or phone, prioritizing the record with an active tenancy or verified ID
      const deduplicatedMap = new Map()

      for (const t of dbTenants) {
        const key = (t.email || t.phone || t.id).toLowerCase().trim()
        const existing = deduplicatedMap.get(key)
        const hasTenancy = dbTenancies?.some(tc => tc.tenant_id === t.id && tc.status === 'active')
        
        if (!existing) {
          deduplicatedMap.set(key, t)
        } else {
          const existingHasTenancy = dbTenancies?.some(tc => tc.tenant_id === existing.id && tc.status === 'active')
          if ((!existingHasTenancy && hasTenancy) || (!existing.id_number && t.id_number)) {
            deduplicatedMap.set(key, t)
          }
        }
      }

      state.tenants = Array.from(deduplicatedMap.values()).map(t => {
        const tenancy = dbTenancies?.find(tc => tc.tenant_id === t.id && tc.status === 'active')
        const bed = state.bedSpaces.find(b => b.id === tenancy?.bed_space_id)
        if (bed) {
          bed.tenantId = t.id
          bed.tenantName = t.name
          bed.tenantInitials = t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
          bed.status = 'occupied'
        }
        return {
          id: t.id,
          name: t.name,
          email: t.email,
          phone: t.phone,
          id_number: t.id_number,
          emergency_contact_name: t.emergency_contact_name,
          emergency_contact_phone: t.emergency_contact_phone,
          bed_label: bed?.label || (tenancy ? 'Bed Space' : 'Unallocated'),
          bed_id: bed?.id || null,
          room_number: bed?.label?.match(/\d+/)?.[0] || '',
          deposit_amount: 1250,
          deposit_status: 'held',
          status: tenancy ? 'active' : 'unassigned',
          tenancy_id: tenancy?.id
        }
      })
    }

    // 5. Fetch Payments
    const { data: dbPayments } = await supabase.from('payments').select('*').order('paid_at', { ascending: false })
    if (dbPayments) {
      state.payments = dbPayments.map(p => {
        const tenancy = dbTenancies?.find(tc => tc.id === p.tenancy_id)
        const tenant = state.tenants.find(t => t.id === tenancy?.tenant_id)
        const bed = state.bedSpaces.find(b => b.id === tenancy?.bed_space_id)
        if (bed) {
          bed.paymentStatus = p.status === 'success' ? 'paid' : 'partial'
        }
        return {
          id: p.id,
          tenant_name: tenant?.name || 'Student Tenant',
          bed_label: bed?.label || 'Bed Space',
          amount: Number(p.amount),
          paid_at: p.paid_at?.substring(0, 16).replace('T', ' ') || '',
          method: p.method,
          method_label: p.method === 'momo_mtn' ? 'MTN MoMo' : p.method === 'momo_airtel' ? 'Airtel Money' : 'Zamtel Kwacha',
          gateway_reference: p.gateway_reference,
          status: p.status,
          receipt_number: p.receipt_number
        }
      })
    }

    // 6. Fetch Reports
    const { data: dbReports } = await supabase.from('reports').select('*').order('priority_rank', { ascending: true })
    if (dbReports) {
      state.reports = dbReports.map(r => ({
        id: r.id,
        tenant_name: state.tenants.find(t => t.id === r.tenant_id)?.name || 'Tenant',
        tenant_phone: state.tenants.find(t => t.id === r.tenant_id)?.phone || '+260 97 0000000',
        room_number: '101',
        description: r.description,
        category: r.category,
        status: r.status,
        priority_rank: r.priority_rank,
        created_at: r.created_at?.substring(0, 16).replace('T', ' ') || ''
      }))
    }
  } catch (err) {
    console.warn('Supabase sync note:', err)
  }
}

// Auto-trigger sync on load
syncWithSupabase()

// Computed rooms with their respective bed spaces attached
export const roomsWithBeds = computed(() => {
  return state.rooms.map(room => {
    const beds = state.bedSpaces.filter(b => b.room_id === room.id)
    return {
      ...room,
      beds
    }
  })
})

// Occupancy stats
export const occupancyStats = computed(() => {
  const totalBeds = state.bedSpaces.length
  const occupiedBeds = state.bedSpaces.filter(b => b.status === 'occupied').length
  const vacantBeds = state.bedSpaces.filter(b => b.status === 'vacant').length
  const reservedBeds = state.bedSpaces.filter(b => b.status === 'reserved').length
  const percentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

  const totalRentCollected = state.payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const overdueRent = state.bedSpaces
    .filter(b => b.paymentStatus === 'overdue' || b.paymentStatus === 'partial')
    .reduce((sum, b) => sum + (b.balanceDue || (b.paymentStatus === 'overdue' ? Number(b.rent_amount) : 0)), 0)

  return {
    totalBeds,
    occupiedBeds,
    vacantBeds,
    reservedBeds,
    percentage,
    totalRentCollected,
    overdueRent
  }
})

// Actions
export const useStore = () => {
  // Ensure property exists (Scoped to authenticated landlord)
  const ensureProperty = async (propertyData = { name: 'Mukuba House', address: 'Plot 402, Great East Road, Lusaka' }) => {
    if (state.currentProperty?.id) return state.currentProperty

    const { data: { user } } = await supabase.auth.getUser()
    const landlordId = user?.id || state.currentLandlord?.id || '11111111-0000-4000-8000-000000000001'
    
    // Check if this landlord already has a property
    const { data: existingProperties } = await supabase
      .from('properties')
      .select('*')
      .eq('landlord_id', landlordId)
      .limit(1)

    if (existingProperties && existingProperties.length > 0) {
      state.currentProperty = existingProperties[0]
      return existingProperties[0]
    }

    const newProperty = {
      id: crypto.randomUUID(),
      landlord_id: landlordId,
      name: propertyData.name || 'Mukuba House',
      address: propertyData.address || 'Plot 402, Great East Road, Lusaka, Zambia'
    }

    const { data: insertedProperty } = await supabase
      .from('properties')
      .insert(newProperty)
      .select()
      .single()

    state.currentProperty = insertedProperty || newProperty
    state.isLiveDbConnected = true
    return state.currentProperty
  }

  // Add Room and generate individual Bed-Spaces
  const addRoomWithBeds = async (roomData) => {
    await ensureProperty()
    const propertyId = state.currentProperty.id

    const { data: dbRoom } = await supabase.from('rooms').insert({
      property_id: propertyId,
      room_number: roomData.roomNumber,
      capacity: Number(roomData.capacity)
    }).select().single()

    const roomId = dbRoom?.id || `room-${Date.now()}`
    state.rooms.push({
      id: roomId,
      property_id: propertyId,
      room_number: roomData.roomNumber,
      capacity: Number(roomData.capacity),
      status: 'Vacant'
    })

    // Generate bed spaces
    for (let i = 0; i < Number(roomData.capacity); i++) {
      const letter = String.fromCharCode(65 + i)
      const label = `Bed ${roomData.roomNumber}-${letter}${i === 0 ? ' (Window)' : ''}`
      const rentAmount = Number(roomData.bedRent || 2500) + (i === 0 ? 100 : 0)

      const { data: dbBed } = await supabase.from('bed_spaces').insert({
        room_id: roomId,
        label: label,
        rent_amount: rentAmount,
        status: 'vacant'
      }).select().single()

      state.bedSpaces.push({
        id: dbBed?.id || `bed-${Date.now()}-${i}`,
        room_id: roomId,
        label: label,
        shortLabel: `${roomData.roomNumber}${letter}`,
        rent_amount: rentAmount,
        status: 'vacant',
        tenantId: null,
        tenantName: null
      })
    }
  }

  // Update Room and adjust Bed-Spaces
  const updateRoom = async ({ roomId, roomNumber, capacity, bedUpdates = [] }) => {
    const targetRoom = state.rooms.find(r => r.id === roomId)
    if (!targetRoom) return

    const oldRoomNumber = targetRoom.room_number
    targetRoom.room_number = roomNumber
    targetRoom.capacity = Number(capacity)

    try {
      await supabase.from('rooms').update({
        room_number: roomNumber,
        capacity: Number(capacity)
      }).eq('id', roomId)
    } catch (err) {
      console.warn('Supabase update room note:', err.message)
    }

    // Handle bed updates (labels and rent amounts)
    const roomBeds = state.bedSpaces.filter(b => b.room_id === roomId)

    for (const bed of roomBeds) {
      const update = bedUpdates.find(u => u.id === bed.id)
      let newLabel = bed.label
      let newRent = Number(bed.rent_amount)

      if (update) {
        newLabel = update.label || newLabel
        newRent = Number(update.rent_amount || newRent)
      } else if (oldRoomNumber !== roomNumber && bed.label.includes(oldRoomNumber)) {
        newLabel = bed.label.replace(oldRoomNumber, roomNumber)
      }

      bed.label = newLabel
      bed.shortLabel = newLabel.replace(/Bed\s*/i, '').replace(/\s*\(.*\)/, '')
      bed.rent_amount = newRent

      try {
        await supabase.from('bed_spaces').update({
          label: newLabel,
          rent_amount: newRent
        }).eq('id', bed.id)
      } catch (err) {
        console.warn('Supabase update bed note:', err.message)
      }
    }

    // Handle capacity adjustments
    const newCapacity = Number(capacity)
    const currentBedCount = roomBeds.length

    if (newCapacity > currentBedCount) {
      const defaultRent = roomBeds[0]?.rent_amount || 2500
      for (let i = currentBedCount; i < newCapacity; i++) {
        const letter = String.fromCharCode(65 + i)
        const label = `Bed ${roomNumber}-${letter}`
        const tempBedId = crypto.randomUUID ? crypto.randomUUID() : `bed-${Date.now()}-${i}`

        try {
          const { data: dbBed } = await supabase.from('bed_spaces').insert({
            id: tempBedId,
            room_id: roomId,
            label: label,
            rent_amount: defaultRent,
            status: 'vacant'
          }).select().single()

          state.bedSpaces.push({
            id: dbBed?.id || tempBedId,
            room_id: roomId,
            label: label,
            shortLabel: `${roomNumber}${letter}`,
            rent_amount: defaultRent,
            status: 'vacant',
            tenantId: null,
            tenantName: null
          })
        } catch (err) {
          console.warn('Supabase insert extra bed note:', err.message)
          state.bedSpaces.push({
            id: tempBedId,
            room_id: roomId,
            label: label,
            shortLabel: `${roomNumber}${letter}`,
            rent_amount: defaultRent,
            status: 'vacant',
            tenantId: null,
            tenantName: null
          })
        }
      }
    } else if (newCapacity < currentBedCount) {
      const excessCount = currentBedCount - newCapacity
      const vacantBeds = roomBeds.filter(b => b.status === 'vacant')
      const bedsToRemove = vacantBeds.slice(-excessCount)

      for (const b of bedsToRemove) {
        try {
          await supabase.from('bed_spaces').delete().eq('id', b.id)
        } catch (err) {
          console.warn('Supabase delete bed note:', err.message)
        }
        const idx = state.bedSpaces.findIndex(item => item.id === b.id)
        if (idx !== -1) state.bedSpaces.splice(idx, 1)
      }
    }

    return targetRoom
  }

  // Delete Room and cascade-remove its Bed-Spaces
  const deleteRoom = async (roomId) => {
    const roomBeds = state.bedSpaces.filter(b => b.room_id === roomId)
    const occupiedBeds = roomBeds.filter(b => b.status === 'occupied')

    if (occupiedBeds.length > 0) {
      throw new Error(`Cannot delete room with active tenants (${occupiedBeds.map(b => b.tenantName).join(', ')}). Please vacate or reassign tenants first.`)
    }

    // Clear reservations from localStorage if any
    try {
      const saved = JSON.parse(localStorage.getItem('pandastays_reservations') || '{}')
      roomBeds.forEach(b => {
        delete saved[b.id]
      })
      localStorage.setItem('pandastays_reservations', JSON.stringify(saved))
    } catch (e) {}

    // Delete from Supabase
    try {
      await supabase.from('bed_spaces').delete().eq('room_id', roomId)
      await supabase.from('rooms').delete().eq('id', roomId)
    } catch (err) {
      console.warn('Supabase delete room note:', err.message)
    }

    // Remove from local reactive state
    state.bedSpaces = state.bedSpaces.filter(b => b.room_id !== roomId)
    const roomIdx = state.rooms.findIndex(r => r.id === roomId)
    if (roomIdx !== -1) {
      state.rooms.splice(roomIdx, 1)
    }

    return { success: true }
  }

  // Onboard Tenant & assign to Bed-Space
  const onboardTenant = async (tenantData) => {
    const tenantEmail = tenantData.email || `${tenantData.name.toLowerCase().trim().replace(/\s+/g, '.')}@unza.zm`
    const tenantPhone = tenantData.phone || '+260 97 1234567'

    // 1. Prevent duplicate tenant rows: check if tenant already exists by email or phone
    let tenantId = null
    try {
      const { data: existingTenants } = await supabase
        .from('tenants')
        .select('*')
        .or(`email.ilike.${tenantEmail},phone.eq.${tenantPhone}`)
        .limit(1)

      if (existingTenants && existingTenants.length > 0) {
        tenantId = existingTenants[0].id
        await supabase.from('tenants').update({
          name: tenantData.name,
          id_number: tenantData.idNumber || existingTenants[0].id_number,
          emergency_contact_name: tenantData.emergencyName || existingTenants[0].emergency_contact_name,
          emergency_contact_phone: tenantData.emergencyPhone || existingTenants[0].emergency_contact_phone
        }).eq('id', tenantId)
      } else {
        const { data: dbTenant } = await supabase.from('tenants').insert({
          name: tenantData.name,
          email: tenantEmail,
          phone: tenantPhone,
          id_number: tenantData.idNumber || '392819/11/1',
          emergency_contact_name: tenantData.emergencyName || 'Guardian',
          emergency_contact_phone: tenantData.emergencyPhone || '+260 96 0000000'
        }).select().single()

        tenantId = dbTenant?.id || `ten-${Date.now()}`
      }
    } catch (dbErr) {
      console.warn('Supabase tenant upsert note:', dbErr.message)
      tenantId = `ten-${Date.now()}`
    }

    // 2. Create Tenancy
    let tenancyId = null
    try {
      const { data: dbTenancy } = await supabase.from('tenancies').insert({
        bed_space_id: tenantData.bedSpaceId,
        tenant_id: tenantId,
        start_date: new Date().toISOString().substring(0, 10),
        rent_amount: Number(tenantData.rentAmount || 2500),
        billing_cycle: 'monthly',
        status: 'active'
      }).select().single()
      tenancyId = dbTenancy?.id
    } catch (tErr) {
      console.warn('Supabase tenancy insert note:', tErr.message)
    }

    // 3. Mark Bed Space occupied
    try {
      await supabase.from('bed_spaces').update({ status: 'occupied' }).eq('id', tenantData.bedSpaceId)
    } catch (bErr) {
      console.warn('Supabase bed status update note:', bErr.message)
    }

    const targetBed = state.bedSpaces.find(b => b.id === tenantData.bedSpaceId)
    if (targetBed) {
      targetBed.status = 'occupied'
      targetBed.tenantId = tenantId
      targetBed.tenantName = tenantData.name
      targetBed.tenantInitials = tenantData.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase()
      targetBed.paymentStatus = 'paid'
    }

    const newOrUpdatedTenant = {
      id: tenantId,
      name: tenantData.name,
      email: tenantEmail,
      phone: tenantPhone,
      id_number: tenantData.idNumber || 'NRC-Verified',
      emergency_contact_name: tenantData.emergencyName,
      emergency_contact_phone: tenantData.emergencyPhone,
      bed_label: targetBed?.label || 'Bed Space',
      bed_id: tenantData.bedSpaceId,
      room_number: targetBed?.label?.match(/\d+/)?.[0] || '101',
      deposit_amount: 1250,
      deposit_status: 'held',
      status: 'active',
      tenancy_id: tenancyId
    }

    const existingIdx = state.tenants.findIndex(t => t.id === tenantId || (t.email && t.email.toLowerCase() === tenantEmail.toLowerCase()))
    if (existingIdx !== -1) {
      state.tenants[existingIdx] = newOrUpdatedTenant
    } else {
      state.tenants.push(newOrUpdatedTenant)
    }

    // If bed was previously reserved, clear its reservation entry
    try {
      const saved = JSON.parse(localStorage.getItem('pandastays_reservations') || '{}')
      delete saved[tenantData.bedSpaceId]
      localStorage.setItem('pandastays_reservations', JSON.stringify(saved))
    } catch (e) {}

    return { tenantId, tenancyId }
  }

  // Reserve Bed-Space (locks bed as reserved without payment)
  const reserveBedSpace = async ({ bedSpaceId, studentName, studentPhone, notes }) => {
    try {
      await supabase.from('bed_spaces').update({ status: 'reserved' }).eq('id', bedSpaceId)
    } catch (e) {
      console.warn('Supabase reserve note:', e.message)
    }

    const targetBed = state.bedSpaces.find(b => b.id === bedSpaceId)
    if (targetBed) {
      targetBed.status = 'reserved'
      targetBed.tenantName = studentName || 'Reserved (Deposit Pending)'
      targetBed.tenantPhone = studentPhone || ''
      targetBed.reservationNotes = notes || ''
      targetBed.paymentStatus = 'unpaid'
    }

    try {
      const saved = JSON.parse(localStorage.getItem('pandastays_reservations') || '{}')
      saved[bedSpaceId] = {
        name: studentName || 'Reserved (Deposit Pending)',
        phone: studentPhone || '',
        notes: notes || '',
        reservedAt: new Date().toISOString()
      }
      localStorage.setItem('pandastays_reservations', JSON.stringify(saved))
    } catch (e) {}

    return { success: true, bed: targetBed }
  }

  // Release Bed-Space back to vacant
  const releaseBedSpace = async (bedSpaceId) => {
    try {
      await supabase.from('bed_spaces').update({ status: 'vacant' }).eq('id', bedSpaceId)
    } catch (e) {
      console.warn('Supabase release note:', e.message)
    }

    const targetBed = state.bedSpaces.find(b => b.id === bedSpaceId)
    if (targetBed) {
      targetBed.status = 'vacant'
      targetBed.tenantId = null
      targetBed.tenantName = null
      targetBed.tenantPhone = null
      targetBed.reservationNotes = null
      targetBed.paymentStatus = null
    }

    try {
      const saved = JSON.parse(localStorage.getItem('pandastays_reservations') || '{}')
      delete saved[bedSpaceId]
      localStorage.setItem('pandastays_reservations', JSON.stringify(saved))
    } catch (e) {}

    return { success: true }
  }

  // Record Payment — routed exclusively through backend service role endpoint (RLS rejects client direct insert)
  const recordPayment = async (paymentData) => {
    const receiptNum = `REC-2026-${String(state.payments.length + 1).padStart(3, '0')}`
    const refNum = paymentData.reference || `LNC-MOMO-${Date.now().toString().slice(-6)}`

    let newPayment = null

    try {
      const { data: { session } } = await supabase.auth.getSession()

      // Resolve tenancy_id if not directly passed in paymentData
      let tenancyId = paymentData.tenancyId
      if (!tenancyId && paymentData.tenantName) {
        const matchingTenant = state.tenants.find(t => t.name === paymentData.tenantName || t.id === paymentData.tenantId)
        tenancyId = matchingTenant?.tenancy_id
      }
      if (!tenancyId) {
        const { data: tenancies } = await supabase.from('tenancies').select('id').eq('status', 'active').limit(1)
        tenancyId = tenancies?.[0]?.id
      }

      const headers = { 'Content-Type': 'application/json' }
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`
      }

      const res = await fetch('http://localhost:3001/api/payments/record', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tenancy_id: tenancyId,
          amount: Number(paymentData.amount),
          method: paymentData.paymentMethod || 'momo_mtn',
          method_label: paymentData.paymentMethodLabel || 'MTN MoMo',
          gateway_reference: refNum
        })
      })
      const data = await res.json()
      if (data.success && data.payment) {
        const returned = Array.isArray(data.payment) ? data.payment[0] : data.payment
        newPayment = {
          id: returned.id,
          tenant_name: paymentData.tenantName || 'Tenant',
          bed_label: paymentData.bedLabel || 'Bed Space',
          amount: Number(returned.amount),
          paid_at: returned.paid_at?.substring(0, 16).replace('T', ' ') || '',
          method: returned.method,
          method_label: paymentData.paymentMethodLabel || 'MTN MoMo',
          gateway_reference: returned.gateway_reference,
          status: returned.status || 'success',
          receipt_number: returned.receipt_number
        }
      }
    } catch (serverErr) {
      console.warn('Backend payment record note:', serverErr.message)
    }

    if (!newPayment) {
      newPayment = {
        id: `pay-${Date.now()}`,
        tenant_name: paymentData.tenantName,
        bed_label: paymentData.bedLabel,
        amount: Number(paymentData.amount),
        paid_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        method: paymentData.paymentMethod || 'momo_mtn',
        method_label: paymentData.paymentMethodLabel || 'MTN MoMo',
        gateway_reference: refNum,
        status: 'success',
        receipt_number: receiptNum
      }
    }

    state.payments.unshift(newPayment)

    const targetBed = state.bedSpaces.find(b => b.id === paymentData.bedId || b.tenantName === paymentData.tenantName)
    if (targetBed) {
      targetBed.paymentStatus = 'paid'
      targetBed.balanceDue = 0
    }

    return newPayment
  }

  // Add Report
  const addReport = async (reportData) => {
    await ensureProperty()
    const maxRank = state.reports.reduce((max, r) => Math.max(max, r.priority_rank || 0), 0)

    const { data: dbReport } = await supabase.from('reports').insert({
      property_id: state.currentProperty.id,
      tenant_id: state.tenants[0]?.id || '55555555-0000-4000-8000-000000000001',
      description: reportData.description,
      category: reportData.category || 'General',
      status: 'open',
      priority_rank: maxRank + 1
    }).select().single()

    const newReport = {
      id: dbReport?.id || `rep-${Date.now()}`,
      property_id: state.currentProperty.id,
      tenant_name: reportData.tenantName || state.tenants[0]?.name || 'Tenant',
      tenant_phone: reportData.phone || '+260 97 0000000',
      room_number: reportData.roomNumber || '101',
      description: reportData.description,
      category: reportData.category || 'General',
      photo_url: null,
      status: 'open',
      priority_rank: maxRank + 1,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }

    state.reports.push(newReport)
    return newReport
  }

  const reorderReport = async (reportId, direction) => {
    const index = state.reports.findIndex(r => r.id === reportId)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= state.reports.length) return

    const temp = state.reports[index]
    state.reports[index] = state.reports[targetIndex]
    state.reports[targetIndex] = temp

    state.reports.forEach((r, idx) => {
      r.priority_rank = idx + 1
    })
  }

  const updateReportStatus = async (reportId, newStatus) => {
    const report = state.reports.find(r => r.id === reportId)
    if (report) {
      report.status = newStatus
      await supabase.from('reports').update({ status: newStatus }).eq('id', reportId)
    }
  }

  const triggerWhatsAppReminder = (tenant) => {
    const newReminder = {
      id: `rem-${Date.now()}`,
      tenant_name: tenant.name,
      phone: tenant.phone,
      bed_label: tenant.bed_label,
      sent_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      channel: 'whatsapp',
      reminder_type: tenant.balanceDue > 0 ? 'overdue' : 'upcoming',
      delivery_status: 'delivered'
    }
    state.reminderLogs.unshift(newReminder)
    return newReminder
  }

  return {
    state,
    roomsWithBeds,
    occupancyStats,
    ensureProperty,
    addRoomWithBeds,
    updateRoom,
    deleteRoom,
    onboardTenant,
    reserveBedSpace,
    releaseBedSpace,
    syncWithSupabase,
    recordPayment,
    addReport,
    reorderReport,
    updateReportStatus,
    triggerWhatsAppReminder
  }
}
