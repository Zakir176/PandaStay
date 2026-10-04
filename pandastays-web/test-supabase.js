import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('Testing Supabase Connection...')
console.log(`URL: ${supabaseUrl}`)
console.log(`Anon Key present: ${Boolean(supabaseAnonKey)}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  const startTime = Date.now()

  try {
    // 1. Check basic HTTPS reachability
    const pingStart = Date.now()
    const pingRes = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    const pingTime = Date.now() - pingStart
    console.log(`\n1. Endpoint Reachability Check: Status ${pingRes.status} ${pingRes.statusText} (${pingTime}ms)`)

    // 2. Query clean-slate tables
    const tablesToTest = ['properties', 'rooms', 'bed_spaces', 'beds', 'tenants', 'tenancies', 'payments', 'reports', 'maintenance_tickets']
    console.log('\n2. Testing Table Queries:')

    for (const table of tablesToTest) {
      const { data, error, status } = await supabase.from(table).select('*').limit(2)
      if (error) {
        console.log(`  - Table '${table}': [HTTP ${status}] ${error.message} (code: ${error.code})`)
      } else {
        console.log(`  - Table '${table}': SUCCESS! Found ${data.length} record(s). Sample:`, JSON.stringify(data[0] || {}))
      }
    }

    // 3. Test Auth Endpoint
    console.log('\n3. Testing Auth Service:')
    const { data: sessionData, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.log(`  - Auth getSession error:`, authError.message)
    } else {
      console.log(`  - Auth Service: Active & Responding (Session: ${sessionData?.session ? 'Authenticated' : 'Anonymous / No active session'})`)
    }

    const totalTime = Date.now() - startTime
    console.log(`\nConnection Test Completed in ${totalTime}ms`)
  } catch (err) {
    console.error('Connection failed with exception:', err)
  }
}

testConnection()
