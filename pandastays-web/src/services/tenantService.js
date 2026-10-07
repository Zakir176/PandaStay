import { supabase } from '../lib/supabaseClient'

/**
 * Tenant & Tenancy Data Service
 * Handles onboarding, reservations, and lease allocations.
 */

export const tenantService = {
  /**
   * Fetch all tenants
   */
  async getTenants() {
    const { data, error } = await supabase.from('tenants').select('*')
    if (error) throw error
    return data || []
  },

  /**
   * Fetch all active tenancies
   */
  async getTenancies() {
    const { data, error } = await supabase.from('tenancies').select('*')
    if (error) throw error
    return data || []
  },

  /**
   * Onboard or update a tenant and create their tenancy agreement
   */
  async onboardTenant({
    name,
    email,
    phone,
    idNumber,
    emergencyName,
    emergencyPhone,
    bedSpaceId,
    rentAmount = 2500,
    startDate = new Date().toISOString().substring(0, 10),
    billingCycle = 'monthly'
  }) {
    const tenantEmail = email || `${name.toLowerCase().trim().replace(/\s+/g, '.')}@unza.zm`
    const tenantPhone = phone || '+260 97 1234567'

    // 1. Collision check: find existing tenant record
    let tenantId = null
    const { data: existing } = await supabase
      .from('tenants')
      .select('*')
      .or(`email.ilike.${tenantEmail},phone.eq.${tenantPhone}`)
      .limit(1)

    if (existing && existing.length > 0) {
      tenantId = existing[0].id
      await supabase.from('tenants').update({
        name,
        id_number: idNumber || existing[0].id_number,
        emergency_contact_name: emergencyName || existing[0].emergency_contact_name,
        emergency_contact_phone: emergencyPhone || existing[0].emergency_contact_phone
      }).eq('id', tenantId)
    } else {
      const { data: created, error: createErr } = await supabase.from('tenants').insert({
        name,
        email: tenantEmail,
        phone: tenantPhone,
        id_number: idNumber || '392819/11/1',
        emergency_contact_name: emergencyName || 'Guardian',
        emergency_contact_phone: emergencyPhone || '+260 96 0000000'
      }).select().single()

      if (createErr) throw createErr
      tenantId = created.id
    }

    // 2. Create Tenancy
    const { data: tenancy, error: tenancyErr } = await supabase.from('tenancies').insert({
      bed_space_id: bedSpaceId,
      tenant_id: tenantId,
      start_date: startDate,
      rent_amount: Number(rentAmount),
      billing_cycle: billingCycle,
      status: 'active'
    }).select().single()

    if (tenancyErr) throw tenancyErr

    // 3. Mark Bed Space occupied
    await supabase.from('bed_spaces').update({ status: 'occupied' }).eq('id', bedSpaceId)

    return {
      tenantId,
      tenancyId: tenancy.id,
      tenancy
    }
  },

  /**
   * Reserve bed space
   */
  async reserveBed(bedSpaceId) {
    const { error } = await supabase
      .from('bed_spaces')
      .update({ status: 'reserved' })
      .eq('id', bedSpaceId)
    if (error) throw error
    return true
  },

  /**
   * Release bed space back to vacant
   */
  async releaseBed(bedSpaceId) {
    const { error } = await supabase
      .from('bed_spaces')
      .update({ status: 'vacant' })
      .eq('id', bedSpaceId)
    if (error) throw error
    return true
  }
}
