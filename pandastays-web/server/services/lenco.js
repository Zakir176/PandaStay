import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

// Fail closed by default; dev behavior is strictly opt-in
const isDev = process.env.NODE_ENV === 'development'
const LENCO_SECRET_KEY = process.env.LENCO_SECRET_KEY || ''
// Documented base URL: https://lenco-api.readme.io/v2.0/reference
const LENCO_API_BASE = process.env.LENCO_API_BASE || 'https://api.lenco.co/access/v2'

// Explicit, opt-in mock mode only in development when explicitly enabled
export const LENCO_MOCK = isDev && process.env.LENCO_MOCK === 'true'

export class LencoError extends Error {}

/**
 * Verify incoming webhook signature from Lenco.
 * X-Lenco-Signature = HMAC-SHA512(payload, SHA256(apiToken)).
 * Checks against both rawBody buffer and canonical JSON string to tolerate formatting differences.
 * @param {import('express').Request} req
 * @returns {boolean}
 */
export function verifyLencoSignature(req) {
  if (!LENCO_SECRET_KEY) return false // never verify against a placeholder in any environment
  const signature = req.headers['x-lenco-signature']
  if (typeof signature !== 'string') return false

  const webhookHashKey = crypto.createHash('sha256').update(LENCO_SECRET_KEY).digest('hex')
  const sigBuf = Buffer.from(signature, 'utf8')

  // Collect candidate payload buffers to test against signature
  const candidates = []
  if (req.rawBody && req.rawBody.length > 0) {
    candidates.push(req.rawBody)
  }
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    candidates.push(Buffer.from(JSON.stringify(req.body), 'utf8'))
  }

  for (const candidate of candidates) {
    const expectedSignature = crypto
      .createHmac('sha512', webhookHashKey)
      .update(candidate)
      .digest('hex')

    const expectedBuf = Buffer.from(expectedSignature, 'utf8')
    if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return true
    }
  }

  return false
}

async function lencoFetch(path, init = {}) {
  if (!LENCO_SECRET_KEY) throw new LencoError('Lenco is not configured')

  let response
  try {
    response = await fetch(`${LENCO_API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LENCO_SECRET_KEY}`,
        ...(init.headers || {})
      },
      signal: AbortSignal.timeout(15000)
    })
  } catch (err) {
    throw new LencoError(`Lenco unreachable: ${err.message}`)
  }

  let body = null
  try { body = await response.json() } catch { /* non-JSON */ }

  if (!response.ok || body?.status !== true) {
    throw new LencoError(`Lenco ${path} failed (HTTP ${response.status}): ${body?.message || 'no message'}`)
  }
  return body
}

/**
 * Normalise to Lenco's expected MSISDN format (260XXXXXXXXX).
 */
export function normaliseZambianPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.startsWith('260')) return digits
  if (digits.startsWith('0')) return `260${digits.slice(1)}`
  return `260${digits}`
}

/**
 * Trigger Mobile Money collection (STK/USSD push) via Lenco.
 * Throws LencoError on any failure. Callers must treat a throw as "not initiated".
 * @param {{ amount: number, phone: string, operator: string, reference: string }} payload
 */
export async function triggerMoMoCollection({ amount, phone, operator, reference }) {
  const payload = {
    amount: Number(amount),
    phone: normaliseZambianPhone(phone),
    operator: operator.toLowerCase(),
    country: 'zm',
    bearer: process.env.LENCO_FEE_BEARER || 'merchant',
    reference
  }

  if (LENCO_MOCK) {
    return { status: true, message: 'MOCK: collection initiated', data: { reference, status: 'pay-offline' } }
  }

  return lencoFetch('/collections/mobile-money', { method: 'POST', body: JSON.stringify(payload) })
}

/**
 * Fetch authoritative collection state by our reference.
 * GET /collections/status/:reference
 * @returns {Promise<{ status: string, amount: string, currency: string, reference: string } | null>}
 */
export async function getCollectionByReference(reference) {
  if (LENCO_MOCK) return null // caller must treat null as "unconfirmed"
  const body = await lencoFetch(`/collections/status/${encodeURIComponent(reference)}`)
  return body?.data || null
}
