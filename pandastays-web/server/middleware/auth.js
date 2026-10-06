import { supabaseAuthClient } from '../config/supabase.js'

/**
 * Middleware: Verify landlord authorization token
 */
export async function requireLandlord(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization bearer token' })
  }

  const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token)
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  req.landlordId = user.id
  next()
}
