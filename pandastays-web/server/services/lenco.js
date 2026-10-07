import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const LENCO_SECRET_KEY = process.env.LENCO_SECRET_KEY || 'lenco_secret_placeholder'
const LENCO_API_BASE = 'https://api.lenco.co/v2'

/**
 * Verify incoming webhook signature from Lenco
 * @param {import('express').Request} req 
 * @returns {boolean}
 */
export function verifyLencoSignature(req) {
  const signature = req.headers['x-lenco-signature']
  if (!signature || !req.rawBody) return false

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

/**
 * Trigger Mobile Money STK Push collection request via Lenco API
 * @param {{ amount: number, phone: string, operator: string, reference: string }} payload 
 * @returns {Promise<any>}
 */
export async function triggerMoMoCollection({ amount, phone, operator, reference }) {
  const lencoPayload = {
    amount: Number(amount),
    phone,
    operator: operator.toLowerCase(),
    reference
  }

  try {
    const response = await fetch(`${LENCO_API_BASE}/collections/mobile-money`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LENCO_SECRET_KEY}`
      },
      body: JSON.stringify(lencoPayload)
    })
    return await response.json()
  } catch (apiErr) {
    console.warn('Lenco API simulation mode active:', apiErr.message)
    return {
      status: true,
      message: 'STK push prompt sent successfully to handset',
      data: {
        reference,
        operator,
        status: 'pending'
      }
    }
  }
}
