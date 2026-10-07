import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 'https://ccbazehbpalufrsdzecf.supabase.co'
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYmF6ZWhicGFsdWZyc2R6ZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTUyNTQsImV4cCI6MjEwMTQzMTI1NH0.Dmm4c2e7QmRnqrx95pKJsSFZAkbr1yzdNWXR1Dvzkqc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
