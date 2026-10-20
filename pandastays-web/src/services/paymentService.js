import { supabase } from '../lib/supabaseClient'

/**
 * Payment & Collections Data Service
 * Handles manual transaction recording and Lenco Mobile Money push integrations.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export const paymentService = {
  /**
   * Fetch all recorded payments ordered by most recent
   */
  async getPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('paid_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  /**
   * Record a verified payment through backend service role endpoint (Landlord only)
   */
  async recordPayment({ tenancyId, amount, method = 'momo_mtn', methodLabel = 'MTN MoMo', reference }) {
    if (!tenancyId) {
      throw new Error('tenancyId is required to record a payment')
    }

    const { data: { session } } = await supabase.auth.getSession()
    const headers = { 'Content-Type': 'application/json' }
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }

    const res = await fetch(`${API_BASE}/payments/record`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tenancy_id: tenancyId,
        amount: Number(amount),
        method,
        method_label: methodLabel,
        gateway_reference: reference
      })
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to record payment on server')
    }
    return data.payment
  },

  /**
   * Trigger Mobile Money STK Push request via Lenco backend (Authenticated)
   */
  async triggerMoMoPush({ tenancyId, phone, amount, operator }) {
    if (!tenancyId) {
      throw new Error('tenancyId is required to initiate payment')
    }

    const { data: { session } } = await supabase.auth.getSession()
    const headers = { 'Content-Type': 'application/json' }
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }

    const res = await fetch(`${API_BASE}/payments/momo`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tenancy_id: tenancyId,
        phone_number: phone,
        amount: Number(amount),
        operator: operator.toLowerCase()
      })
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to initiate Mobile Money push')
    }
    return data
  },

  /**
   * Public receipt verification endpoint
   */
  async verifyReceipt(token) {
    if (!token) return { verified: false }
    try {
      const res = await fetch(`${API_BASE}/receipts/verify/${encodeURIComponent(token)}`)
      if (!res.ok) {
        return { verified: false }
      }
      return await res.json()
    } catch {
      return { verified: false }
    }
  }
}
