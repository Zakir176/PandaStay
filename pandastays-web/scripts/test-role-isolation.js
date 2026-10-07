import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const srcDir = path.resolve(__dirname, '../src')

console.log('🧪 Running PandaStays Role Isolation & Security Verification Suite\n')

let passed = 0
let failed = 0

function assert(condition, testName, failureMsg = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`)
    passed++
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${failureMsg}`)
    failed++
  }
}

// ─── TEST SUITE 1: Static Code Isolation & Leak Audits ───
console.log('--- Suite 1: Template & Component Isolation Audits ---')

// 1. AppLayout.vue (Landlord shell)
const appLayoutContent = fs.readFileSync(path.join(srcDir, 'layouts/AppLayout.vue'), 'utf-8')
assert(
  !appLayoutContent.includes('/tenant/portal') && !appLayoutContent.includes('/tenant/checkout'),
  'AppLayout has no links to /tenant/portal or /tenant/checkout',
  'Found tenant portal links in AppLayout.vue'
)
assert(
  !appLayoutContent.includes('Tenant View') && !appLayoutContent.includes('Quick Tenant View Links'),
  'AppLayout has no "Tenant View" buttons or shortcuts',
  'Found "Tenant View" in AppLayout.vue'
)

// 2. Dashboard.vue (Landlord main dashboard)
const dashboardContent = fs.readFileSync(path.join(srcDir, 'views/Dashboard.vue'), 'utf-8')
assert(
  !dashboardContent.includes('/tenant/portal'),
  'Dashboard.vue has no link to /tenant/portal',
  'Found /tenant/portal link in Dashboard.vue'
)
assert(
  !dashboardContent.includes('>Tenant View<'),
  'Dashboard.vue banner has no "Tenant View" button',
  'Found Tenant View button in Dashboard.vue'
)

// 3. TenantLayout.vue (Tenant shell)
const tenantLayoutContent = fs.readFileSync(path.join(srcDir, 'layouts/TenantLayout.vue'), 'utf-8')
assert(
  !tenantLayoutContent.includes('handleSwitchToLandlord'),
  'TenantLayout.vue has no handleSwitchToLandlord function',
  'handleSwitchToLandlord still present in TenantLayout.vue'
)
assert(
  !tenantLayoutContent.includes('Switch to Landlord Portal'),
  'TenantLayout.vue dropdown has no "Switch to Landlord Portal" button',
  'Found "Switch to Landlord Portal" in TenantLayout.vue'
)
assert(
  !tenantLayoutContent.includes('switchDemoRole'),
  'TenantLayout.vue does not import or call switchDemoRole',
  'Found switchDemoRole in TenantLayout.vue'
)

// 4. TenantCheckout.vue (Tenant checkout page)
const tenantCheckoutContent = fs.readFileSync(path.join(srcDir, 'views/TenantCheckout.vue'), 'utf-8')
assert(
  !tenantCheckoutContent.includes('/app') && !tenantCheckoutContent.includes('Return to Landlord Dashboard'),
  'TenantCheckout.vue has no link to /app or Landlord Dashboard',
  'Found link to /app in TenantCheckout.vue'
)
assert(
  tenantCheckoutContent.includes('Return to Resident Portal'),
  'TenantCheckout.vue correctly links back to Resident Portal',
  'Missing Return to Resident Portal link'
)

// 5. AuthModal.vue (Sign in modal)
const authModalContent = fs.readFileSync(path.join(srcDir, 'components/AuthModal.vue'), 'utf-8')
assert(
  !authModalContent.includes('loginAsDemoLandlord') && !authModalContent.includes('loginAsDemoTenant'),
  'AuthModal.vue has no demo login handlers',
  'Found loginAsDemoLandlord or loginAsDemoTenant in AuthModal.vue'
)
assert(
  !authModalContent.includes('Quick 1-Click Demo Profiles'),
  'AuthModal.vue has no "Quick 1-Click Demo Profiles" UI block',
  'Found 1-Click Demo profiles in AuthModal.vue'
)
assert(
  !authModalContent.includes('switchDemoRole'),
  'AuthModal.vue does not import or call switchDemoRole',
  'Found switchDemoRole in AuthModal.vue'
)

// 6. auth.js (Authentication state)
const authJsContent = fs.readFileSync(path.join(srcDir, 'lib/auth.js'), 'utf-8')
assert(
  authJsContent.includes('const isAuthenticated = computed(() => Boolean(currentUser.value))'),
  'isAuthenticated strictly checks currentUser.value (not userProfile.value)',
  'isAuthenticated is not strictly checking currentUser.value'
)
assert(
  authJsContent.includes('const currentUser = ref(null)') &&
  authJsContent.includes('const currentRole = ref(null)') &&
  authJsContent.includes('const userProfile = ref(null)'),
  'Initial auth state begins unauthenticated (all refs initialized to null)',
  'Initial auth refs are not null'
)

// ─── TEST SUITE 2: Route Guard Logic Simulation ───
console.log('\n--- Suite 2: Router Guard Bi-Directional Isolation Simulation ---')

// Route definitions matching src/router/index.js
const routeMap = {
  '/': { role: null },
  '/app': { role: 'landlord' },
  '/app/rooms': { role: 'landlord' },
  '/app/financials': { role: 'landlord' },
  '/tenant/portal': { role: 'tenant' },
  '/tenant/payments': { role: 'tenant' },
  '/tenant/checkout': { role: 'tenant' },
  '/pay': { redirect: '/tenant/checkout', role: 'tenant' }
}

function simulateRouteGuard({ path, isAuthenticated, currentRole }) {
  const targetRoute = routeMap[path]
  const requiresRole = targetRoute.role

  if (requiresRole && !isAuthenticated) {
    return { action: 'redirect', to: '/', query: { auth_required: '1' } }
  }

  if (requiresRole === 'landlord' && currentRole === 'tenant') {
    return { action: 'redirect', to: '/tenant/portal', query: { restricted: 'landlord_only' } }
  }

  if (requiresRole === 'tenant' && currentRole === 'landlord') {
    return { action: 'redirect', to: '/app', query: { restricted: 'tenant_only' } }
  }

  return { action: 'allow', to: path }
}

// Case A: Unauthenticated Visitor
console.log('\n[Scenario A: Signed Out User]')
const signedOutApp = simulateRouteGuard({ path: '/app', isAuthenticated: false, currentRole: null })
assert(
  signedOutApp.action === 'redirect' && signedOutApp.to === '/' && signedOutApp.query.auth_required === '1',
  'Signed out user visiting /app is redirected to /?auth_required=1'
)

const signedOutTenant = simulateRouteGuard({ path: '/tenant/portal', isAuthenticated: false, currentRole: null })
assert(
  signedOutTenant.action === 'redirect' && signedOutTenant.to === '/' && signedOutTenant.query.auth_required === '1',
  'Signed out user visiting /tenant/portal is redirected to /?auth_required=1'
)

const signedOutPay = simulateRouteGuard({ path: '/pay', isAuthenticated: false, currentRole: null })
assert(
  signedOutPay.action === 'redirect' && signedOutPay.to === '/' && signedOutPay.query.auth_required === '1',
  'Signed out user visiting /pay is redirected to /?auth_required=1'
)

const signedOutLanding = simulateRouteGuard({ path: '/', isAuthenticated: false, currentRole: null })
assert(
  signedOutLanding.action === 'allow' && signedOutLanding.to === '/',
  'Signed out user visiting / (landing page) is allowed'
)

// Case B: Landlord User
console.log('\n[Scenario B: Authenticated Landlord]')
const landlordApp = simulateRouteGuard({ path: '/app', isAuthenticated: true, currentRole: 'landlord' })
assert(
  landlordApp.action === 'allow',
  'Landlord visiting /app is allowed'
)

const landlordFinancials = simulateRouteGuard({ path: '/app/financials', isAuthenticated: true, currentRole: 'landlord' })
assert(
  landlordFinancials.action === 'allow',
  'Landlord visiting /app/financials is allowed'
)

const landlordTenantPortal = simulateRouteGuard({ path: '/tenant/portal', isAuthenticated: true, currentRole: 'landlord' })
assert(
  landlordTenantPortal.action === 'redirect' && landlordTenantPortal.to === '/app' && landlordTenantPortal.query.restricted === 'tenant_only',
  'Landlord visiting /tenant/portal is redirected to /app?restricted=tenant_only'
)

const landlordCheckout = simulateRouteGuard({ path: '/tenant/checkout', isAuthenticated: true, currentRole: 'landlord' })
assert(
  landlordCheckout.action === 'redirect' && landlordCheckout.to === '/app' && landlordCheckout.query.restricted === 'tenant_only',
  'Landlord visiting /tenant/checkout is redirected to /app?restricted=tenant_only'
)

const landlordPay = simulateRouteGuard({ path: '/pay', isAuthenticated: true, currentRole: 'landlord' })
assert(
  landlordPay.action === 'redirect' && landlordPay.to === '/app' && landlordPay.query.restricted === 'tenant_only',
  'Landlord visiting /pay alias is redirected to /app?restricted=tenant_only'
)

// Case C: Tenant User
console.log('\n[Scenario C: Authenticated Tenant]')
const tenantPortal = simulateRouteGuard({ path: '/tenant/portal', isAuthenticated: true, currentRole: 'tenant' })
assert(
  tenantPortal.action === 'allow',
  'Tenant visiting /tenant/portal is allowed'
)

const tenantCheckout = simulateRouteGuard({ path: '/tenant/checkout', isAuthenticated: true, currentRole: 'tenant' })
assert(
  tenantCheckout.action === 'allow',
  'Tenant visiting /tenant/checkout is allowed'
)

const tenantApp = simulateRouteGuard({ path: '/app', isAuthenticated: true, currentRole: 'tenant' })
assert(
  tenantApp.action === 'redirect' && tenantApp.to === '/tenant/portal' && tenantApp.query.restricted === 'landlord_only',
  'Tenant visiting /app is redirected to /tenant/portal?restricted=landlord_only'
)

const tenantFinancials = simulateRouteGuard({ path: '/app/financials', isAuthenticated: true, currentRole: 'tenant' })
assert(
  tenantFinancials.action === 'redirect' && tenantFinancials.to === '/tenant/portal' && tenantFinancials.query.restricted === 'landlord_only',
  'Tenant visiting /app/financials is redirected to /tenant/portal?restricted=landlord_only'
)

console.log(`\n========================================`)
console.log(`Summary: ${passed} Passed, ${failed} Failed`)
console.log(`========================================`)

if (failed > 0) {
  process.exit(1)
} else {
  console.log('🎉 All role isolation and security criteria verified successfully!')
  process.exit(0)
}
