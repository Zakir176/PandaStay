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

    const reference = `PS-${crypto.randomBytes(8).toString('hex')}`

    // Insert FIRST; fail closed.
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
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
      return res.status(502).json({ success: false, error: 'Payment provider error' })
    }
  } catch (error) {
    console.error('Unhandled momo payment error:', error)
    return res.status(500).json({ success: false, error: error.message })
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

    const refNum = gateway_reference || `MANUAL-${crypto.randomBytes(6).toString('hex')}`

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
      return res.status(500).json({ error: insertError.message })
    }

    return res.status(200).json({ success: true, payment: dbPayment })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

export default router
