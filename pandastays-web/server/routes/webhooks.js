import express from 'express'
import { supabase } from '../config/supabase.js'
import { verifyLencoSignature } from '../services/lenco.js'

const router = express.Router()

/**
 * POST /api/webhooks/lenco
 * Webhook handler for Lenco collection success notifications
 */
router.post('/lenco', async (req, res) => {
  if (!verifyLencoSignature(req)) {
    console.warn('Rejected Lenco webhook: invalid or missing signature')
    return res.status(401).json({ error: 'Invalid signature' })
  }

  try {
    const event = req.body
    console.log('Received Lenco Webhook Event:', JSON.stringify(event))

    const eventType = event?.event || event?.type
    const reference = event?.data?.reference || event?.reference

    if (eventType === 'transaction.successful' || event?.status === 'successful' || event?.status === true) {
      if (reference) {
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update({ status: 'success' })
          .eq('gateway_reference', reference)
          .select()

        if (updateError) {
          console.error('Error updating payment in Supabase via webhook:', updateError)
        } else {
          console.log(`Payment reference ${reference} credited successfully in ledger.`)
        }
      }
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing Lenco webhook:', error)
    return res.status(500).json({ error: error.message })
  }
})

export default router
