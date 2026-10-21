import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const isDev = process.env.NODE_ENV === 'development'
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ccbazehbpalufrsdzecf.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseServiceKey) {
  if (!isDev) {
    console.error('FATAL: SUPABASE_SERVICE_ROLE_KEY is required in non-development environments.')
    process.exit(1)
  } else {
    console.warn('Notice: SUPABASE_SERVICE_ROLE_KEY is not set. Operating in development mode with service key placeholder.')
  }
}

const serverOpts = { auth: { persistSession: false, autoRefreshToken: false } }

// Service-role client: strictly uses SUPABASE_SERVICE_ROLE_KEY (never falls back to anon key)
export const supabase = createClient(supabaseUrl, supabaseServiceKey || 'missing-service-role-key', serverOpts)

// Anon client used solely to validate end-user JWTs.
export const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey || 'missing-anon-key', serverOpts)
