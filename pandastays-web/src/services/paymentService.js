import { supabase } from '../lib/supabaseClient'

/**
 * Payment & Collections Data Service
 * Handles manual transaction recording and Lenco Mobile Money push integrations.
 */

const API_BASE = 'http://localhost:3001/api'

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
   * Record a verified payment through backend service role endpoint
   */
  async recordPayment({ tenancyId, amount, method = 'momo_mtn', methodLabel = 'MTN MoMo', reference }) {
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
        gateway_reference: reference || `MANUAL-${Date.now().toString().slice(-6)}`
      })
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to record payment on server')
    }
    return data.payment
  },

  /**
   * Trigger Mobile Money STK Push request via Lenco backend
   */
  async triggerMoMoPush({ tenancyId, tenantId, phone, amount, operator }) {
    const res = await fetch(`${API_BASE}/payments/momo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenancy_id: tenancyId,
        tenant_id: tenantId,
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
  }
}
