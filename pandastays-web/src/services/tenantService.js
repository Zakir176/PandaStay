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
   * Validate + normalize tenant input. Name, email and phone are required;
   * NRC and emergency contact are optional and stored as NULL when blank.
   * Throws an Error with a user-facing message on invalid input.
   */
  normalizeTenantInput({ name, email, phone, idNumber, emergencyName, emergencyPhone }) {
    const clean = (v) => (typeof v === 'string' ? v.trim() : '')
    const orNull = (v) => clean(v) || null

    const cleanName = clean(name)
    const normalizedEmail = clean(email).toLowerCase()
    const cleanPhone = clean(phone)

    if (!cleanName) throw new Error('Tenant name is required.')
    if (!normalizedEmail) throw new Error('Tenant email is required.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new Error('Enter a valid tenant email address.')
    if (!cleanPhone) throw new Error('Tenant phone number is required.')

    return {
      name: cleanName,
      email: normalizedEmail,
      phone: cleanPhone,
      id_number: orNull(idNumber),
      emergency_contact_name: orNull(emergencyName),
      emergency_contact_phone: orNull(emergencyPhone)
    }
  },

  /**
   * Find a tenant row visible to this landlord by exact normalized email,
   * or create a new one. A matched row is reused as-is (its id) and never updated.
   * No phone matching, no filter-string interpolation.
   */
  async findOrCreateTenant(input) {
    const fields = this.normalizeTenantInput(input)

    const { data: existing, error: lookupErr } = await supabase
      .from('tenants')
      .select('id')
      .eq('email', fields.email)
      .limit(1)
    if (lookupErr) throw lookupErr

    if (existing && existing.length > 0) {
      return { tenantId: existing[0].id, created: false, fields }
    }

    // Client-generated id: the landlord SELECT policy only exposes a tenant once a
    // tenancy exists, so INSERT ... RETURNING would be rejected by RLS.
    const tenantId = crypto.randomUUID()
    const { error: createErr } = await supabase.from('tenants').insert({ id: tenantId, ...fields })
    if (createErr) throw createErr

    return { tenantId, created: true, fields }
  },

  /**
   * Onboard a tenant and create their tenancy agreement.
   * Throws on any database error; nothing is invented locally.
   */
  async onboardTenant({
    name,
    email,
    phone,
    idNumber,
    emergencyName,
    emergencyPhone,
    bedSpaceId,
    rentAmount,
    startDate = new Date().toISOString().substring(0, 10),
    billingCycle = 'monthly'
  }) {
    if (!bedSpaceId) throw new Error('A bed space is required.')
    if (!(Number(rentAmount) > 0)) throw new Error('A valid rent amount is required.')

    // 1. Tenant (validated, normalized, reused only on exact email match)
    const { tenantId, fields } = await this.findOrCreateTenant({
      name, email, phone, idNumber, emergencyName, emergencyPhone
    })

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
    const { error: bedErr } = await supabase.from('bed_spaces').update({ status: 'occupied' }).eq('id', bedSpaceId)
    if (bedErr) throw bedErr

    return {
      tenantId,
      tenancyId: tenancy.id,
      tenancy,
      tenant: fields
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
