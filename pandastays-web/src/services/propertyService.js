import { supabase } from '../lib/supabaseClient'

/**
 * Property & Inventory Data Service
 * Handles CRUD operations for Properties, Rooms, and Bed-Spaces.
 */

export const propertyService = {
  /**
   * Fetch all properties for current landlord
   */
  async getProperties() {
    const { data, error } = await supabase.from('properties').select('*')
    if (error) throw error
    return data || []
  },

  /**
   * Fetch landlord profile by ID
   */
  async getLandlord(landlordId) {
    const { data, error } = await supabase
      .from('landlords')
      .select('*')
      .eq('id', landlordId)
    if (error) throw error
    return data?.[0] || null
  },

  /**
   * Ensure property exists or create default
   */
  async ensureProperty(landlordId, propertyData = { name: 'Mukuba House', address: 'Plot 402, Great East Road, Lusaka' }) {
    const { data: existing } = await supabase
      .from('properties')
      .select('*')
      .eq('landlord_id', landlordId)
      .limit(1)

    if (existing && existing.length > 0) {
      return existing[0]
    }

    const newProperty = {
      id: crypto.randomUUID ? crypto.randomUUID() : `prop-${Date.now()}`,
      landlord_id: landlordId,
      name: propertyData.name || 'Mukuba House',
      address: propertyData.address || 'Plot 402, Great East Road, Lusaka, Zambia'
    }

    const { data: inserted, error } = await supabase
      .from('properties')
      .insert(newProperty)
      .select()
      .single()

    if (error) {
      console.warn('Property insertion note:', error.message)
      return newProperty
    }
    return inserted
  },

  /**
   * Fetch rooms
   */
  async getRooms() {
    const { data, error } = await supabase.from('rooms').select('*')
    if (error) throw error
    return data || []
  },

  /**
   * Fetch bed spaces
   */
  async getBedSpaces() {
    const { data, error } = await supabase.from('bed_spaces').select('*')
    if (error) throw error
    return data || []
  },

  /**
   * Create new room and generate designated bed spaces
   */
  async createRoom({ propertyId, roomNumber, capacity = 2, defaultRent = 2500 }) {
    const roomId = crypto.randomUUID ? crypto.randomUUID() : `room-${Date.now()}`
    
    const { data: dbRoom, error: roomError } = await supabase.from('rooms').insert({
      id: roomId,
      property_id: propertyId,
      room_number: roomNumber,
      capacity: Number(capacity)
    }).select().single()

    if (roomError) throw roomError

    const bedRecords = []
    for (let i = 0; i < capacity; i++) {
      const letter = String.fromCharCode(65 + i)
      const label = `Bed ${roomNumber}-${letter}${i === 0 ? ' (Window)' : ''}`
      const bedId = crypto.randomUUID ? crypto.randomUUID() : `bed-${Date.now()}-${i}`

      bedRecords.push({
        id: bedId,
        room_id: dbRoom?.id || roomId,
        label,
        rent_amount: Number(defaultRent),
        status: 'vacant'
      })
    }

    const { data: dbBeds, error: bedError } = await supabase
      .from('bed_spaces')
      .insert(bedRecords)
      .select()

    if (bedError) throw bedError

    return {
      room: dbRoom,
      beds: dbBeds || bedRecords
    }
  },

  /**
   * Update room capacity, number, and bed specs
   */
  async updateRoom({ roomId, roomNumber, capacity }) {
    const { data, error } = await supabase
      .from('rooms')
      .update({
        room_number: roomNumber,
        capacity: Number(capacity)
      })
      .eq('id', roomId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update bed space label and rent
   */
  async updateBedSpace(bedId, { label, rent_amount }) {
    const { data, error } = await supabase
      .from('bed_spaces')
      .update({ label, rent_amount: Number(rent_amount) })
      .eq('id', bedId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete room and its associated bed spaces
   */
  async deleteRoom(roomId) {
    await supabase.from('bed_spaces').delete().eq('room_id', roomId)
    const { error } = await supabase.from('rooms').delete().eq('id', roomId)
    if (error) throw error
    return true
  }
}
