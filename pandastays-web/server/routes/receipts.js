import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

/**
 * GET /api/receipts/verify/:token
 * Public, server-side verified receipt lookup
 */
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return res.status(404).json({ verified: false })
  }

  const { data, error } = await supabase
    .from('payments')
    .select(`
      receipt_number, amount, paid_at, method, status,
      tenancy:tenancies (
        tenant:tenants ( name ),
        bed_space:bed_spaces (
          label,
          room:rooms (
            property:properties ( name )
          )
        )
      )
    `)
    .eq('verification_token', token)
    .eq('status', 'success')
    .maybeSingle()

  if (error || !data) {
    return res.status(404).json({ verified: false })
  }

  const name = data.tenancy?.tenant?.name || ''
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0].toUpperCase() + '.')
    .join(' ')

  return res.json({
    verified: true,
    receipt_number: data.receipt_number,
    amount: data.amount,
    currency: 'ZMW',
    paid_at: data.paid_at,
    method: data.method,
    property: data.tenancy?.bed_space?.room?.property?.name,
    bed: data.tenancy?.bed_space?.label,
    payer: initials // initials only, never full name or phone
  })
})

export default router
