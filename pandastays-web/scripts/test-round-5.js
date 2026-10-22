// Round-5 regression tests.
process.env.NODE_ENV = 'development'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'

import fs from 'fs'
import path from 'path'
import http from 'http'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(root, p), 'utf-8')

let passed = 0
let failed = 0
function assert(cond, name, detail = '') {
  if (cond) { console.log(`  ✅ PASS: ${name}`); passed++ }
  else { console.error(`  ❌ FAIL: ${name} ${detail}`); failed++ }
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walk(full, out)
    else if (/\.(js|vue|css|html)$/.test(e.name)) out.push(full)
  }
  return out
}

console.log('🧪 Round 5 regression suite\n')

// ── R5-1 vercel.json ──
console.log('--- R5-1: vercel.json ---')
const vercel = JSON.parse(read('vercel.json'))
const apiRule = vercel.rewrites.find(r => r.source.startsWith('/api'))
assert(!!apiRule && !apiRule.destination.startsWith('/'), 'API rewrite points to an external backend, not itself')
assert(vercel.rewrites[vercel.rewrites.length - 1].destination === '/index.html', 'SPA catch-all is last')
assert(/^# NODE_ENV=production/m.test(read('.env.example')), '.env.example has NODE_ENV commented out')

// ── R5-2 / R5-5 forbidden strings in src ──
console.log('\n--- R5-2 / R5-5: fabricated data ---')
const srcFiles = walk(path.join(root, 'src'))
for (const needle of ['sub_default_mukuba_house', '392819/11/1', '+260 96 0000000', "|| 'Guardian'", 'ten-${Date.now()}']) {
  const hits = srcFiles.filter(f => fs.readFileSync(f, 'utf-8').includes(needle))
  assert(hits.length === 0, `"${needle}" absent from src/`, hits.join(', '))
}
const settings = read('src/views/Settings.vue')
assert(!settings.includes('Verified Gateway Sub-Account'), 'Settings has no "Verified" payout badge')
assert(settings.includes('Not activated yet'), 'Settings shows neutral "Not activated yet"')

const tenantSvc = read('src/services/tenantService.js')
assert(!tenantSvc.includes('.or('), 'tenantService has no .or() interpolation')
assert(!/ilike/i.test(tenantSvc), 'tenantService does not use ilike')
assert(tenantSvc.includes(".eq('email', fields.email)"), 'tenantService looks up by exact normalized email')
assert(!/\.update\(/.test(tenantSvc.split('async onboardTenant')[0]), 'matched tenant is never updated')
const store = read('src/lib/store.js')
assert(store.includes('tenantService.onboardTenant'), 'store.js delegates tenant creation to tenantService')
assert(!/from\('tenants'\)\.insert/.test(store), 'store.js has no duplicate tenant insert')

// ── R5-3 guard ──
console.log('\n--- R5-3: guard & pending role ---')
const { resolveGuardRedirect } = await import('../src/router/guard.js')
const g = (requiresRole, isAuthenticated, currentRole, to) => resolveGuardRedirect({ requiresRole, isAuthenticated, currentRole, to })
for (const target of ['landlord', 'tenant']) {
  const r = g(target, true, null)
  assert(r?.path === '/account-pending', `null role cannot open ${target} routes -> /account-pending`, JSON.stringify(r))
}
assert(g('landlord', false, null)?.query?.auth_required === '1', 'signed-out still redirected to login')
assert(g('landlord', true, 'landlord') === null, 'landlord allowed on /app')
assert(g('tenant', true, 'tenant') === null, 'tenant allowed on /tenant')
assert(g('landlord', true, 'tenant')?.path === '/tenant/portal', 'tenant blocked from /app')
assert(g('tenant', true, 'landlord')?.path === '/app', 'landlord blocked from /tenant')
assert(g('landlord', true, 'admin')?.path === '/account-pending', 'unknown role gets no access')
const authSrc = read('src/lib/auth.js')
assert(!authSrc.includes("metaRole || 'landlord'"), 'auth.js no longer defaults role from user_metadata')
assert(/currentRole\.value = null[\s\S]*pendingHint/.test(authSrc), 'auth.js falls back to null role')

// ── R5-4 migration ──
console.log('\n--- R5-4: link_tenant_profile ---')
const mig = read('supabase/migrations/20261022_security_round_5.sql')
const reset = read('supabase/schema.reset.sql')
for (const [name, sql] of [['migration', mig], ['schema.reset.sql', reset]]) {
  const fn = sql.slice(sql.indexOf('link_tenant_profile()'))
  assert(/AND auth_user_id IS NULL;/.test(fn) && !/auth_user_id != auth\.uid\(\)/.test(fn), `${name}: only claims unlinked rows`)
}
assert(/CREATE OR REPLACE FUNCTION public\.link_tenant_profile/.test(mig), 'migration uses CREATE OR REPLACE FUNCTION')

// ── R5-6 alerts ──
console.log('\n--- R5-6: needs_review alert ---')
let received = null
const srv = http.createServer((req, res) => {
  let b = ''
  req.on('data', c => (b += c))
  req.on('end', () => { received = JSON.parse(b); res.end('ok') })
})
await new Promise(r => srv.listen(0, r))
process.env.ALERT_WEBHOOK_URL = `http://127.0.0.1:${srv.address().port}/hook`
const { alertNeedsReview } = await import('../server/services/alerts.js')
const result = await alertNeedsReview({ reference: 'PS-test', expectedAmount: 100, receivedAmount: 50, source: 'webhook' })
srv.close()
assert(result.sent === true && /needs review/i.test(received?.text || ''), 'alertNeedsReview posts to ALERT_WEBHOOK_URL', JSON.stringify(result))
assert(read('server/routes/webhooks.js').includes('alertNeedsReview('), 'webhook route sends the alert')
assert(read('server/services/reconciliation.js').includes('alertNeedsReview('), 'reconciliation sends the alert')
assert(read('src/utils/formatters.js').includes("'needs_review': return 'Under review'") || read('src/utils/formatters.js').includes("case 'needs_review': return 'Under review'"), 'UI label for needs_review is "Under review"')

// ── R5-7 destructive schema ──
console.log('\n--- R5-7: destructive schema isolation ---')
assert(!fs.existsSync(path.join(root, 'supabase/schema.sql')), 'schema.sql no longer exists under that name')
assert(reset.slice(0, 600).includes('DESTRUCTIVE'), 'schema.reset.sql starts with a loud banner')
const readme = read('supabase/README.md')
const procedure = readme.split('## `schema.reset.sql`')[0]
assert(!procedure.includes('schema.reset.sql'), 'live procedure never mentions schema.reset.sql')
const order = ['20261020_security_round_3', '20261021_security_round_4', '20261022_security_round_5'].map(s => procedure.indexOf(s))
assert(order.every(i => i >= 0) && order[0] < order[1] && order[1] < order[2], 'README lists migrations in filename order')

console.log(`\nSummary: ${passed} Passed, ${failed} Failed`)
process.exit(failed > 0 ? 1 : 0)
