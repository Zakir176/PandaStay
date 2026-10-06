import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

/**
 * POST /api/tenants/link-auth
 * Links a newly registered tenant auth user to their landlord-created tenant profile
 */
router.post('/link-auth', async (req, res) => {
  try {
    const { email, auth_user_id } = req.body
    if (!email || !auth_user_id) {
      return res.status(400).json({ success: false, error: 'Missing email or auth_user_id' })
    }

    const { data, error } = await supabase
      .from('tenants')
      .update({ auth_user_id })
      .ilike('email', email)
      .select()

    if (error) {
      console.error('Error linking tenant auth:', error)
      return res.status(500).json({ success: false, error: error.message })
    }

    return res.status(200).json({ success: true, updated: data })
  } catch (error) {
    console.error('Error in link-auth endpoint:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
})

export default router
