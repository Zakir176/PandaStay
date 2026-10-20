import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const LENCO_SECRET_KEY = process.env.LENCO_SECRET_KEY || (process.env.NODE_ENV === 'production' ? '' : 'lenco_secret_placeholder')
// Documented base URL: https://lenco-api.readme.io/v2.0/reference
const LENCO_API_BASE = process.env.LENCO_API_BASE || 'https://api.lenco.co/access/v2'

// Explicit, opt-in mock mode for local development only. Never inferred from errors.
export const LENCO_MOCK = process.env.LENCO_MOCK === 'true' || (!process.env.LENCO_SECRET_KEY && process.env.NODE_ENV !== 'production')

if (!LENCO_SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.warn('LENCO_SECRET_KEY is not set: MoMo collections and webhooks are disabled (fail closed).')
}

export class LencoError extends Error {}

/**
 * Verify incoming webhook signature from Lenco.
 * X-Lenco-Signature = HMAC-SHA512(rawBody, SHA256(apiToken)).
 * @param {import('express').Request} req
 * @returns {boolean}
 */
export function verifyLencoSignature(req) {
  if (!LENCO_SECRET_KEY) return false // never verify against a guessable placeholder
  const signature = req.headers['x-lenco-signature']
  if (typeof signature !== 'string' || !req.rawBody) return false

  const webhookHashKey = crypto.createHash('sha256').update(LENCO_SECRET_KEY).digest('hex')
  const expectedSignature = crypto
    .createHmac('sha512', webhookHashKey)
    .update(req.rawBody)
    .digest('hex')

  const sigBuf = Buffer.from(signature, 'utf8')
  const expectedBuf = Buffer.from(expectedSignature, 'utf8')
  if (sigBuf.length !== expectedBuf.length) return false
  return crypto.timingSafeEqual(sigBuf, expectedBuf)
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
    bearer: 'merchant',
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
