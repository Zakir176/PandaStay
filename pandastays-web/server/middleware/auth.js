import { supabase, supabaseAuthClient } from '../config/supabase.js'

function bearer(req) {
  const authHeader = req.headers.authorization || ''
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
}

/**
 * Middleware: any valid Supabase session. Sets req.userId.
 */
export async function requireUser(req, res, next) {
  const token = bearer(req)
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization bearer token' })
  }

  const { data, error } = await supabaseAuthClient.auth.getUser(token)
  const user = data?.user
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  req.userId = user.id
  next()
}

/**
 * Middleware: valid session AND the caller has a landlords row.
 * Role is derived from the database, never from user-editable user_metadata.
 * Sets req.userId and req.landlordId.
 */
export async function requireLandlord(req, res, next) {
  await requireUser(req, res, async () => {
    const { data: landlord } = await supabase
      .from('landlords')
      .select('id')
      .eq('id', req.userId)
      .maybeSingle()

    if (!landlord) {
      return res.status(403).json({ error: 'Landlord account required' })
    }

    req.landlordId = req.userId
    next()
  })
}
