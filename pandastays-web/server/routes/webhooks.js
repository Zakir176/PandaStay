import express from 'express'
import { supabase } from '../config/supabase.js'
import { verifyLencoSignature, getCollectionByReference } from '../services/lenco.js'

const router = express.Router()

/**
 * POST /api/webhooks/lenco
 * Webhook handler for Lenco collection notifications
 */
router.post('/lenco', async (req, res) => {
  if (!verifyLencoSignature(req)) {
    console.warn('Rejected Lenco webhook: invalid or missing signature')
    return res.status(401).json({ error: 'Invalid signature' })
  }

  try {
    const event = req.body
    const eventType = event?.event || event?.type
    const reference = event?.data?.reference || event?.reference

    // Never log full payload with PII (phone numbers, customer details)
    console.log(`Lenco Webhook received: type=${eventType}, ref=${reference || 'none'}`)

    if (!reference) {
      return res.status(200).json({ received: true, note: 'No reference found in event' })
    }

    // Select payment first; ignore unknown references safely with 200 so Lenco stops retrying
    const { data: payment, error: fetchErr } = await supabase
      .from('payments')
      .select('*')
      .eq('gateway_reference', reference)
      .maybeSingle()

    if (fetchErr || !payment) {
      console.warn(`Webhook received for unknown reference: ${reference}`)
      return res.status(200).json({ received: true, note: 'Payment not found' })
    }

    // Idempotent: ignore if already processed (not pending)
    if (payment.status !== 'pending') {
      console.log(`Webhook replay ignored: payment ${reference} already has status=${payment.status}`)
      return res.status(200).json({ received: true, note: 'Already processed' })
    }

    if (eventType === 'collection.successful') {
      // Validate amount matches ledger
      const payloadAmount = Number(event?.data?.amount)
      const expectedAmount = Number(payment.amount)

      if (isNaN(payloadAmount) || payloadAmount !== expectedAmount) {
        console.error(
          `Payment amount mismatch on reference ${reference}: expected ${expectedAmount}, received ${payloadAmount}`
        )
        // Mark as review_needed / failed instead of blindly crediting success
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', payment.id)
        return res.status(200).json({ received: true, note: 'Amount mismatch' })
      }

      // Defense-in-depth: verify authoritative status from Lenco API by reference
      try {
        const verifiedCollection = await getCollectionByReference(reference)
        if (verifiedCollection && verifiedCollection.status !== 'successful') {
          console.error(
            `Lenco status re-query did not confirm success: status=${verifiedCollection.status}`
          )
          return res.status(200).json({ received: true, note: 'Re-query failed to confirm' })
        }
      } catch (checkErr) {
        console.warn(`Re-query check warning: ${checkErr.message}`)
        // If re-query fails due to network, proceed with verified webhook signature
      }

      const { error: updateError } = await supabase
        .from('payments')
        .update({ status: 'success' })
        .eq('id', payment.id)

      if (updateError) {
        console.error('Error updating payment in Supabase via webhook:', updateError)
      } else {
        console.log(`Payment reference ${reference} credited successfully in ledger.`)
      }
    } else if (eventType === 'collection.failed') {
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)
      console.log(`Payment reference ${reference} marked failed via webhook.`)
    } else if (eventType === 'collection.reversed' || eventType === 'transaction.reversed') {
      await supabase
        .from('payments')
        .update({ status: 'reversed' })
        .eq('id', payment.id)
      console.log(`Payment reference ${reference} marked reversed via webhook.`)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing Lenco webhook:', error)
    return res.status(500).json({ error: error.message })
  }
})

export default router
