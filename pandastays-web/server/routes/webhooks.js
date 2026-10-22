import express from 'express'
import { supabase } from '../config/supabase.js'
import { verifyLencoSignature, getCollectionByReference } from '../services/lenco.js'
import { alertNeedsReview } from '../services/alerts.js'

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
          `CRITICAL: Payment amount mismatch on reference ${reference}: expected ${expectedAmount}, received ${payloadAmount}. Flagging as needs_review.`
        )
        const { data: flagged, error: flagErr } = await supabase
          .from('payments')
          .update({ status: 'needs_review' })
          .eq('id', payment.id)
          .eq('status', 'pending')
          .select('id')

        if (flagErr) {
          console.error('Failed to update payment to needs_review:', flagErr)
          return res.status(500).json({ error: 'Database update failed' })
        }
        if (flagged && flagged.length > 0) {
          await alertNeedsReview({ reference, expectedAmount, receivedAmount: payloadAmount, source: 'webhook' })
        }
        return res.status(200).json({ received: true, note: 'Amount mismatch flagged for review' })
      }

      // Defense-in-depth: verify authoritative status from Lenco API by reference
      try {
        const verifiedCollection = await getCollectionByReference(reference)
        if (verifiedCollection && verifiedCollection.status !== 'successful') {
          console.error(
            `Lenco status re-query did not confirm success for ref ${reference}: status=${verifiedCollection.status}`
          )
          return res.status(200).json({ received: true, note: 'Re-query failed to confirm' })
        }
      } catch (checkErr) {
        // If re-query fails due to network, log warning with reference and proceed with verified signature
        console.warn(`Re-query check warning for reference ${reference}: ${checkErr.message}`)
      }

      // Idempotent update: condition on status = 'pending' to prevent race condition
      const { error: updateError } = await supabase
        .from('payments')
        .update({ status: 'success' })
        .eq('id', payment.id)
        .eq('status', 'pending')

      if (updateError) {
        console.error('Error updating payment in Supabase via webhook:', updateError)
        return res.status(500).json({ error: 'Database update failed' })
      }

      console.log(`Payment reference ${reference} credited successfully in ledger.`)
    } else if (eventType === 'collection.failed') {
      const { error: failErr } = await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)
        .eq('status', 'pending')

      if (failErr) {
        console.error('Error updating failed payment in Supabase:', failErr)
        return res.status(500).json({ error: 'Database update failed' })
      }
      console.log(`Payment reference ${reference} marked failed via webhook.`)
    } else if (eventType === 'collection.settled') {
      console.log(`Payment reference ${reference} settled to landlord sub-account.`)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing Lenco webhook:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
