// Round-4 regression tests. These call the REAL production code (no inline reimplementation).
// Env is set BEFORE the modules load because they read keys at import time.
process.env.NODE_ENV = 'development'
process.env.LENCO_SECRET_KEY = 'test_lenco_secret_for_round4'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'
process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key'

import crypto from 'crypto'

let passed = 0
let failed = 0
function assert(cond, name, detail = '') {
  if (cond) { console.log(`  ✅ PASS: ${name}`); passed++ }
  else { console.error(`  ❌ FAIL: ${name} ${detail}`); failed++ }
}

console.log('🧪 Round 4 regression suite\n')

const { verifyLencoSignature } = await import('../server/services/lenco.js')
const { ALLOWED_PAYMENT_METHODS, buildManualReference } = await import('../server/routes/payments.js')

// Webhook signature: valid / tampered / missing
const body = { event: 'collection.successful', data: { reference: 'PS-abc', amount: '100' } }
const raw = Buffer.from(JSON.stringify(body))
const hashKey = crypto.createHash('sha256').update(process.env.LENCO_SECRET_KEY).digest('hex')
const goodSig = crypto.createHmac('sha512', hashKey).update(raw).digest('hex')

assert(verifyLencoSignature({ headers: { 'x-lenco-signature': goodSig }, rawBody: raw, body }), 'valid signature accepted')
assert(!verifyLencoSignature({ headers: { 'x-lenco-signature': 'deadbeef' }, rawBody: raw, body }), 'bad signature rejected')
assert(!verifyLencoSignature({ headers: {}, rawBody: raw, body }), 'missing signature rejected')

// Allow-list (imported from the real route)
assert(Array.isArray(ALLOWED_PAYMENT_METHODS) && ALLOWED_PAYMENT_METHODS.includes('momo_mtn'), 'allow-list includes momo_mtn')
assert(!ALLOWED_PAYMENT_METHODS.includes('crypto') && !ALLOWED_PAYMENT_METHODS.includes("'; DROP TABLE"), 'allow-list rejects unknown methods')

// Reference prefix (real function)
const r1 = buildManualReference('PS-realref')
const r2 = buildManualReference('MANUAL-x/../<script>')
const r3 = buildManualReference('')
assert(r1.startsWith('MANUAL-'), 'client ref gets MANUAL- prefix', r1)
assert(/^MANUAL-[a-zA-Z0-9-_]+$/.test(r2), 'client ref is sanitized', r2)
assert(r3.startsWith('MANUAL-') && r3.length > 'MANUAL-'.length + 8, 'empty ref still prefixed and random', r3)
assert(!buildManualReference('PS-realref').startsWith('PS-'), 'manual refs can never look like Lenco refs')

console.log(`\nSummary: ${passed} Passed, ${failed} Failed`)
process.exit(failed > 0 ? 1 : 0)
