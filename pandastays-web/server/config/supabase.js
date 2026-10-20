import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ccbazehbpalufrsdzecf.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV === 'production') {
  console.error('FATAL: SUPABASE_SERVICE_ROLE_KEY is required in production.')
  process.exit(1)
} else if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Notice: SUPABASE_SERVICE_ROLE_KEY is not set. Operating in development mode.')
}

const serverOpts = { auth: { persistSession: false, autoRefreshToken: false } }

// Service-role client: bypasses RLS on server.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, serverOpts)

// Anon client used solely to validate end-user JWTs.
export const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, serverOpts)
