import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runRlsVerification() {
  console.log('==============================================================================')
  console.log('PANDASTAYS RLS & SECURITY ACCEPTANCE VERIFICATION')
  console.log('==============================================================================\n')

  // ----------------------------------------------------------------------------
  // TEST 3: Attempt direct client-side insert into payments (must be REJECTED)
  // ----------------------------------------------------------------------------
  console.log('[TEST 3] Testing Direct Client-Side Insert into "payments" Table...')
  const dummyPayment = {
    tenancy_id: '66666666-0000-4000-8000-000000000001',
    amount: 99999,
    paid_at: new Date().toISOString(),
    method: 'momo_mtn',
    gateway_reference: 'UNAUTHORIZED-CLIENT-INJECTION',
    status: 'success',
    receipt_number: `REC-FAKE-${Date.now()}`
  }

  const { data: injectedData, error: injectError } = await supabase
    .from('payments')
    .insert(dummyPayment)
    .select()

  if (injectError) {
    console.log('  >>> SUCCESS: Direct client insert into payments was REJECTED by RLS!')
    console.log(`      Error: [${injectError.code}] ${injectError.message}`)
  } else {
    console.error('  >>> FAIL: Direct client insert into payments succeeded! RLS is not yet blocking writes:', injectedData)
  }

  // ----------------------------------------------------------------------------
  // TEST 4: Verify CSS token in style.css
  // ----------------------------------------------------------------------------
  console.log('\n[TEST 4] Verifying CSS surface-container-high Token in style.css...')
  import('fs').then(fs => {
    const css = fs.readFileSync('./src/style.css', 'utf-8')
    const match = css.match(/--color-surface-container-high:\s*(#[0-9A-Fa-f]+);/)
    if (match && match[1].length === 7) { // # + 6 hex chars
      console.log(`  >>> SUCCESS: Valid 6-digit hex token detected: ${match[1]}`)
    } else {
      console.error(`  >>> FAIL: Invalid token found: ${match ? match[1] : 'not found'}`)
    }
  })

  // ----------------------------------------------------------------------------
  // TEST 1: Two Landlord Accounts (A and B) Scoping Test
  // ----------------------------------------------------------------------------
  console.log('\n[TEST 1] Testing Landlord A vs Landlord B Isolation...')
  const landlordAEmail = `landlord.a.${Date.now()}@gmail.com`
  const landlordBEmail = `landlord.b.${Date.now()}@gmail.com`
  const testPassword = 'PandaStaysPassword2026!'

  // Signup Landlord A
  console.log(`  - Creating Landlord A: ${landlordAEmail}`)
  const { data: authA, error: errA } = await supabase.auth.signUp({
    email: landlordAEmail,
    password: testPassword,
    options: {
      data: { name: 'Landlord A', role: 'landlord' }
    }
  })

  if (errA) {
    console.log(`    Note on signup A: ${errA.message}`)
  } else {
    console.log(`    Signup A user: ${authA.user?.id}, session exists: ${Boolean(authA.session)}`)
  }

  // Client for Landlord A
  const clientA = createClient(supabaseUrl, supabaseAnonKey)
  const { data: sessionA, error: loginErrA } = await clientA.auth.signInWithPassword({
    email: landlordAEmail,
    password: testPassword
  })

  if (loginErrA) {
    console.log(`    Login A note: ${loginErrA.message}`)
  }

  if (sessionA?.session) {
    console.log('    Logged in as Landlord A.')
    // Landlord A creates a property
    const propId = crypto.randomUUID()
    const { data: propA, error: propErrA } = await clientA.from('properties').insert({
      id: propId,
      landlord_id: sessionA.user.id,
      name: 'Landlord A Exclusive Villa',
      address: 'Plot 10, Kabulonga, Lusaka'
    }).select().single()

    if (propErrA) {
      console.log(`    Property creation note: ${propErrA.message}`)
    } else {
      console.log(`    Created Property A: "${propA.name}" (ID: ${propA.id})`)

      // Landlord A creates room
      const { data: roomA } = await clientA.from('rooms').insert({
        property_id: propA.id,
        room_number: '101',
        capacity: 2
      }).select().single()

      if (roomA) {
        console.log(`    Created Room 101 under Property A.`)
      }
    }

    // Now Signup Landlord B
    console.log(`\n  - Creating Landlord B: ${landlordBEmail}`)
    await supabase.auth.signUp({
      email: landlordBEmail,
      password: testPassword,
      options: {
        data: { name: 'Landlord B', role: 'landlord' }
      }
    })

    const clientB = createClient(supabaseUrl, supabaseAnonKey)
    const { data: sessionB } = await clientB.auth.signInWithPassword({
      email: landlordBEmail,
      password: testPassword
    })

    if (sessionB?.session) {
      console.log('    Logged in as Landlord B.')

      // Landlord B queries properties
      const { data: propsB } = await clientB.from('properties').select('*')
      const seesPropertyA = propsB?.some(p => p.landlord_id === sessionA.user.id)
      console.log(`    Landlord B properties count: ${propsB?.length || 0}`)
      if (!seesPropertyA) {
        console.log('  >>> SUCCESS: Landlord B sees 0 properties from Landlord A!')
      } else {
        console.error('  >>> FAIL: Landlord B can see Landlord A property!')
      }

      // Landlord B queries rooms
      const { data: roomsB } = await clientB.from('rooms').select('*')
      console.log(`    Landlord B rooms count: ${roomsB?.length || 0}`)
      if (roomsB?.length === 0) {
        console.log('  >>> SUCCESS: Landlord B sees 0 rooms from Landlord A!')
      } else {
        console.error('  >>> FAIL: Landlord B can see rooms from Landlord A!')
      }
    }
  }

  console.log('\n==============================================================================')
  console.log('TEST SUITE EXECUTION COMPLETE')
  console.log('==============================================================================')
}

runRlsVerification()
