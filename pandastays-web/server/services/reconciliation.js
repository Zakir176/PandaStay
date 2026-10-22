import { supabase } from '../config/supabase.js'
import { getCollectionByReference, LENCO_MOCK } from './lenco.js'
import { alertNeedsReview } from './alerts.js'

// Max recent successful payments re-checked per run (each costs one Lenco API call).
// Keep bounded; raise deliberately as volume grows.
const recentSuccessCap = () => Math.max(1, Number(process.env.RECONCILE_RECENT_CAP) || 50)

/**
 * Reconcile pending payments and check for reversals against Lenco API
 */
export async function reconcilePayments() {
  if (LENCO_MOCK) {
    console.log('[Reconciliation] Running in mock mode, skipping remote status queries.')
    return { reconciled: 0, skipped: 'mock_mode' }
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  let reconciledCount = 0

  try {
    // 1. Fetch pending payments older than 10 minutes
    const { data: pendingPayments, error: fetchErr } = await supabase
      .from('payments')
      .select('id, amount, gateway_reference, created_at, status')
      .eq('status', 'pending')
      .lte('created_at', tenMinutesAgo)
      .order('created_at', { ascending: true })
      .limit(50)

    if (fetchErr) {
      console.error('[Reconciliation] Error fetching pending payments:', fetchErr)
      return { error: fetchErr.message }
    }

    if (pendingPayments && pendingPayments.length > 0) {
      console.log(`[Reconciliation] Checking ${pendingPayments.length} pending payments older than 10 minutes...`)

      for (const payment of pendingPayments) {
        const ref = payment.gateway_reference
        if (!ref || ref.startsWith('MANUAL-')) {
          continue
        }

        try {
          const collection = await getCollectionByReference(ref)
          if (!collection || !collection.status) {
            // Still unconfirmed / network issue, leave pending
            continue
          }

          const lencoStatus = String(collection.status).toLowerCase()

          if (lencoStatus === 'successful' || lencoStatus === 'success') {
            const payloadAmount = Number(collection.amount)
            const expectedAmount = Number(payment.amount)

            if (isNaN(payloadAmount) || payloadAmount !== expectedAmount) {
              console.error(
                `[Reconciliation] Amount mismatch for payment ${ref}: expected ${expectedAmount}, received ${payloadAmount}. Flagging as needs_review.`
              )
              const { data: flagged } = await supabase
                .from('payments')
                .update({ status: 'needs_review' })
                .eq('id', payment.id)
                .eq('status', 'pending')
                .select('id')
              if (flagged && flagged.length > 0) {
                await alertNeedsReview({ reference: ref, expectedAmount, receivedAmount: payloadAmount, source: 'reconciliation' })
              }
            } else {
              console.log(`[Reconciliation] Marking payment ${ref} as success.`)
              await supabase
                .from('payments')
                .update({ status: 'success' })
                .eq('id', payment.id)
                .eq('status', 'pending')
            }
            reconciledCount++
          } else if (['failed', 'cancelled', 'expired', 'rejected'].includes(lencoStatus)) {
            console.log(`[Reconciliation] Marking payment ${ref} as failed (Lenco status: ${lencoStatus}).`)
            await supabase
              .from('payments')
              .update({ status: 'failed' })
              .eq('id', payment.id)
              .eq('status', 'pending')
            reconciledCount++
          } else if (lencoStatus === 'reversed') {
            console.log(`[Reconciliation] Marking payment ${ref} as reversed.`)
            await supabase
              .from('payments')
              .update({ status: 'reversed' })
              .eq('id', payment.id)
            reconciledCount++
          }
        } catch (err) {
          console.warn(`[Reconciliation] Failed to query reference ${ref}:`, err.message)
        }
      }
    }

    // 2. Check recent successful payments (last 48 hours) for reversals.
    // KNOWN GAP: it is unconfirmed that Lenco's collection-status endpoint ever returns
    // 'reversed'. Until verified in the sandbox, reversal detection may not work; do not
    // assume coverage. Capped at recentSuccessCap() per run (newest first).
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const { data: recentSuccess, error: successErr } = await supabase
      .from('payments')
      .select('id, gateway_reference')
      .eq('status', 'success')
      .gte('created_at', fortyEightHoursAgo)
      .order('created_at', { ascending: false })
      .limit(recentSuccessCap())

    if (!successErr && recentSuccess) {
      for (const payment of recentSuccess) {
        const ref = payment.gateway_reference
        if (!ref || ref.startsWith('MANUAL-')) continue

        try {
          const collection = await getCollectionByReference(ref)
          if (collection?.status && String(collection.status).toLowerCase() === 'reversed') {
            console.warn(`[Reconciliation] Detected reversed payment ${ref}! Updating ledger.`)
            await supabase
              .from('payments')
              .update({ status: 'reversed' })
              .eq('id', payment.id)
            reconciledCount++
          }
        } catch {
          // Ignore network errors during secondary reversal check
        }
      }
    }

    return { reconciled: reconciledCount }
  } catch (err) {
    console.error('[Reconciliation] Unexpected error during reconciliation job:', err)
    return { error: 'Reconciliation failed' }
  }
}

/**
 * Start periodic reconciliation timer.
 * NOTE: runs in-process (setInterval), so the server needs an always-on host
 * (Railway/Render web service); serverless or sleeping free tiers will not run it.
 * @param {number} intervalMs Defaults to 30 minutes (1800000 ms)
 */
export function startReconciliationJob(intervalMs = 30 * 60 * 1000) {
  console.log(`[Reconciliation] Background poller started (interval: ${intervalMs / 1000 / 60}m)`)
  const timer = setInterval(() => {
    reconcilePayments().catch(err => {
      console.error('[Reconciliation] Poller execution error:', err)
    })
  }, intervalMs)

  if (typeof timer.unref === 'function') {
    timer.unref()
  }

  return timer
}
