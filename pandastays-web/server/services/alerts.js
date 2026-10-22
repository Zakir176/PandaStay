/**
 * Operator alerts. Posts a JSON message ({ text }) to ALERT_WEBHOOK_URL
 * (Slack/Discord-compatible incoming webhook, or any endpoint you control).
 * Never throws: alerting must not break payment processing.
 */
export async function sendAlert(message, meta = {}) {
  const url = process.env.ALERT_WEBHOOK_URL
  const text = `[PandaStays ALERT] ${message}`

  if (!url) {
    console.error(`${text} (ALERT_WEBHOOK_URL not set; alert only logged)`, meta)
    return { sent: false, reason: 'no_webhook_configured' }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, content: text, meta }),
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) {
      console.error(`Alert webhook responded ${res.status}`)
      return { sent: false, reason: `http_${res.status}` }
    }
    return { sent: true }
  } catch (err) {
    console.error('Failed to deliver alert:', err.message)
    return { sent: false, reason: 'network_error' }
  }
}

/** Alert for a payment that was paid at the gateway but disagrees with the ledger. */
export function alertNeedsReview({ reference, expectedAmount, receivedAmount, source }) {
  return sendAlert(
    `Payment ${reference} needs review (${source}): expected ${expectedAmount}, gateway reported ${receivedAmount}. Customer has paid; resolve manually.`,
    { reference, expectedAmount, receivedAmount, source }
  )
}
