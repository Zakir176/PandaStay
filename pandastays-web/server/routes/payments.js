import express from 'express'
import crypto from 'crypto'
import { supabase } from '../config/supabase.js'
import { requireUser, requireLandlord } from '../middleware/auth.js'
import { triggerMoMoCollection } from '../services/lenco.js'

const router = express.Router()

const methodMap = {
  mtn: 'momo_mtn',
  airtel: 'momo_airtel',
  zamtel: 'momo_zamtel'
}

export const ALLOWED_PAYMENT_METHODS = ['momo_mtn', 'momo_airtel', 'momo_zamtel', 'card', 'bank_transfer', 'cash']

/**
 * Prefix and sanitize a client-provided reference so a manual payment can never
 * collide with (or impersonate) a real Lenco reference. Always starts with MANUAL-.
 */
export function buildManualReference(clientRef) {
  const cleanClientRef = (clientRef || '')
    .replace(/^MANUAL-/i, '')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 32)

  return cleanClientRef
    ? `MANUAL-${cleanClientRef}-${crypto.randomBytes(4).toString('hex')}`
    : `MANUAL-${crypto.randomBytes(8).toString('hex')}`
}

/**
 * POST /api/payments/momo
 * Triggers a Mobile Money STK Push collection request via Lenco API
 * Authenticated: caller must be the tenant of this tenancy OR the landlord who owns it.
 */
router.post('/momo', requireUser, async (req, res) => {
  try {
    const { tenancy_id, phone_number, amount, operator } = req.body

    if (!tenancy_id || !phone_number || !operator) {
      return res.status(400).json({ success: false, error: 'Missing parameters' })
    }

    const cleanPhone = phone_number.replace(/\s/g, '')
    if (!/^(?:\+?260|0)?(?:95|96|97|75|76|77)\d{7}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'Invalid Zambian mobile number' })
    }

    const opKey = operator.toLowerCase()
    const method = methodMap[opKey]
    if (!method) {
      return res.status(400).json({ success: false, error: 'Unsupported mobile operator' })
    }

    // Caller must be the tenant on this tenancy OR the landlord who owns it
    const { data: t, error: fetchErr } = await supabase
      .from('tenancies')
      .select(`
        id, rent_amount, status,
        tenant:tenants ( auth_user_id ),
        bed_space:bed_spaces ( room:rooms ( property:properties ( landlord_id ) ) )
      `)
      .eq('id', tenancy_id)
      .maybeSingle()

    if (fetchErr || !t) {
      return res.status(403).json({ success: false, error: 'Not allowed for this tenancy' })
    }

    const isTenant = t.tenant?.auth_user_id === req.userId
    const isLandlord = t.bed_space?.room?.property?.landlord_id === req.userId
    if (t.status !== 'active' || (!isTenant && !isLandlord)) {
      return res.status(403).json({ success: false, error: 'Not allowed for this tenancy' })
    }

    const value = Number(amount)
    if (!(value > 0) || value > Number(t.rent_amount)) {
      return res.status(400).json({ success: false, error: 'Invalid amount' })
    }

    // Prevent duplicate STK pushes: reject if a pending payment exists in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: recentPending, error: pendingCheckErr } = await supabase
      .from('payments')
      .select('id, created_at')
      .eq('tenancy_id', tenancy_id)
      .eq('status', 'pending')
      .gte('created_at', fiveMinutesAgo)
      .limit(1)

    if (recentPending && recentPending.length > 0) {
      return res.status(429).json({
        success: false,
        error: 'A payment is already pending for this tenancy. Please complete the prompt on your phone or wait a few minutes before retrying.'
      })
    }

    const reference = `PS-${crypto.randomBytes(8).toString('hex')}`

    // Insert pending payment FIRST (fail closed)
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .insert({
        tenancy_id,
        amount: value,
        method,
        status: 'pending',
        gateway_reference: reference,
        paid_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError || !payment) {
      console.error('Failed to create pending payment record:', dbError)
      return res.status(500).json({ success: false, error: 'Could not start payment' })
    }

    try {
      const lenco = await triggerMoMoCollection({
        amount: value,
        phone: cleanPhone,
        operator: opKey,
        reference
      })

      return res.json({
        success: true,
        reference,
        receipt_number: payment.receipt_number,
        verification_token: payment.verification_token,
        lenco
      })
    } catch (e) {
      console.error('Payment provider initiation failed:', e)
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
      return res.status(502).json({ success: false, error: 'Payment provider error' })
    }
  } catch (error) {
    console.error('Unhandled momo payment error:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * POST /api/payments/record
 * Server-side payment recording using service role key (bypasses RLS).
 * Landlord-only endpoint.
 */
router.post('/record', requireLandlord, async (req, res) => {
  try {
    const {
      tenancy_id,
      method = 'momo_mtn',
      method_label = 'MTN MoMo',
      gateway_reference,
      amount
    } = req.body

    if (!tenancy_id || !amount) {
      return res.status(400).json({ error: 'tenancy_id and amount are required' })
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({ error: 'Invalid payment method' })
    }

    const value = Number(amount)
    if (!(value > 0)) {
      return res.status(400).json({ error: 'Amount must be greater than 0' })
    }

    // Verify the calling landlord actually owns this tenancy's property chain
    const { data: tenancyCheck, error: ownErr } = await supabase
      .from('tenancies')
      .select(`
        id,
        bed_space:bed_spaces (
          room:rooms (
            property:properties ( landlord_id )
          )
        )
      `)
      .eq('id', tenancy_id)
      .maybeSingle()

    const ownerId = tenancyCheck?.bed_space?.room?.property?.landlord_id
    if (ownErr || !tenancyCheck || ownerId !== req.landlordId) {
      return res.status(403).json({ error: 'You do not have access to this tenancy' })
    }

    const refNum = buildManualReference(gateway_reference)

    const { data: dbPayment, error: insertError } = await supabase
      .from('payments')
      .insert({
        tenancy_id,
        amount: value,
        paid_at: new Date().toISOString(),
        method,
        gateway_reference: refNum,
        status: 'success'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting manual payment:', insertError)
      return res.status(500).json({ error: 'Failed to record payment' })
    }

    return res.status(200).json({ success: true, payment: dbPayment })
  } catch (error) {
    console.error('Record payment error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
