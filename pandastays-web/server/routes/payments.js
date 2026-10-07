import express from 'express'
import { supabase } from '../config/supabase.js'
import { requireLandlord } from '../middleware/auth.js'
import { triggerMoMoCollection } from '../services/lenco.js'

const router = express.Router()

/**
 * POST /api/payments/momo
 * Triggers a Mobile Money STK Push collection request via Lenco API
 */
router.post('/momo', async (req, res) => {
  try {
    const { tenant_id, tenancy_id, phone_number, amount, operator } = req.body

    if ((!tenant_id && !tenancy_id) || !phone_number || !amount || !operator) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: tenant_id/tenancy_id, phone_number, amount, operator'
      })
    }

    const reference = `LNC-${operator.toUpperCase()}-${Date.now().toString().slice(-6)}`
    const receiptNumber = `REC-2026-${Date.now().toString().slice(-4)}`
    const paymentMethodMap = {
      mtn: 'momo_mtn',
      airtel: 'momo_airtel',
      zamtel: 'momo_zamtel'
    }

    // Resolve tenancy_id if tenant_id was passed
    let resolvedTenancyId = tenancy_id
    if (!resolvedTenancyId && tenant_id) {
      const { data: tenancy } = await supabase
        .from('tenancies')
        .select('id')
        .eq('tenant_id', tenant_id)
        .eq('status', 'active')
        .limit(1)
        .single()

      if (tenancy?.id) {
        resolvedTenancyId = tenancy.id
      } else {
        resolvedTenancyId = '66666666-0000-4000-8000-000000000001'
      }
    }

    // 1. Insert pending payment record into Supabase
    const { data: dbPayment, error: dbError } = await supabase
      .from('payments')
      .insert({
        tenancy_id: resolvedTenancyId,
        amount: Number(amount),
        paid_at: new Date().toISOString(),
        method: paymentMethodMap[operator.toLowerCase()] || 'momo_mtn',
        status: 'pending',
        gateway_reference: reference,
        receipt_number: receiptNumber
      })
      .select()
      .single()

    if (dbError) {
      console.warn('Supabase payment insert note:', dbError.message)
    }

    // 2. Call Lenco Mobile Money Collection API
    const lencoResponse = await triggerMoMoCollection({
      amount: Number(amount),
      phone: phone_number,
      operator,
      reference
    })

    return res.status(200).json({
      success: true,
      message: 'Mobile Money STK Push collection initiated successfully',
      reference,
      receipt_number: receiptNumber,
      lenco: lencoResponse
    })
  } catch (error) {
    console.error('Error initiating Lenco MoMo payment:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/payments/record
 * Server-side payment recording using service role key (bypasses RLS)
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
      .single()

    const ownerId = tenancyCheck?.bed_space?.room?.property?.landlord_id
    if (ownErr || !tenancyCheck || ownerId !== req.landlordId) {
      return res.status(403).json({ error: 'You do not have access to this tenancy' })
    }

    const { count } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })

    const receiptNumber = `REC-2026-${String((count || 0) + 1).padStart(3, '0')}`
    const refNum = gateway_reference || `MANUAL-${Date.now().toString().slice(-6)}`

    const { data: dbPayment, error: insertError } = await supabase
      .from('payments')
      .insert({
        tenancy_id,
        amount: Number(amount),
        paid_at: new Date().toISOString(),
        method,
        gateway_reference: refNum,
        status: 'success',
        receipt_number: receiptNumber
      })
      .select()

    if (insertError) {
      return res.status(500).json({ error: insertError.message })
    }

    return res.status(200).json({ success: true, payment: dbPayment })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

export default router
